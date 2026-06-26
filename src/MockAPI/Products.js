// ─────────────────────────────────────────────────────────────
//  Products.js — Fake Backend (Mock Handlers only)
//  Jab real backend ready ho, ye file delete ho jayegi.
// ─────────────────────────────────────────────────────────────

import { products }        from "../MockData/Data";
import { registerHandler } from "./apiCall";
import { log }             from "./logger";

const LS_KEY = "lms_products";
const stored = localStorage.getItem(LS_KEY);
if (stored) {
  const parsed = JSON.parse(stored);
  products.length = 0;
  parsed.forEach((p) => products.push(p));
} else {
  localStorage.setItem(LS_KEY, JSON.stringify(products));
}
const save = () => localStorage.setItem(LS_KEY, JSON.stringify(products));

// GET /api/products
registerHandler("GET", "/api/products", () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const res = { success: true, statusxCode: 200, count: products.length, data: [...products] };
      log("GET", "/api/products", 200, {}, res);
      resolve(res);
    }, 500);
  });
});

// POST /api/products/create
registerHandler("POST", "/api/products/create", (payload) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { productName, version } = payload || {};

      if (!productName || !version) {
        const res = { success: false, statusCode: 400, message: "Bad Request", error: { issue: "Product name and version are required." } };
        log("POST", "/api/products/create", 400, payload, res);
        resolve(res); return;
      }

      const exists = products.find((p) => p.productName.toLowerCase() === productName.toLowerCase());
      if (exists) {
        const res = { success: false, statusCode: 409, message: "Conflict", error: { field: "productName", issue: `Product "${productName}" already exists.` } };
        log("POST", "/api/products/create", 409, payload, res);
        resolve(res); return;
      }

      const nextId = `PR-${String(products.length + 1).padStart(3, "0")}`;
      products.push({ productId: nextId, productName, version });
      save();

      const res = { success: true, statusCode: 201, message: "Product created successfully", data: { productId: nextId } };
      log("POST", "/api/products/create", 201, payload, res);
      resolve(res);
    }, 500);
  });
});


