

export const BASE_URL = "";
export const USE_MOCK = true;

export const ENDPOINTS = {

  // ── Auth ──────────────────────────────────────────────────
  AUTH: {
    LOGIN:           "/api/auth/login",                              // POST
  },

  // ── Clients ───────────────────────────────────────────────
  CLIENTS: {
    GET_ALL:         "/api/clients",                                 // GET
    CREATE:          "/api/clients/create",                          // POST
    GET_BY_ID:       (id) => `/api/clients/${id}`,                   // GET
    UPDATE:          (id) => `/api/clients/update/${id}`,            // PUT
    DELETE:          (id) => `/api/clients/delete/${id}`,            // DELETE
    SEARCH:          (kw) => `/api/clients/search?keyword=${kw}`,    // GET
    FILTER:          (ds) => `/api/clients/filter?designation=${ds}`,// GET
  },

  // ── Products ──────────────────────────────────────────────
  PRODUCTS: {
    GET_ALL:         "/api/products",                                // GET
    CREATE:          "/api/products/create",                         // POST
  },

  // ── Licenses ──────────────────────────────────────────────
  LICENSES: {
    GET_ALL:         "/api/licenses",                                // GET
    GENERATE:        "/api/licenses/generate",                       // POST
    GET_BY_ID:       (id) => `/api/licenses/${id}`,                  // GET
    RENEW:           (id) => `/api/licenses/renew/${id}`,            // PUT
    UPDATE:          (id) => `/api/licenses/update/${id}`,           // PUT
    DELETE:          (id) => `/api/licenses/delete/${id}`,           // DELETE
    REVOKE:          (id) => `/api/licenses/revoke/${id}`,           // PUT
    VALIDATE:        (id) => `/api/licenses/validate/${id}`,         // GET
  },

};
