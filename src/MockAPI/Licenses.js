// ─────────────────────────────────────────────────────────────
//  Licenses.js — Fake Backend (Mock Handlers only)
// ─────────────────────────────────────────────────────────────

import { licenses }           from "../MockData/Data";
import { registerHandler }    from "./apiCall";
import { log }                from "./logger";
import { storeLicenseResponse } from "../Components/useSessionManager";

const LS_KEY = "lms_licenses";
const save   = () => localStorage.setItem(LS_KEY, JSON.stringify(licenses));

// Helper — store every license response into session store
const track = (endpoint, res) => { storeLicenseResponse(endpoint, res); return res; };

const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const nextKey = () => {
  const max = licenses.reduce((acc, l) => {
    const n = parseInt(l.licenseKey.replace("LIC-", ""), 10);
    return n > acc ? n : acc;
  }, 0);
  return `LIC-${String(max + 1).padStart(3, "0")}`;
};

const isExpired = (expiryDate) => new Date(expiryDate) < new Date();

const daysRemaining = (expiryDate) => {
  const diff = new Date(expiryDate) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// POST /api/licenses/generate
registerHandler("POST", "/api/licenses/generate", (payload) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { productName, employeeName, licenseType, expiryDays, type, serialNumber } = payload || {};

      if (!productName || !employeeName || !licenseType || !expiryDays || !type || !serialNumber) {
        const res = { success: false, statusCode: 400, message: "Bad Request", error: { issue: "All fields are required." } };
        log("POST", "/api/licenses/generate", 400, payload, res);
        resolve(res); return;
      }

      if (typeof expiryDays !== "number" || expiryDays <= 0) {
        const res = { success: false, statusCode: 400, message: "Invalid request payload", error: { field: "expiryDays", issue: "expiryDays must be a positive number." } };
        log("POST", "/api/licenses/generate", 400, payload, res);
        resolve(res); return;
      }

      const licenseKey = nextKey();
      const license = {
        licenseId: licenseKey,
        licenseKey,
        productName,
        employeeName,
        licenseType,
        type,
        serialNumber,
        status: "Active",
        expiryDate: addDays(expiryDays),
        createdAt: new Date().toISOString().split("T")[0],
        revokeReason: null,
      };

      licenses.push(license);
      save();

      const res = { success: true, statusCode: 200, message: "License generated successfully", data: { licenseKey } };
      log("POST", "/api/licenses/generate", 200, payload, res);
      resolve(track("POST /api/licenses/generate", res));
    }, 500);
  });
});

// GET /api/licenses
registerHandler("GET", "/api/licenses", () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // auto-update expired statuses
      licenses.forEach((l) => {
        if (l.status === "Active" && isExpired(l.expiryDate)) l.status = "Expired";
      });
      save();
      const res = { success: true, statusCode: 200, count: licenses.length, data: [...licenses] };
      log("GET", "/api/licenses", 200, {}, res);
      resolve(track("GET /api/licenses", res));
    }, 500);
  });
});

// GET /api/licenses/:licenseId
registerHandler("GET", "/api/licenses/:id", (payload, licenseId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lic = licenses.find((l) => l.licenseId === licenseId);
      if (!lic) {
        const res = { success: false, statusCode: 404, message: "License not found", error: { issue: `No license with ID "${licenseId}".` } };
        log("GET", `/api/licenses/${licenseId}`, 404, {}, res);
        resolve(res); return;
      }
      const res = { success: true, statusCode: 200, data: lic };
      log("GET", `/api/licenses/${licenseId}`, 200, {}, res);
      resolve(res);
    }, 500);
  });
});

// PUT /api/licenses/renew/:licenseId
registerHandler("PUT", "/api/licenses/renew/:id", (payload, licenseId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { expiryDays } = payload || {};

      if (!expiryDays || typeof expiryDays !== "number" || expiryDays <= 0) {
        const res = { success: false, statusCode: 400, message: "Invalid request payload", error: { field: "expiryDays", issue: "expiryDays must be a positive number." } };
        log("PUT", `/api/licenses/renew/${licenseId}`, 400, payload, res);
        resolve(res); return;
      }

      const idx = licenses.findIndex((l) => l.licenseId === licenseId);
      if (idx === -1) {
        const res = { success: false, statusCode: 404, message: "License not found", error: { issue: `No license with ID "${licenseId}".` } };
        log("PUT", `/api/licenses/renew/${licenseId}`, 404, payload, res);
        resolve(res); return;
      }

      if (licenses[idx].status === "Revoked") {
        const res = { success: false, statusCode: 400, message: "Cannot renew a revoked license", error: { issue: "Revoked licenses cannot be renewed." } };
        log("PUT", `/api/licenses/renew/${licenseId}`, 400, payload, res);
        resolve(res); return;
      }

      licenses[idx].expiryDate = addDays(expiryDays);
      licenses[idx].status     = "Active";
      save();

      const res = { success: true, statusCode: 200, message: "License renewed successfully" };
      log("PUT", `/api/licenses/renew/${licenseId}`, 200, payload, res);
      resolve(track(`PUT /api/licenses/renew/${licenseId}`, res));
    }, 500);
  });
});

// PUT /api/licenses/update/:licenseId
registerHandler("PUT", "/api/licenses/update/:id", (payload, licenseId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const idx = licenses.findIndex((l) => l.licenseId === licenseId);
      if (idx === -1) {
        const res = { success: false, statusCode: 404, message: "License not found", error: { issue: `No license with ID "${licenseId}".` } };
        log("PUT", `/api/licenses/update/${licenseId}`, 404, payload, res);
        resolve(res); return;
      }

      const { licenseType, expiryDays } = payload || {};
      if (!licenseType && !expiryDays) {
        const res = { success: false, statusCode: 400, message: "Bad Request", error: { issue: "At least one field (licenseType or expiryDays) is required." } };
        log("PUT", `/api/licenses/update/${licenseId}`, 400, payload, res);
        resolve(res); return;
      }

      if (licenseType) licenses[idx].licenseType = licenseType;
      if (expiryDays)  licenses[idx].expiryDate  = addDays(expiryDays);
      save();

      const res = { success: true, statusCode: 200, message: "License updated successfully" };
      log("PUT", `/api/licenses/update/${licenseId}`, 200, payload, res);
      resolve(track(`PUT /api/licenses/update/${licenseId}`, res));
    }, 500);
  });
});

// DELETE /api/licenses/delete/:licenseId
registerHandler("DELETE", "/api/licenses/delete/:id", (payload, licenseId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const idx = licenses.findIndex((l) => l.licenseId === licenseId);
      if (idx === -1) {
        const res = { success: false, statusCode: 404, message: "License not found", error: { issue: `No license with ID "${licenseId}".` } };
        log("DELETE", `/api/licenses/delete/${licenseId}`, 404, {}, res);
        resolve(res); return;
      }
      licenses.splice(idx, 1);
      save();
      const res = { success: true, statusCode: 200, message: "License deleted successfully" };
      log("DELETE", `/api/licenses/delete/${licenseId}`, 200, {}, res);
      resolve(track(`DELETE /api/licenses/delete/${licenseId}`, res));
    }, 500);
  });
});

// PUT /api/licenses/revoke/:licenseId
registerHandler("PUT", "/api/licenses/revoke/:id", (payload, licenseId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { reason } = payload || {};
      if (!reason || !reason.trim()) {
        const res = { success: false, statusCode: 400, message: "Invalid request payload", error: { field: "reason", issue: "Reason for revocation is required." } };
        log("PUT", `/api/licenses/revoke/${licenseId}`, 400, payload, res);
        resolve(res); return;
      }

      const idx = licenses.findIndex((l) => l.licenseId === licenseId);
      if (idx === -1) {
        const res = { success: false, statusCode: 404, message: "License not found", error: { issue: `No license with ID "${licenseId}".` } };
        log("PUT", `/api/licenses/revoke/${licenseId}`, 404, payload, res);
        resolve(res); return;
      }

      if (licenses[idx].status === "Revoked") {
        const res = { success: false, statusCode: 400, message: "License is already revoked", error: { issue: "This license has already been revoked." } };
        log("PUT", `/api/licenses/revoke/${licenseId}`, 400, payload, res);
        resolve(res); return;
      }

      licenses[idx].status       = "Revoked";
      licenses[idx].revokeReason = reason;
      save();

      const res = { success: true, statusCode: 200, message: "License revoked successfully" };
      log("PUT", `/api/licenses/revoke/${licenseId}`, 200, payload, res);
      resolve(track(`PUT /api/licenses/revoke/${licenseId}`, res));
    }, 500);
  });
});

// GET /api/licenses/validate/:licenseId
registerHandler("GET", "/api/licenses/validate/:id", (payload, licenseId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lic = licenses.find((l) => l.licenseId === licenseId);
      if (!lic) {
        const res = { success: false, statusCode: 404, message: "License not found", error: { issue: `No license with ID "${licenseId}".` } };
        log("GET", `/api/licenses/validate/${licenseId}`, 404, {}, res);
        resolve(res); return;
      }

      const expired = isExpired(lic.expiryDate);
      const days    = daysRemaining(lic.expiryDate);

      const res = { success: true, statusCode: 200, expired, daysRemaining: days };
      log("GET", `/api/licenses/validate/${licenseId}`, 200, {}, res);
      resolve(track(`GET /api/licenses/validate/${licenseId}`, res));
    }, 500);
  });
});
