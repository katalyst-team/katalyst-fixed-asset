/* ============================================================
   Fixed Assets — Type Definitions
   ============================================================ */

export type AssetCategory =
  | "it"
  | "tool"
  | "furn"
  | "veh"
  | "lab"
  | "med"
  | "mach";

export type AssetStatus =
  | "deployed"
  | "in-service"
  | "checked-out"
  | "maint"
  | "idle"
  | "retired";

export type BadgeTone = "success" | "warn" | "danger" | "info" | "brand" | "outline";

export interface FaAsset {
  age: number;
  id: string;
  name: string;
  cat: AssetCategory;
  loc: string;
  custodian: string;
  dep: number;
  epc: string;
  purchased: string;
  serial: string;
  spark: number[];
  status: AssetStatus;
  supplier: string;
  val: number;
  warranty: string;
}

export interface FaSite {
  assets: string;
  city: string;
  n: string;
  pct: number;
  status: "on" | "off";
  sub?: string;
  val: number;
}

export interface FaCategoryStat {
  cat: AssetCategory;
  n: string;
  pct: number;
  v: number;
}

export interface FaFinancialCategory {
  cost: number;
  nbv: number;
  n: string;
  pct: number;
}

export interface FaRfidRead {
  a: string;
  dir: "in" | "out";
  g: string;
  rssi: number;
  t: string;
  who: string;
}

export interface FaActivityItem {
  go?: string;
  icon: string;
  ic: string;
  id?: string;
  t: string;
  txt: string;
}

export interface FaMaintenanceUpcoming {
  d: string;
  dt: string;
  icon: string;
  t: string;
  tone: string;
}

export interface FaDisposalItem {
  a: string;
  cat: AssetCategory;
  id: string;
  nbv: number;
  reason: string;
  rec: number;
  status: string;
  tone: string;
}

export interface FaTransferItem {
  by: string;
  from: string;
  id: string;
  late: boolean;
  n: string;
  stage: number;
  to: string;
}

export interface FaAuditZone {
  f: number;
  nbv: number | string;
  s: number;
  tone: string;
  v: number | string;
  z: string;
}

export interface FaHealthItem {
  ageDays: number;
  ai: string;
  cat: AssetCategory;
  cycles: number;
  custodian: string;
  healthScore: number;
  id: string;
  lastSeenLabel: string;
  lastSeenMin: number;
  loc: string;
  mtbfDays: number;
  name: string;
  nextPMDays: number;
  runHours: number;
  sinceMaintDays: number;
  status: "critical" | "alert" | "watch" | "ok";
}

export interface FaPreUseAsset {
  asset: string;
  cat: AssetCategory;
  checks: string[];
  critical: boolean;
  dueIn: string;
  failItem?: string;
  id: string;
  interval: string;
  lastCheckLabel: string;
  lastChecker: string;
  lastResult: "pass" | "fail";
  overdue: boolean;
  streak: number;
}

export interface FaPmScheduleItem {
  asset: string;
  date: string;
  eta: string;
  id: string;
  task: string;
  tone: string;
  type: string;
  when: string;
  who: string;
}

export interface FaPmRule {
  autoWO: boolean;
  name: string;
  remind: string;
  scope: string;
  tone: string;
  trigger: string;
}

export interface FaWorkOrder {
  asset: string;
  assetId: string;
  assignedTo: string;
  cat: AssetCategory;
  createdAt: string;
  desc: string;
  eta: string;
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "open" | "in-progress" | "on-hold" | "done";
  type: "corrective" | "pm" | "predictive" | "inspection";
}

export interface FaSecurityAlert {
  action: string;
  asset: string;
  assetId: string;
  camera: string;
  desc: string;
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "active" | "investigating" | "resolved";
  time: string;
  zone: string;
}

export interface FaRfidTag {
  asset: string;
  assetId: string;
  encodedAt: string;
  epc: string;
  format: string;
  id: string;
  lastRead: string;
  printed: boolean;
  rssi: number;
  status: "active" | "inactive" | "lost";
  tid: string;
}

export interface FaRfidOrderItem {
  cat: AssetCategory;
  id: string;
  qty: number;
  size: string;
  tagType: string;
}

export interface FaCheckOutRecord {
  asset: string;
  assetId: string;
  by: string;
  condition: "excellent" | "good" | "fair";
  dueDate: string;
  id: string;
  outDate: string;
  purpose: string;
  returnDate: string | null;
  status: "active" | "returned" | "overdue";
}

export interface FaDoc {
  d: string;
  n: string;
}

export interface FaReportTemplate {
  desc: string;
  icon: string;
  id: string;
  lastRun: string;
  name: string;
  tone: string;
}

export interface FaMasterDataRow {
  count: number;
  desc: string;
  id: string;
  name: string;
}

export interface FaUser {
  department: string;
  email: string;
  id: string;
  lastActive: string;
  name: string;
  role: "Admin" | "Manager" | "Auditor" | "Operator" | "Viewer";
  status: "active" | "invited" | "suspended";
}

export interface FaPmRuleRow extends FaPmRule {
  id: string;
}

export interface FaMasterDataSection {
  icon: string;
  label: string;
  rows: FaMasterDataRow[];
  tab: string;
}
