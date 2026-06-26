import { useState } from "react";
import { useTheme }  from "../../Components/ThemeContext";
import { TOUR_KEY }  from "../../Components/Tour";
import useUser       from "../../Components/useUser";
import Tooltip       from "../../Components/Tooltip";
import {
  getSession,
  getActivityLog,
  clearActivityLog,
  pushActivity,
} from "../../Components/useSessionManager";
import {
  getLogSummary,
  downloadLogs,
  clearAllLogs,
  clearLogByKey,
} from "../../logger/LogStore";

// ── helper ────────────────────────────────────────────────
function fmt(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    + " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function elapsed(iso) {
  if (!iso) return "—";
  const sec = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (sec < 60)   return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

const TYPE_META = {
  page_visit: { icon: "fa-solid fa-arrow-right",       color: "var(--primary)",     bg: "var(--primary-light)"  },
  session:    { icon: "fa-solid fa-shield-halved",      color: "var(--info)",        bg: "var(--info-bg)"        },
  action:     { icon: "fa-solid fa-bolt",               color: "var(--warning)",     bg: "var(--warning-bg)"     },
  error:      { icon: "fa-solid fa-circle-exclamation", color: "var(--danger)",      bg: "var(--danger-bg)"      },
};

function SettingRow({ icon, iconBg, iconColor, label, sub, action }) {
  return (
    <div className="st-row">
      <div className="st-row-left">
        <div className="st-row-icon" style={{ background: iconBg }}>
          <i className={icon} style={{ color: iconColor }} />
        </div>
        <div>
          <p className="st-row-label">{label}</p>
          {sub && <p className="st-row-sub">{sub}</p>}
        </div>
      </div>
      <div className="st-row-action">{action}</div>
    </div>
  );
}

function SettingsPage() {
  const { dark, toggleTheme, addToast } = useTheme();
  const user = useUser();

  const [log,     setLog]     = useState(() => getActivityLog());
  const [session, setSession] = useState(() => getSession());
  const [logSummary, setLogSummary] = useState(() => getLogSummary());

  const displayName  = user.name  || "Admin User";
  const displayEmail = user.email || "admin@company.com";
  const displayRole  = user.role  || "Administrator";

  const handleStartTour = () => {
    const tourKey = user.userId ? `${TOUR_KEY}_${user.userId}` : TOUR_KEY;
    localStorage.removeItem(tourKey);
    pushActivity("action", "Started guided tour");
    addToast("Tour restarted!", "info");
    setTimeout(() => window.location.reload(), 800);
  };

  const handleLogout = () => {
    pushActivity("session", "User signed out");
    addToast("You have been signed out. See you soon! 👋", "info");
    setTimeout(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      window.location.href = "/";
    }, 900);
  };

  const handleClearData = () => {
    ["lms_clients", "lms_products", "lms_licenses", "lms_profile"].forEach((k) =>
      localStorage.removeItem(k)
    );
    addToast("All local data has been reset to defaults.", "warning");
    setTimeout(() => window.location.reload(), 900);
  };

  const handleClearLog = () => {
    clearActivityLog();
    setLog([]);
    addToast("Activity log cleared.", "info");
  };

  const refreshLog = () => {
    setLog(getActivityLog());
    setSession(getSession());
    setLogSummary(getLogSummary());
  };

  // Session duration
  const sessionDuration = () => {
    if (!session?.loginTime) return "—";
    const sec = Math.floor((Date.now() - session.loginTime) / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="st-page">

      <div className="st-page-header">
        <h2 className="st-page-title">Settings</h2>
        <p className="st-page-sub">Manage your preferences, session and account options.</p>
      </div>

      {/* ── Appearance ── */}
      <div className="st-section">
        <div className="st-section-header">
          <i className="fa-solid fa-palette" />
          <h3 className="st-section-title">Appearance</h3>
        </div>
        <SettingRow
          icon={`fa-solid ${dark ? "fa-moon" : "fa-sun"}`}
          iconBg={dark ? "var(--surface-2)" : "#fef7e0"}
          iconColor={dark ? "#b5c4a1" : "#9a6e2e"}
          label={dark ? "Dark Mode" : "Light Mode"}
          sub="Switch between light and dark theme"
          action={
            <button
              className={`pf-toggle${dark ? " pf-toggle--on" : ""}`}
              onClick={() => { toggleTheme(); addToast(`Switched to ${dark ? "Light" : "Dark"} Mode`, "info"); }}
            >
              <span className="pf-toggle-thumb" />
            </button>
          }
        />
      </div>

      {/* ── Account ── */}
      <div className="st-section">
        <div className="st-section-header">
          <i className="fa-solid fa-circle-user" />
          <h3 className="st-section-title">Account</h3>
        </div>
        <SettingRow icon="fa-solid fa-user-shield"  iconBg="var(--primary-light)" iconColor="var(--primary-dark)" label="Role"         sub={displayRole}                action={<span className="st-badge st-badge--green">Active</span>} />
        <SettingRow icon="fa-regular fa-envelope"   iconBg="var(--info-bg)"       iconColor="var(--info)"         label="Email"        sub={displayEmail}               action={<span className="st-badge st-badge--blue">Verified</span>} />
        <SettingRow icon="fa-solid fa-id-badge"     iconBg="var(--surface-2)"     iconColor="var(--text-muted)"   label="User ID"      sub={user.userId || "USR-001"}   action={null} />
        <SettingRow icon="fa-solid fa-user"         iconBg="var(--primary-light)" iconColor="var(--primary)"      label="Display Name" sub={displayName}                action={null} />
      </div>

      {/* ── Session Management ── */}
      <div className="st-section">
        <div className="st-section-header">
          <i className="fa-solid fa-clock-rotate-left" />
          <h3 className="st-section-title">Session Management</h3>
        </div>

        <SettingRow
          icon="fa-solid fa-calendar-check"
          iconBg="var(--success-bg)"
          iconColor="var(--success)"
          label="Login Time"
          sub={session?.loginTime ? fmt(new Date(session.loginTime).toISOString()) : "—"}
          action={null}
        />
        {/* <SettingRow
          icon="fa-solid fa-stopwatch"
          iconBg="var(--primary-light)"
          iconColor="var(--primary)"
          label="Session Duration"
          sub={sessionDuration()}
          action={
            <Tooltip text="Refresh" position="left">
              <button className="st-btn st-btn--ghost-sm" onClick={refreshLog}>
                <i className="fa-solid fa-rotate-right" />
              </button>
            </Tooltip>
          }
        /> */}
        <SettingRow
          icon="fa-solid fa-hourglass-half"
          iconBg="var(--warning-bg)"
          iconColor="var(--warning)"
          label="Auto Logout"
          sub="Session expires after 15 minutes of inactivity"
          action={<span className="st-badge st-badge--warn">15 min</span>}
        />
        <SettingRow
          icon="fa-solid fa-right-from-bracket"
          iconBg="var(--danger-bg)"
          iconColor="var(--danger)"
          label="Sign Out"
          sub="End your current session and return to login"
          action={
            <button className="st-btn st-btn--danger" onClick={handleLogout}>
              <i className="fa-solid fa-power-off" /> Sign Out
            </button>
          }
        />
      </div>

      {/* ── User Activity Log ── 
      <div className="st-section">
        <div className="st-section-header" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-list-check" />
            <h3 className="st-section-title">User Activity Log</h3>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Tooltip text="Refresh" position="bottom">
              <button className="st-btn st-btn--ghost-sm" onClick={refreshLog}>
                <i className="fa-solid fa-rotate-right" />
              </button>
            </Tooltip>
            {log.length > 0 && (
              <Tooltip text="Clear log" position="bottom">
                <button className="st-btn st-btn--ghost-sm st-btn--danger-ghost" onClick={handleClearLog}>
                  <i className="fa-solid fa-trash-can" />
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {log.length === 0 ? (
          <div className="st-log-empty">
            <i className="fa-solid fa-inbox" />
            <span>No activity recorded yet.</span>
          </div>
        ) : (
          <div className="st-log-list">
            {log.map((entry) => {
              const meta = TYPE_META[entry.type] || TYPE_META.action;
              return (
                <div key={entry.id} className="st-log-row">
                  <div className="st-log-icon" style={{ background: meta.bg }}>
                    <i className={meta.icon} style={{ color: meta.color }} />
                  </div>
                  <div className="st-log-body">
                    <span className="st-log-detail">{entry.detail}</span>
                    <span className="st-log-page">{entry.page}</span>
                  </div>
                  <span className="st-log-time">{elapsed(entry.timestamp)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>*/}

      {/* ── Guided Tour ── */}
      <div className="st-section">
        <div className="st-section-header">
          <i className="fa-solid fa-map" />
          <h3 className="st-section-title">Guided Tour</h3>
        </div>
        <SettingRow
          icon="fa-solid fa-route"
          iconBg="var(--primary-light)"
          iconColor="var(--primary)"
          label="App Tour"
          sub="Re-run the interactive walkthrough of the app"
          action={
            <button className="st-btn st-btn--primary" onClick={handleStartTour}>
              <i className="fa-solid fa-play" /> Start Tour
            </button>
          }
        />
      </div>

      {/* ── Application Logs ── */}
      <div className="st-section">
        <div className="st-section-header" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-file-lines" />
            <h3 className="st-section-title">Application Logs</h3>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Tooltip text="Refresh" position="bottom">
              <button className="st-btn st-btn--ghost-sm" onClick={refreshLog}>
                <i className="fa-solid fa-rotate-right" />
              </button>
            </Tooltip>
            <Tooltip text="Download all logs" position="bottom">
              <button className="st-btn st-btn--ghost-sm" onClick={() => downloadLogs()}>
                <i className="fa-solid fa-download" />
              </button>
            </Tooltip>
            {logSummary.length > 0 && (
              <Tooltip text="Clear all logs" position="bottom">
                <button className="st-btn st-btn--ghost-sm st-btn--danger-ghost" onClick={() => { clearAllLogs(); setLogSummary([]); addToast("All logs cleared.", "info"); }}>
                  <i className="fa-solid fa-trash-can" />
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {logSummary.length === 0 ? (
          <div className="st-log-empty">
            <i className="fa-solid fa-inbox" />
            <span>No log files yet.</span>
          </div>
        ) : (
          <div className="st-log-list">
            {logSummary.map((s) => (
              <div key={s.key} className="st-log-row">
                <div className="st-log-icon" style={{ background: "var(--primary-light)" }}>
                  <i className="fa-solid fa-file-lines" style={{ color: "var(--primary)" }} />
                </div>
                <div className="st-log-body">
                  <span className="st-log-detail">lms-logs-{s.date}.log</span>
                  <span className="st-log-page">
                    {s.total} entries &nbsp;·&nbsp;
                    <span style={{ color: "var(--danger)" }}>{s.errors} errors</span>
                    &nbsp;·&nbsp;
                    <span style={{ color: "var(--warning)" }}>{s.warns} warnings</span>
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Tooltip text="Download" position="left">
                    <button className="st-btn st-btn--ghost-sm" onClick={() => downloadLogs(s.key)}>
                      <i className="fa-solid fa-download" />
                    </button>
                  </Tooltip>
                  <Tooltip text="Delete" position="left">
                    <button className="st-btn st-btn--ghost-sm st-btn--danger-ghost" onClick={() => { clearLogByKey(s.key); setLogSummary(getLogSummary()); addToast(`Log ${s.date} deleted.`, "info"); }}>
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Danger Zone ── */}
      <div className="st-section st-section--danger">
        <div className="st-section-header">
          <i className="fa-solid fa-triangle-exclamation" style={{ color: "var(--danger)" }} />
          <h3 className="st-section-title" style={{ color: "var(--danger)" }}>Danger Zone</h3>
        </div>
        <SettingRow
          icon="fa-solid fa-rotate-left"
          iconBg="var(--danger-bg)"
          iconColor="var(--danger)"
          label="Reset Local Data"
          sub="Clears all locally stored clients, products, licenses and profile data. Cannot be undone."
          action={
            <button className="st-btn st-btn--danger-outline" onClick={handleClearData}>
              <i className="fa-solid fa-trash-can" /> Reset Data
            </button>
          }
        />
      </div>

    </div>
  );
}

export default SettingsPage;
