// ─────────────────────────────────────────
//  Mock Server Logger
// ─────────────────────────────────────────

const METHOD_COLORS = {
  GET:    "#22d3ee",
  POST:   "#34d399",
  PUT:    "#fbbf24",
  DELETE: "#f87171",
  PATCH:  "#a78bfa",
};

const STATUS_COLORS = {
  200: "#34d399",
  201: "#34d399",
  400: "#fbbf24",
  401: "#f87171",
  403: "#f87171",
  404: "#f87171",
  409: "#fb923c",
  422: "#fbbf24",
  500: "#f87171",
};

const STATUS_TEXT = {
  200: "OK",
  201: "CREATED",
  400: "BAD REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE",
  500: "INTERNAL SERVER ERROR",
};

export function log(method, url, statusCode, payload = null, response = null) {
  const time    = new Date().toLocaleTimeString("en-US", { hour12: false });
  const mColor  = METHOD_COLORS[method]       || "#e2e8f0";
  const sColor  = STATUS_COLORS[statusCode]   || "#e2e8f0";
  const sText   = STATUS_TEXT[statusCode]     || String(statusCode);
  const latency = `${Math.floor(Math.random() * 80) + 20}ms`;
  const isError = statusCode >= 400;

  const headerLine = [
    `%c[MOCK API] %c${method} %c${url} %c${statusCode} ${sText} %c${latency} %c${time}`,
    "color:#64748b; font-weight:600",
    `color:${mColor}; font-weight:800; background:${mColor}22; padding:1px 6px; border-radius:3px`,
    "color:#94a3b8",
    `color:${sColor}; font-weight:700`,
    "color:#64748b",
    "color:#475569",
  ];

  // ── Errors: always open + console.error banner ──────────────
  if (isError) {
    // Bold red error banner above the group so it's impossible to miss
    console.error(
      `%c✖ MOCK API ERROR  ${method} ${url}  →  ${statusCode} ${sText}`,
      `color:#fff; background:${sColor}; font-weight:700; padding:3px 10px; border-radius:4px; font-size:12px`
    );

    // Reason / message from response
    if (response) {
      const reason = response.message || "";
      const field  = response.error?.field  || "";
      const issue  = response.error?.issue  || "";
      if (reason) console.error(`%c  Message : ${reason}`, "color:#fbbf24; font-weight:600");
      if (field)  console.error(`%c  Field   : ${field}`,  "color:#fb923c; font-weight:600");
      if (issue)  console.error(`%c  Issue   : ${issue}`,  "color:#f87171; font-weight:600");
    }

    // Full detail in an open group
    console.group(...headerLine);
    if (payload && Object.keys(payload).length > 0) {
      console.log("%c  ▸ Request Payload", "color:#94a3b8; font-size:11px; font-weight:600");
      console.log(payload);
    }
    if (response) {
      console.log("%c  ▸ Response", "color:#94a3b8; font-size:11px; font-weight:600");
      console.log(response);
    }
    console.groupEnd();
    return;
  }

  // ── Success: collapsed (clean) ───────────────────────────────
  console.groupCollapsed(...headerLine);
  if (payload && Object.keys(payload).length > 0) {
    console.log("%c  ▸ Request Payload", "color:#94a3b8; font-size:11px");
    console.log(payload);
  }
  if (response) {
    console.log("%c  ▸ Response", "color:#94a3b8; font-size:11px");
    console.log(response);
  }
  console.groupEnd();
}
