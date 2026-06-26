// ─────────────────────────────────────────────────────────────
//  auth.js — Fake Backend (Mock Handler only)
//  Jab real backend ready ho, ye file delete ho jayegi.
// ─────────────────────────────────────────────────────────────

import { users }           from "../MockData/Data";
import { registerHandler } from "./apiCall";
import { log }             from "./logger";

// POST /api/auth/login
registerHandler("POST", "/api/auth/login", (payload) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { email, password } = payload || {};

      if (!email || !password) {
        const res = { success: false, statusCode: 400, message: "Bad Request", error: { field: "email", issue: "Email and password are required." } };
        log("POST", "/api/auth/login", 400, { email }, res);
        resolve(res); return;
      }

      const user = users.find((u) => u.email === email);
      if (!user) {
        const res = { success: false, statusCode: 404, message: "User not found", error: { field: "email", issue: "No account exists with this email." } };
        log("POST", "/api/auth/login", 404, { email }, res);
        resolve(res); return;
      }

      if (user.password !== password) {
        const res = { success: false, statusCode: 401, message: "Unauthorized", error: { field: "password", issue: "Incorrect password." } };
        log("POST", "/api/auth/login", 401, { email }, res);
        resolve(res); return;
      }

      const res = {
        success: true, statusCode: 200, message: "Login successful",
        data: { userId: user.userId, name: user.name, email: user.email, role: user.role },
      };
      log("POST", "/api/auth/login", 200, { email }, res);
      resolve(res);
    }, 800);
  });
});
