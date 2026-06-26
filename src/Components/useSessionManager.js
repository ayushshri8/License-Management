
import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";

export const SESSION_KEY       = "lms_session";
export const LICENSE_STORE_KEY = "lms_license_responses";

const IDLE_WARN   = 1 * 60 * 1000;  
const IDLE_LIMIT  = 3 * 60 * 1000;  
const TICK_MS     = 1000;

const PAGE_NAMES = {
  "/dashboard": "Dashboard",
  "/clients":   "Clients",
  "/products":  "Products",
  "/licenses":  "Licenses",
  "/profile":   "Profile",
  "/settings":  "Settings",
};

// ── Session helpers ───────────────────────────────────────
export const getSession = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
};

const saveSession = (patch) => {
  const cur = getSession() || {};
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ...cur, ...patch }));
};

export const storeLicenseResponse = (endpoint, response) => {
  try {
    const store = JSON.parse(localStorage.getItem(LICENSE_STORE_KEY) || "{}");
    store[endpoint] = { response, savedAt: new Date().toISOString() };
    localStorage.setItem(LICENSE_STORE_KEY, JSON.stringify(store));
  } catch { /* silent */ }
};

// ── Activity log helpers (used by Settings) ──────────────────
export const ACTIVITY_KEY = "lms_activity_log";

export const getActivityLog = () => {
  try { return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]"); }
  catch { return []; }
};

export const pushActivity = (type, detail) => {
  const log_ = getActivityLog();
  log_.unshift({ id: Date.now(), type, detail, timestamp: new Date().toISOString(), page: window.location.pathname });
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(log_.slice(0, 100)));
};

export const clearActivityLog = () => localStorage.removeItem(ACTIVITY_KEY);

// ── Plain logger ──────────────────────────────────────────
const log = (category, message, data) => {
  const time = new Date().toLocaleTimeString("en-US", { hour12: false });
  if (data !== undefined) {
    console.log(`[${time}] [${category}] ${message}`, data);
  } else {
    console.log(`[${time}] [${category}] ${message}`);
  }
};

// ── Hook ─────────────────────────────────────────────────
function useSessionManager({ isLoggedIn, onWarn, onExpire }) {
  const location     = useLocation();
  const warnTimer    = useRef(null);
  const expireTimer  = useRef(null);
  const tickTimer    = useRef(null);
  const idleSecRef   = useRef(0);
  const statusRef    = useRef("ACTIVE");
  const warnedRef    = useRef(false);
  const loginTimeRef = useRef(getSession()?.loginTime || Date.now());
  const lastEventRef = useRef(""); // track last event type to avoid spam

  const resetIdle = useCallback((eventType) => {
    if (!isLoggedIn) return;

    const wasInactive = statusRef.current === "INACTIVE";

    // Log the activity event (throttle mousemove spam — only log if changed)
    if (eventType && eventType !== "mousemove") {
      log("ACTIVITY", `${eventType} detected`);
    } else if (eventType === "mousemove" && lastEventRef.current !== "mousemove") {
      log("ACTIVITY", "mousemove detected");
    }
    lastEventRef.current = eventType || "";

    if (wasInactive) {
      statusRef.current = "ACTIVE";
      log("SESSION", `User became ACTIVE again (was idle for ${idleSecRef.current}s)`);
      saveSession({ status: "ACTIVE", lastActive: Date.now() });
    }

    idleSecRef.current = 0;
    warnedRef.current  = false;

    clearTimeout(warnTimer.current);
    clearTimeout(expireTimer.current);
    clearInterval(tickTimer.current);

    // Tick every second — log idle time
    tickTimer.current = setInterval(() => {
      idleSecRef.current += 1;
      const idle = idleSecRef.current;

      // Mark INACTIVE after 15s
      if (idle === 15 && statusRef.current === "ACTIVE") {
        statusRef.current = "INACTIVE";
        saveSession({ status: "INACTIVE" });
        log("SESSION", "User is INACTIVE (no activity for 15s)");
      }

      // Log every 10s while inactive
      if (idle % 10 === 0 && statusRef.current === "INACTIVE") {
        log("SESSION", `Still idle... ${idle}s / ${IDLE_WARN / 1000}s before popup`);
      }
    }, TICK_MS);

    // Warn at 1 min
    warnTimer.current = setTimeout(() => {
      if (!warnedRef.current) {
        warnedRef.current = true;
        log("SESSION", `Idle for ${IDLE_WARN / 1000}s — showing inactivity popup`);
        onWarn?.();
      }
    }, IDLE_WARN);

    // Auto logout at 3 min
    expireTimer.current = setTimeout(() => {
      clearInterval(tickTimer.current);
      log("SESSION", `Session expired after ${IDLE_LIMIT / 1000}s of inactivity — auto logout`);
      saveSession({ status: "EXPIRED", expiredAt: new Date().toISOString() });
      onExpire?.();
    }, IDLE_LIMIT);

  }, [isLoggedIn, onWarn, onExpire]);

  // ── Attach listeners ──────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    log("SESSION", "Session started", {
      user:      user.name || "Unknown",
      userId:    user.userId || "—",
      loginTime: new Date(loginTimeRef.current).toLocaleTimeString(),
      page:      window.location.pathname,
    });

    saveSession({
      loginTime:  loginTimeRef.current,
      lastActive: Date.now(),
      status:     "ACTIVE",
    });

    const handlers = {
      mousemove:   () => resetIdle("mousemove"),
      mousedown:   () => resetIdle("mousedown"),
      click:       () => resetIdle("click"),
      keydown:     (e) => { log("ACTIVITY", `keydown: key="${e.key}"`); resetIdle("keydown"); },
      scroll:      () => resetIdle("scroll"),
      touchstart:  () => resetIdle("touchstart"),
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      window.addEventListener(event, handler, { passive: true });
    });

    resetIdle("init");

    // Tab visibility
    const onVisibility = () => {
      if (document.hidden) {
        log("BROWSER", "Tab hidden (switched tab or minimized browser)", { idleSeconds: idleSecRef.current });
        saveSession({ tabHiddenAt: new Date().toISOString() });
      } else {
        log("BROWSER", "Tab visible again", { idleSeconds: idleSecRef.current });
        saveSession({ tabVisibleAt: new Date().toISOString() });
        resetIdle("tab-visible");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Browser focus / blur
    const onFocus = () => {
      log("BROWSER", "Browser window focused (came back from another app)", { idleSeconds: idleSecRef.current });
      resetIdle("window-focus");
    };
    const onBlur = () => {
      log("BROWSER", "Browser window lost focus (moved to another app)", { idleSeconds: idleSecRef.current });
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur",  onBlur);

    // Browser / tab close
    const onUnload = () => {
      log("BROWSER", "Browser tab closed or page unloaded");
      saveSession({ closedAt: new Date().toISOString(), status: "CLOSED" });
    };
    window.addEventListener("beforeunload", onUnload);

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        window.removeEventListener(event, handler);
      });
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus",         onFocus);
      window.removeEventListener("blur",          onBlur);
      window.removeEventListener("beforeunload",  onUnload);
      clearTimeout(warnTimer.current);
      clearTimeout(expireTimer.current);
      clearInterval(tickTimer.current);
    };
  }, [isLoggedIn, resetIdle]);

  // ── Navigation tracking ───────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) return;
    const name = PAGE_NAMES[location.pathname] || location.pathname;
    log("NAVIGATION", `Navigated to ${name}`, {
      path:      location.pathname,
      timestamp: new Date().toLocaleTimeString(),
      status:    statusRef.current,
    });
    resetIdle("navigation");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isLoggedIn]);
}

export default useSessionManager;
