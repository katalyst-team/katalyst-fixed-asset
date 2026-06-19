import type {
  FaDoc,
  FaMasterDataSection,
  FaReportTemplate,
  FaUser,
} from "@/types/fixed-assets";

export const REPORT_TEMPLATES: FaReportTemplate[] = [
  { desc: "Per-asset depreciation schedule · PSAK 16 · by class / cost center", icon: "dollar", id: "PSAK 16 schedule", lastRun: "2 days ago", name: "Depreciation Schedule", tone: "info" },
  { desc: "Beginning balance + additions − disposals − depreciation = ending balance", icon: "refresh", id: "Capital Roll-Forward", lastRun: "1 week", name: "Asset Roll-Forward", tone: "info" },
  { desc: "Tax-aligned depreciation per PPh kelompok pajak (Kel 1-3 + Bangunan)", icon: "shield", id: "SPT Tahunan PPh Badan", lastRun: "Last year-end", name: "Form 1771 Lampiran 1A", tone: "success" },
  { desc: "BPKP / KAP-ready bundle: register, BAST, stock count, journal entries, sign-offs", icon: "audit", id: "BPKP / KAP bundle", lastRun: "Q4 2024", name: "Year-End Audit Pack", tone: "brand" },
  { desc: "Per-zone variance, NBV impact, signed by auditor + external accountant", icon: "check", id: "Variance results", lastRun: "14 days", name: "Stock Count Reconciliation", tone: "success" },
  { desc: "List of assets assigned per employee · for handover (BAST)", icon: "user", id: "Handover lists", lastRun: "on demand", name: "Asset by Custodian", tone: "outline" },
  { desc: "Asset value + monthly depreciation per cost center", icon: "building", id: "Cost center view", lastRun: "monthly", name: "Cost Center Allocation", tone: "info" },
  { desc: "Parts + labor + downtime cost per asset · trend analysis", icon: "wrench", id: "Cost analysis", lastRun: "monthly", name: "Maintenance Cost Report", tone: "warn" },
  { desc: "JSON-LD export of all RFID custody events · GS1 EPCIS 2.0 compliant", icon: "radar", id: "EPCIS JSON-LD", lastRun: "continuous", name: "EPCIS 2.0 Event Export", tone: "info" },
  { desc: "Missing assets, theft incidents, recovery rate, insurance claims", icon: "alert", id: "Loss & claims", lastRun: "1 month", name: "Loss & Recovery Report", tone: "danger" },
  { desc: "Assets with warranty expiring in next 30/60/90 days", icon: "cal", id: "Expiry watchlist", lastRun: "live", name: "Warranty Expiration Watch", tone: "warn" },
  { desc: "ISO 17025 traceable certs for regulated lab + medical assets", icon: "flask", id: "ISO 17025 certs", lastRun: "continuous", name: "Calibration Certificate Log", tone: "success" },
];

export const FA_USERS: FaUser[] = [
  { department: "Finance & Admin", email: "bambang.w@indojaya.id", id: "U001", lastActive: "now", name: "Bambang Wijaya", role: "Admin", status: "active" },
  { department: "IT", email: "dewi.a@indojaya.id", id: "U002", lastActive: "2m ago", name: "Dewi Anggraini", role: "Manager", status: "active" },
  { department: "Operations", email: "rahmat.s@indojaya.id", id: "U003", lastActive: "14m ago", name: "Rahmat Santoso", role: "Auditor", status: "active" },
  { department: "Operations", email: "andi.p@indojaya.id", id: "U004", lastActive: "1h ago", name: "Andi Pratama", role: "Operator", status: "active" },
  { department: "Finance & Admin", email: "ratna.i@indojaya.id", id: "U005", lastActive: "2h ago", name: "Ratna Indira", role: "Manager", status: "active" },
  { department: "Executive", email: "surya.d@indojaya.id", id: "U006", lastActive: "yesterday", name: "Surya Dharma", role: "Admin", status: "active" },
  { department: "Manufacturing", email: "eko.p@indojaya.id", id: "U007", lastActive: "3h ago", name: "Eko Pranata", role: "Operator", status: "active" },
  { department: "IT", email: "citra.w@indojaya.id", id: "U008", lastActive: "1 week", name: "Citra Wijaya", role: "Viewer", status: "invited" },
  { department: "Maintenance", email: "galang.t@indojaya.id", id: "U009", lastActive: "never", name: "Galang Tirta", role: "Operator", status: "suspended" },
];

export const ASSET_DOCS: FaDoc[] = [
  { d: "12 Jan 2025 · 142 KB", n: "Invoice PO-2025-0042.pdf" },
  { d: "14 Jan 2025 · 84 KB", n: "BAST Serah Terima.pdf" },
  { d: "12 Jan 2025 · 56 KB", n: "AppleCare+ Certificate.pdf" },
  { d: "14 Jan 2025 · 2.4 MB", n: "Handover Photos (4).zip" },
  { d: "15 Jan 2025 · 124 KB", n: "Insurance Allianz P-2410.pdf" },
  { d: "12 Jan 2025 · 1.8 MB", n: "Asset Tagging Photo.jpg" },
];

export const MASTER_DATA_SECTIONS: FaMasterDataSection[] = [
  {
    icon: "box",
    label: "Category",
    rows: [
      { count: 24, desc: "7 groups · 24 sub", id: "cat", name: "Category" },
    ],
    tab: "cat",
  },
  {
    icon: "pin",
    label: "Location",
    rows: [
      { count: 84, desc: "12 sites · 84 zones", id: "loc", name: "Location" },
    ],
    tab: "loc",
  },
  {
    icon: "user",
    label: "Custodian",
    rows: [
      { count: 142, desc: "142 users", id: "cust", name: "Custodian" },
    ],
    tab: "cust",
  },
  {
    icon: "dollar",
    label: "Cost Center",
    rows: [
      { count: 28, desc: "28 cost centers", id: "cc", name: "Cost Center" },
    ],
    tab: "cc",
  },
  {
    icon: "truck",
    label: "Supplier",
    rows: [
      { count: 68, desc: "68 vendors", id: "sup", name: "Supplier" },
    ],
    tab: "sup",
  },
  {
    icon: "tag",
    label: "Asset Class",
    rows: [
      { count: 14, desc: "14 · PSAK 16", id: "cls", name: "Asset Class" },
    ],
    tab: "cls",
  },
];
