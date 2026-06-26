// ─────────────────────────────────────────────────────────────
//  Clients.js — Fake Backend (Mock Handlers only)
//
//  Ye file sirf mock handlers register karti hai.
//  clients.jsx ko yahan se kuch import nahi karna.
//  Jab real backend ready ho, ye file delete ho jayegi.
// ─────────────────────────────────────────────────────────────

import { clients }         from "../MockData/Data";
import { registerHandler } from "./apiCall";
import { log }             from "./logger";

const LS_KEY = "lms_clients";
const save   = () => localStorage.setItem(LS_KEY, JSON.stringify(clients));

// GET /api/clients
registerHandler("GET", "/api/clients", () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const res = { success: true, statusCode: 200, count: clients.length, data: [...clients] };
      log("GET", "/api/clients", 200, {}, res);
      resolve(res);
    }, 500);
  });
});

// POST /api/clients/create
registerHandler("POST", "/api/clients/create", (payload) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { employeeName, designation, contactNumber, email, department } = payload || {};

      if (!employeeName || !designation || !contactNumber || !email || !department) {
        const res = { success: false, statusCode: 400, message: "Bad Request", error: { issue: "All fields are required." } };
        log("POST", "/api/clients/create", 400, payload, res);
        resolve(res); return;
      }

      const exists = clients.find((c) => c.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        const res = { success: false, statusCode: 409, message: "Conflict", error: { field: "email", issue: `A client with email "${email}" already exists.` } };
        log("POST", "/api/clients/create", 409, payload, res);
        resolve(res); return;
      }

      const nextId = `CL-${String(clients.length + 1).padStart(3, "0")}`;
      clients.push({ clientId: nextId, ...payload });
      save();

      const res = { success: true, statusCode: 201, message: "Client created successfully", data: { clientId: nextId } };
      log("POST", "/api/clients/create", 201, payload, res);
      resolve(res);
    }, 500);
  });
});

// GET /api/clients/:clientId  — pattern match via apiCall
registerHandler("GET", "/api/clients/:id", (payload, clientId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const client = clients.find((c) => c.clientId === clientId);
      if (!client) {
        const res = { success: false, statusCode: 404, message: "Client not found", error: { issue: `No client with ID "${clientId}".` } };
        log("GET", `/api/clients/${clientId}`, 404, {}, res);
        resolve(res); return;
      }
      const res = { success: true, statusCode: 200, data: client };
      log("GET", `/api/clients/${clientId}`, 200, {}, res);
      resolve(res);
    }, 500);
  });
});

// PUT /api/clients/update/:clientId
registerHandler("PUT", "/api/clients/update/:id", (payload, clientId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = clients.findIndex((c) => c.clientId === clientId);
      if (index === -1) {
        const res = { success: false, statusCode: 404, message: "Client not found", error: { issue: `No client with ID "${clientId}".` } };
        log("PUT", `/api/clients/update/${clientId}`, 404, payload, res);
        resolve(res); return;
      }
      clients[index] = { ...clients[index], ...payload };
      save();
      const res = { success: true, statusCode: 200, message: "Client updated successfully" };
      log("PUT", `/api/clients/update/${clientId}`, 200, payload, res);
      resolve(res);
    }, 500);
  });
});

// DELETE /api/clients/delete/:clientId
registerHandler("DELETE", "/api/clients/delete/:id", (payload, clientId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = clients.findIndex((c) => c.clientId === clientId);
      if (index === -1) {
        const res = { success: false, statusCode: 404, message: "Client not found", error: { issue: `No client with ID "${clientId}".` } };
        log("DELETE", `/api/clients/delete/${clientId}`, 404, {}, res);
        resolve(res); return;
      }
      clients.splice(index, 1);
      save();
      const res = { success: true, statusCode: 200, message: "Client deleted successfully" };
      log("DELETE", `/api/clients/delete/${clientId}`, 200, {}, res);
      resolve(res);
    }, 500);
  });
});

// GET /api/clients/search?keyword=
registerHandler("GET", "/api/clients/search", (payload, _id, params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const keyword = params?.keyword || "";
      if (!keyword.trim()) {
        const res = { success: false, statusCode: 400, message: "Bad Request", error: { issue: "Search keyword is required." } };
        log("GET", `/api/clients/search?keyword=${keyword}`, 400, {}, res);
        resolve(res); return;
      }
      const results = clients.filter((c) => c.employeeName.toLowerCase().includes(keyword.toLowerCase()));
      const res = { success: true, statusCode: 200, count: results.length, results };
      log("GET", `/api/clients/search?keyword=${keyword}`, 200, {}, res);
      resolve(res);
    }, 500);
  });
});

// GET /api/clients/filter?designation=
registerHandler("GET", "/api/clients/filter", (payload, _id, params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const designation = params?.designation || "";
      if (!designation.trim()) {
        const res = { success: false, statusCode: 400, message: "Bad Request", error: { issue: "Designation filter is required." } };
        log("GET", `/api/clients/filter?designation=${designation}`, 400, {}, res);
        resolve(res); return;
      }
      const data = clients.filter((c) => c.designation === designation);
      const res  = { success: true, statusCode: 200, count: data.length, data };
      log("GET", `/api/clients/filter?designation=${designation}`, 200, {}, res);
      resolve(res);
    }, 500);
  });
});
