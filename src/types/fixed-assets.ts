/* eslint-disable max-lines */
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

/* ============================================================
   Detail / Nested Types
   ============================================================ */

export interface FaDepreciationEntry {
  cost: number;
  depreciation: number;
  nbv: number;
  year: number;
}

export interface FaAssetDetail extends FaAsset {
  activityLog?: FaActivityItem[];
  depreciationSchedule?: FaDepreciationEntry[];
  docs?: FaDoc[];
  maintenanceHistory?: FaWorkOrder[];
}

export interface FaJournalEntryLine {
  account: string;
  credit: number;
  debit: number;
  description: string;
}

export interface FaDisposalJournalEntry {
  journal_entry_id: string;
  lines: FaJournalEntryLine[];
  posted: boolean;
}

export interface FaPOLine {
  cat: AssetCategory;
  id: string;
  name: string;
  qty: number;
  received: number;
  size: string;
  tag_type: string;
  unit_cost: number;
}

export interface FaPO {
  date: string;
  expected: string;
  id: string;
  lines: FaPOLine[];
  status: "pending" | "partial" | "received";
  supplier: string;
}

export interface FaRTLSPosition {
  accuracy_m: number;
  anchor_ids: string[];
  asset_id: string;
  last_seen: string;
  name: string;
  x: number;
  y: number;
  z?: number;
}

export interface FaRTLSAnchor {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface FaRTLSFloorPlan {
  floor_plan_url: string;
  height: number;
  width: number;
}

export interface FaAuditProgress {
  pct_complete: number;
  scanned_zones: number;
  total_zones: number;
}

export type FaAuditSignOffRole =
  | "stock_count_lead"
  | "dept_head"
  | "internal_audit"
  | "finance_manager"
  | "external_accountant";

export type FaDisposalReason =
  | "sold"
  | "scrapped"
  | "donated"
  | "lost"
  | "obsolete";

export type FaMasterDataSectionTab =
  | "cat"
  | "loc"
  | "cust"
  | "cc"
  | "sup"
  | "cls";

export type FaMaintenanceTab =
  | "flow"
  | "health"
  | "wo"
  | "schedule";

export type FaReportFormat = "pdf" | "excel" | "json-ld";

export interface FaReportResult {
  download_url?: string;
  report_id: string;
  status: "generating" | "ready";
}

export interface FaUserAuditLog {
  action: string;
  details?: Record<string, unknown>;
  entity_id: string;
  entity_type: string;
  id: string;
  ip: string;
  timestamp: string;
  user_id: string;
  user_name: string;
}

export interface FaDocListItem {
  category: string;
  icon: string;
  id: string;
  title: string;
  url: string;
}

export interface FaSettings {
  depreciation: {
    default_useful_life_years: Partial<Record<AssetCategory, number>>;
    method: "straight-line" | "declining-balance";
  };
  integrations: {
    active_directory: { connected: boolean };
    email_provider: { connected: boolean };
    erp: { connected: boolean; type?: "odoo" | "sap" | "oracle" };
  };
  notifications: {
    audit_complete_notify: boolean;
    disposal_approval_notify: boolean;
    email_enabled: boolean;
    maintenance_reminder_days: number[];
    push_enabled: boolean;
  };
  rfid_hardware: {
    default_tag_type: string;
    epc_encoding: string;
    reader_polling_interval_ms: number;
    rssi_threshold: number;
  };
  security: {
    ip_whitelist: string[];
    mfa_required: boolean;
    password_policy: string;
    session_timeout_min: number;
  };
  workspace: {
    asset_id_prefix: string;
    company_name: string;
    currency: string;
    fiscal_year_start: string;
    depreciation_standard: string;
    next_asset_number: number;
    npwp: string;
  };
}

/* ============================================================
   Query / Filter Param Types
   ============================================================ */

export interface FaAssetFilterOptions {
  cat?: AssetCategory;
  cursor?: string;
  custodian?: string;
  limit?: number;
  loc?: string;
  q?: string;
  status?: AssetStatus;
  store_id?: string;
}

export interface FaRfidTagFilterOptions {
  asset_id?: string;
  cursor?: string;
  limit?: number;
  q?: string;
  status?: "active" | "inactive" | "lost";
}

export interface FaDisposalFilterOptions {
  cursor?: string;
  limit?: number;
  status?: "pending" | "approved" | "rejected" | "revision" | "completed";
}

export interface FaCheckOutFilterOptions {
  cursor?: string;
  limit?: number;
  status?: "active" | "returned" | "overdue";
}

export interface FaTransferFilterOptions {
  cursor?: string;
  limit?: number;
  status?: "dispatched" | "in-transit" | "received";
}

export interface FaPOFilterOptions {
  cursor?: string;
  limit?: number;
  status?: "pending" | "partial" | "received";
}

export interface FaSecurityAlertFilterOptions {
  cursor?: string;
  limit?: number;
  severity?: "critical" | "high" | "medium" | "low";
  status?: "active" | "investigating" | "resolved";
}

export interface FaUserFilterOptions {
  cursor?: string;
  limit?: number;
  q?: string;
  role?: "Admin" | "Manager" | "Auditor" | "Operator" | "Viewer";
  status?: string;
}

export interface FaUserAuditLogFilterOptions {
  cursor?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  user_id?: string;
}

export interface FaRTLSPositionFilterOptions {
  floor?: string;
  site_id?: string;
  zone?: string;
}

/* ============================================================
   Request Payload Types
   ============================================================ */

export interface CreateAssetRequest {
  cat: AssetCategory;
  custodian: string;
  depreciation_method?: "straight-line" | "declining-balance";
  loc: string;
  name: string;
  purchased: string;
  salvage_value?: number;
  serial: string;
  store_id?: string;
  supplier: string;
  useful_life_years?: number;
  val: number;
  warranty: string;
}

export interface BulkCreateAssetRequest {
  assets: Array<{
    cat: AssetCategory;
    custodian: string;
    epc: string;
    loc: string;
    name: string;
    purchased: string;
    serial: string;
    supplier: string;
    val: number;
    warranty: string;
  }>;
  source_po_id?: string;
}

export interface BulkUpdateAssetRequest {
  action: "transfer" | "dispose" | "change-custodian" | "change-location";
  asset_ids: string[];
  payload: {
    custodian?: string;
    loc?: string;
  };
}

export interface CreateMasterDataRequest {
  address?: string;
  city?: string;
  code?: string;
  contact?: string;
  department?: string;
  email?: string;
  employee_id?: string;
  name: string;
  parent_id?: string;
  phone?: string;
  psak16_code?: string;
  depreciation_method?: string;
  useful_life_years?: number;
}

export interface EncodeRFIDTagRequest {
  asset_id: string;
  epc_format?: string;
  reader_id?: string;
  tag_type: string;
}

export interface PrintRFIDTagsRequest {
  label_size?: string;
  printer?: string;
  tag_ids: string[];
}

export interface OrderRFIDTagsRequest {
  items: Array<{
    cat: AssetCategory;
    qty: number;
    size: string;
    tag_type: string;
  }>;
  supplier: string;
}

export interface DeployScanInRequest {
  assets: Array<{
    epc: string;
    line_id: string;
    name: string;
    serial: string;
    tid: string;
    val: number;
  }>;
  cost_center: string;
  custodian: string;
  loc: string;
  po_id: string;
  qc_passed: boolean;
}

export interface CreateDisposalRequest {
  asset_id: string;
  nbv: number;
  notes?: string;
  reason: FaDisposalReason;
  recovery_value: number;
}

export interface CreateCheckOutRequest {
  asset_id: string;
  borrower: string;
  condition: "excellent" | "good" | "fair";
  due_date: string;
  out_date: string;
  purpose: string;
}

export interface ReturnCheckOutRequest {
  condition: "excellent" | "good" | "fair" | "damaged";
  notes?: string;
  return_date: string;
}

export interface CreateTransferRequest {
  asset_ids: string[];
  custodian: string;
  expected_arrival?: string;
  from_loc: string;
  to_loc: string;
}

export interface PostAuditAdjustmentRequest {
  lines: FaJournalEntryLine[];
  zone_id: string;
}

export interface AuditSignOffRequest {
  role: FaAuditSignOffRole;
  signature: string;
  user_id: string;
}

export interface CreateWorkOrderRequest {
  asset_id: string;
  assigned_to: string;
  desc: string;
  priority: "critical" | "high" | "medium" | "low";
  type: "corrective" | "pm" | "predictive" | "inspection";
}

export interface UpdateWorkOrderStatusRequest {
  notes?: string;
  status: "in-progress" | "on-hold" | "done";
}

export interface SubmitPreUseCheckRequest {
  asset_id: string;
  checker: string;
  fail_item?: string;
  overall_result: "pass" | "fail";
  results: Array<{
    check: string;
    passed: boolean;
  }>;
}

export interface CreatePmRuleRequest {
  autoWO: boolean;
  name: string;
  remind: string;
  scope: string;
  scope_assets?: string[];
  trigger: string;
}

export interface GenerateReportRequest {
  format: FaReportFormat;
  params?: {
    category?: AssetCategory;
    cost_center?: string;
    date_from?: string;
    date_to?: string;
    site_id?: string;
  };
  template_id: string;
}

export interface InviteFAUserRequest {
  department: string;
  email: string;
  role: "Admin" | "Manager" | "Auditor" | "Operator" | "Viewer";
}

export interface GeofenceRuleRequest {
  rules: Array<{
    allowed_zones: string[];
    asset_category: AssetCategory;
  }>;
}

/* ============================================================
   Gap Endpoints — Types
   ============================================================ */

export interface FaReservation {
  asset_id: string;
  asset_name: string;
  end_time: string;
  id: string;
  reserved_by: string;
  start_time: string;
  status: "active" | "cancelled" | "completed" | "upcoming";
}

export interface CreateReservationRequest {
  asset_id: string;
  duration: string;
  purpose?: string;
  reserved_by: string;
  start_time: string;
}

export interface FaEpcRange {
  company_prefix: string;
  encoding_format: string;
  filter_value: string;
  range_end: string;
  range_start: string;
}

export interface CreateEpcRangeRequest {
  company_prefix: string;
  encoding_format: string;
  filter_value: string;
  range_end: string;
  range_start: string;
}

export interface FaExportRequest {
  filters?: Record<string, unknown>;
  format: "csv" | "excel";
  source:
    | "assets"
    | "check-outs"
    | "dashboard"
    | "disposals"
    | "rfid-tags"
    | "transfers";
}

export interface FaExportResponse {
  download_url: string;
  expires_at: string;
}

export interface FaScanInHistoryItem {
  asset_id: string;
  asset_name: string;
  deployed_at: string;
  deployed_by: string;
  epc: string;
  id: string;
  po_id: string;
}

export interface FaTransferHistoryItem {
  cost_center: string;
  dispatched_at: string;
  from_loc: string;
  id: string;
  asset_name: string;
  received_at: string | null;
  status: string;
  to_loc: string;
}

export interface FaSavedQuery {
  filters?: Record<string, unknown>;
  floor: string;
  id: string;
  name: string;
  site_id: string;
  zone?: string;
}

export interface CreateSavedQueryRequest {
  filters?: Record<string, unknown>;
  floor: string;
  name: string;
  site_id: string;
  zone?: string;
}

export interface FaBilling {
  asset_count: number;
  asset_limit: number;
  plan: string;
  renewal_date: string;
  seat_count: number;
  seats_used: number;
  storage_limit_mb: number;
  storage_used_mb: number;
}

export interface FaInvoice {
  amount: number;
  date: string;
  download_url: string;
  id: string;
  status: "overdue" | "paid" | "pending";
}

export interface FaRole {
  description: string;
  id: string;
  name: string;
  permissions: string[];
  user_count: number;
}

export interface UpdateRoleRequest {
  description?: string;
  name?: string;
  permissions?: string[];
}

export interface FaReportHistoryItem {
  download_url: string;
  format: string;
  generated_at: string;
  generated_by: string;
  id: string;
  status: "failed" | "ready";
  template_id: string;
  template_name: string;
}

export interface FaReportPreview {
  generated_at: string;
  html: string;
}

export interface FaRfidReader {
  antenna_count: number;
  firmware_version: string;
  id: string;
  ip: string;
  last_heartbeat: string;
  location: string;
  model: string;
  name: string;
  status: "error" | "offline" | "online";
}

export interface FaNotificationTrigger {
  channels: string[];
  enabled: boolean;
  event: string;
}

export interface FaCamera {
  id: string;
  name: string;
  status: "offline" | "online";
  stream_url?: string;
  zone: string;
}

export interface FaAssetDocDownload {
  content_type: string;
  download_url: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: string;
}

export interface FaSummary {
  [key: string]: number | string;
}

/* ============================================================
   Approval Workflows
   ============================================================ */

export type ApprovalType =
  | "disposal"
  | "transfer"
  | "maintenance"
  | "acquisition"
  | "write-off"
  | "revaluation";

export type ApprovalStatus =
  | "pending"
  | "in-review"
  | "approved"
  | "rejected"
  | "withdrawn"
  | "escalated";

export type ApprovalPriority = "low" | "medium" | "high" | "critical";

export interface FaApprovalStep {
  approverName: string;
  approverRole: string;
  comment?: string;
  decidedAt: string | null;
  name: string;
  order: number;
  role: string;
  status: "pending" | "approved" | "rejected" | "skipped";
}

export interface FaApprovalRequest {
  amount: number;
  assetId: string;
  assetName: string;
  createdAt: string;
  currentStep: number;
  description: string;
  id: string;
  priority: ApprovalPriority;
  requesterName: string;
  steps: FaApprovalStep[];
  status: ApprovalStatus;
  totalSteps: number;
  type: ApprovalType;
  updatedAt: string;
}

export interface FaApprovalRule {
  appliesTo: ApprovalType;
  conditions: string;
  escalationAfterHours: number;
  id: string;
  isActive: boolean;
  minAmount: number;
  name: string;
  steps: { approverRole: string; name: string; order: number }[];
  thresholdDays: number;
}

export interface FaApprovalStats {
  avgApprovalHours: number;
  escalated: number;
  pending: number;
  pendingCritical: number;
  rejectedThisMonth: number;
  SLACompliance: number;
}

/* ============================================================
   Asset Lifecycle
   ============================================================ */

export type LifecycleStage =
  | "planning"
  | "procurement"
  | "received"
  | "tagged"
  | "deployed"
  | "in-use"
  | "maintenance"
  | "checked-out"
  | "transfer"
  | "audit"
  | "disposal"
  | "retired";

export interface FaLifecycleEvent {
  actor: string;
  detail: string;
  eventId: string;
  fromStage: LifecycleStage | null;
  metadata?: Record<string, string>;
  notes?: string;
  stage: LifecycleStage;
  timestamp: string;
  type: string;
}

export interface FaLifecycleAsset {
  acquisitionDate: string;
  acquisitionValue: number;
  ageDays: number;
  cat: AssetCategory;
  currentValue: number;
  currentStage: LifecycleStage;
  custodian: string;
  depreciationRate: number;
  epc: string;
  events: FaLifecycleEvent[];
  id: string;
  lifecycleProgress: number;
  loc: string;
  name: string;
  netBookValue: number;
  serial: string;
  status: AssetStatus;
  totalEvents: number;
  warrantyExpiry: string;
}

export interface FaLifecycleSummary {
  acquiring: number;
  disposed: number;
  inUse: number;
  retired: number;
  totalAssets: number;
}

/* ============================================================
   Predictive Maintenance Analytics
   ============================================================ */

export type PredictionSeverity = "critical" | "warning" | "watch" | "healthy";

export interface FaPredictionResult {
  accuracy: number;
  assetCat: AssetCategory;
  assetId: string;
  assetName: string;
  confidence: number;
  currentHealth: number;
  daysToFailure: number;
  estimatedCost: number;
  failedPart: string;
  failureMode: string;
  lastUpdated: string;
  loc: string;
  modelName: string;
  recommendedAction: string;
  recommendedActionDate: string;
  rul: number;
  runHours: number;
  severity: PredictionSeverity;
  trendData: number[];
}

export interface FaPredictiveModel {
  accuracy: number;
  active: boolean;
  assetCount: number;
  assetScope: string;
  avgConfidence: number;
  createdAt: string;
  features: string[];
  falsePositives: number;
  id: string;
  lastTrained: string;
  modelType: string;
  name: string;
  pendingRetrain: boolean;
  precision: number;
  predictions: number;
  recall: number;
  status: "active" | "training" | "stale" | "disabled";
  truePositives: number;
  version: string;
}

export interface FaPredictiveSummary {
  avgAccuracy: number;
  avgConfidence: number;
  criticalPredictions: number;
  healthy: number;
  modelsActive: number;
  totalAssetsMonitored: number;
  totalPredictions: number;
  watchItems: number;
  warningItems: number;
}

/* ============================================================
   Financial Integration
   ============================================================ */

export type JournalType =
  | "acquisition"
  | "depreciation"
  | "disposal"
  | "revaluation"
  | "transfer"
  | "maintenance"
  | "write-off";

export type JournalStatus = "draft" | "posted" | "reversed" | "pending";

export interface FaJournalEntry {
  accountCode: string;
  accountName: string;
  amount: number;
  assetId: string;
  assetName: string;
  createdAt: string;
  createdBy: string;
  credit: number;
  debit: number;
  description: string;
  id: string;
  postedAt: string | null;
  reference: string;
  source: string;
  status: JournalStatus;
  type: JournalType;
}

export interface FaDepreciationSchedule {
  accumulatedDepreciation: number;
  ageMonths: number;
  ageYears: number;
  assetId: string;
  assetName: string;
  cat: AssetCategory;
  currentValue: number;
  depreciationMethod: string;
  depreciableBase: number;
  depreciationRate: number;
  estimatedLife: number;
  fullyDepreciatedDate: string | null;
  monthlyDepreciation: number;
  netBookValue: number;
  remainingLife: number;
  residualValue: number;
  salvageValue: number;
  schedule: {
    depreciation: number;
    month: string;
    nbv: number;
    year: number;
  }[];
  status: "active" | "fully-depreciated" | "disposed";
  usefulLife: number;
}

export interface FaBastDocument {
  assetId: string;
  assetName: string;
  createdAt: string;
  disposalId: string;
  documentId: string;
  downloadUrl: string;
  handoverDate: string;
  recipientName: string;
  recipientRole: string;
  signedAt: string | null;
  signerName: string;
  status: "draft" | "pending-signature" | "signed" | "voided";
  type: string;
}

export interface FaFinanceSummary {
  accumulatedDepreciation: number;
  bastsGenerated: number;
  glIntegrationStatus: "connected" | "disconnected" | "error";
  journalEntriesPending: number;
  journalEntriesPosted: number;
  netBookValue: number;
  pendingPostings: number;
  postSuccessRate: number;
  totalAcquisitionValue: number;
  totalAssets: number;
}

export interface FaInsurancePolicy {
  assetCount: number;
  coverageAmount: number;
  expiryDate: string;
  id: string;
  insurer: string;
  policyNumber: string;
  premium: number;
  status: "active" | "expiring-soon" | "expired" | "renewing";
  type: string;
}
