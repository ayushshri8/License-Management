// ─────────────────────────────────────────────────────────────
//  apiCall.js

// ─────────────────────────────────────────────────────────────

import { log } from "./logger";

const mockHandlers = {};

export const USE_MOCK = true; 

export const registerHandler = (method, urlPattern, handler) => {
  mockHandlers[`${method}::${urlPattern}`] = handler;
};

// ── Match a real URL against a registered pattern ─────────
// e.g. "/api/clients/CL-001" matches "/api/clients/:id"
function matchHandler(method, url) {
  // Parse base path and query params from url
  const [basePath, queryStr] = url.split("?");
  const params = {};
  if (queryStr) {
    queryStr.split("&").forEach((part) => {
      const [k, v] = part.split("=");
      params[k] = decodeURIComponent(v || "");
    });
  }

  for (const key of Object.keys(mockHandlers)) {
    const [m, pattern] = key.split("::");
    if (m !== method) continue;

    const [patternBase] = pattern.split("?");
    const patternParts  = patternBase.split("/");
    const urlParts      = basePath.split("/");

    if (patternParts.length !== urlParts.length) continue;

    let matched  = true;
    const extracted = {};

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(":")) {
        extracted[patternParts[i].slice(1)] = urlParts[i];
      } else if (patternParts[i] !== urlParts[i]) {
        matched = false; break;
      }
    }

    if (matched) {
      const id = extracted.id || null;
      return { handler: mockHandlers[key], id, params };
    }
  }

  return null;
}

// ── Main apiCall ───────────────────────────────────────────
export const apiCall = async (method, url, payload = null) => {

  if (USE_MOCK) {
    const match = matchHandler(method, url);

    if (!match) {
      const res = { success: false, statusCode: 404, message: "Mock handler not registered", error: { issue: `No mock for ${method} ${url}` } };
      log(method, url, 404, payload, res);
      return res;
    }

    return await match.handler(payload, match.id, match.params);
  }

  // ── Real fetch ─────────────────────────────────────────
  try {
    const options = { method, headers: { "Content-Type": "application/json" } };
    if (payload && method !== "GET") options.body = JSON.stringify(payload);

    const response = await fetch(url, options);
    const data     = await response.json();
    log(method, url, response.status, payload, data);
    return { ...data, statusCode: response.status };

  } catch (err) {
    const res = { success: false, statusCode: 500, message: "Network Error", error: { issue: err.message } };
    log(method, url, 500, payload, res);
    return res;
  }
};
