// Users MockData........
export const users = [
  {
    userId: "USR-001",
    name: "Admin User",
    email: "admin@company.com",
    password: "admin1",
    role: "Administrator",
  },
];

// Products MockData........
export let products = [
  { productId: "PR-001", productName: "InsightGrid",     version: "v2.1" },
  { productId: "PR-002", productName: "DataSphere",      version: "v1.4" },
  { productId: "PR-003", productName: "AetherAI",        version: "v3.0" },
  { productId: "PR-004", productName: "NeuroMetricsAI",  version: "v1.0" },
  { productId: "PR-005", productName: "Narrate",         version: "v2.3" },
];

//  clients MockData........
const SEED_CLIENTS = [
  {
    clientId: "CL-001",
    employeeName: "Rahul Sharma",
    designation: "Software Engineer",
    contactNumber: "9876543210",
    email: "rahul@company.com",
    department: "Analytics",
  },
  {
    clientId: "CL-002",
    employeeName: "Ayush",
    designation: "Software Engineer",
    contactNumber: "9876543210",
    email: "ayush@company.com",
    department: "ST",
  },
  {
    clientId: "CL-003",
    employeeName: "Manish Sharma",
    designation: "HR",
    contactNumber: "9876543210",
    email: "manish@company.com",
    department: "HR",
  },
  {
    clientId: "CL-004",
    employeeName: "Anjali Gupta",
    designation: "Ui/Ux Designer",
    contactNumber: "9876543210",
    email: "anjali@company.com",
    department: "Design",
  },
];

const LS_KEY = "lms_clients";
const stored = localStorage.getItem(LS_KEY);
export let clients = stored ? JSON.parse(stored) : [...SEED_CLIENTS];
if (!stored) localStorage.setItem(LS_KEY, JSON.stringify(clients));

// Licenses MockData........
const SEED_LICENSES = [
  {
    licenseId: "LIC-001",
    licenseKey: "LIC-001",
    productName: "InsightGrid",
    employeeName: "Rahul Sharma",
    licenseType: "Premium",
    type: "New",
    serialNumber: "SER-001",
    status: "Active",
    expiryDate: "2026-06-15",
    createdAt: "2025-06-15",
    revokeReason: null,
  },
  {
    licenseId: "LIC-002",
    licenseKey: "LIC-002",
    productName: "DataSphere",
    employeeName: "Anjali Gupta",
    licenseType: "Standard",
    type: "New",
    serialNumber: "SER-002",
    status: "Expired",
    expiryDate: "2025-01-10",
    createdAt: "2024-01-10",
    revokeReason: null,
  },
];

const LS_LIC_KEY = "lms_licenses";
const storedLic  = localStorage.getItem(LS_LIC_KEY);
export let licenses = storedLic ? JSON.parse(storedLic) : [...SEED_LICENSES];
if (!storedLic) localStorage.setItem(LS_LIC_KEY, JSON.stringify(licenses));
