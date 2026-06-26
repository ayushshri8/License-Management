
const MAX_ENTRIES = 500;
const LS_PREFIX   = "lms_log_";

// ── Helpers ──────────────────────────────────────────────────
const todayKey = () => {
  const d = new Date();
  return `${LS_PREFIX}${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const readLog = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch { return []; }
};

const writeLog = (key, entries) => {
  try { localStorage.setItem(key, JSON.stringify(entries)); }
  catch { /* storage full */ }
};

const serialize = (val) => {
  if (val === null || val === undefined) return String(val);
  if (typeof val === "string")  return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  try { return JSON.stringify(val); }
  catch { return String(val); }
};

// ── Push one entry ────────────────────────────────────────────
const push = (level, args) => {
  const key     = todayKey();
  const entries = readLog(key);
  entries.push({
    time:    new Date().toISOString(),
    level,
    message: args.map(serialize).join(" "),
  });
  if (entries.length > MAX_ENTRIES) entries.splice(0, entries.length - MAX_ENTRIES);
  writeLog(key, entries);
};

// ── Intercept console (run once at app start) ─────────────────
let _started = false;

export const startLogInterceptor = () => {
  if (_started) return;
  _started = true;

  const _log            = console.log.bind(console);
  const _warn           = console.warn.bind(console);
  const _error          = console.error.bind(console);
  const _group          = console.group.bind(console);
  const _groupCollapsed = console.groupCollapsed.bind(console);
  const _groupEnd       = console.groupEnd.bind(console);

  console.log = (...a) => { _log(...a);            push("LOG",   a); };
  console.warn  = (...a) => { _warn(...a);          push("WARN",  a); };
  console.error = (...a) => { _error(...a);         push("ERROR", a); };
  console.group = (...a) => { _group(...a);         push("LOG",   a); };
  console.groupCollapsed = (...a) => { _groupCollapsed(...a); push("LOG", a); };
  console.groupEnd = (...a) => { _groupEnd(...a); };
};

// ── Public API ────────────────────────────────────────────────
export const getLogKeys = () =>
  Object.keys(localStorage)
    .filter((k) => k.startsWith(LS_PREFIX))
    .sort()
    .reverse();

export const getLogEntries = (key) => readLog(key);

export const getAllEntries = () =>
  getLogKeys().flatMap((k) => readLog(k));

export const getLogSummary = () =>
  getLogKeys().map((key) => {
    const entries = readLog(key);
    return {
      key,
      date:   key.replace(LS_PREFIX, ""),
      total:  entries.length,
      errors: entries.filter((e) => e.level === "ERROR").length,
      warns:  entries.filter((e) => e.level === "WARN").length,
    };
  });

export const downloadLogs = (dateKey) => {
  const entries = dateKey ? getLogEntries(dateKey) : getAllEntries();
  if (!entries.length) { alert("No logs to download."); return; }

  const text =
    "LicenseMS — Application Log\n" +
    `Generated : ${new Date().toISOString()}\n` +
    `Entries   : ${entries.length}\n` +
    "─".repeat(70) + "\n\n" +
    entries
      .map((e) => `[${e.time}] [${e.level.padEnd(5)}] ${e.message}`)
      .join("\n");

  const blob  = new Blob([text], { type: "text/plain" });
  const label = dateKey ? dateKey.replace(LS_PREFIX, "") : "all";
  const a     = document.createElement("a");
  a.href      = URL.createObjectURL(blob);
  a.download  = `lms-logs-${label}.log`;
  a.click();
  URL.revokeObjectURL(a.href);
};

export const clearAllLogs    = () => getLogKeys().forEach((k) => localStorage.removeItem(k));
export const clearLogByKey   = (key) => localStorage.removeItem(key);
