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
  asset_code: string;
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
  cat: AssetCategory;
  cost: number;
  nbv: number;
  pct: number;
}

export interface FaRfidRead {
  asset: string;
  custodian: string;
  epc: string;
  last_read_at: string;
  reader_id?: string | null;
  rssi?: number | null;
}

export interface FaActivityItem {
  action_type: string;
  created_at: string;
  description: string;
  id: string;
}

export interface FaMaintenanceUpcoming {
  asset: string;
  asset_code: string;
  assigned_to: string;
  created_at: string;
  desc: string;
  priority: string;
  status: string;
  type: string;
}

export interface FaDisposalApprovalHistoryItem {
  acted_at: string;
  action: string;
  approver: string;
  notes?: string;
  stage: string;
}

export interface FaDisposalItem {
  a: string;
  approval_history?: FaDisposalApprovalHistoryItem[];
  cat: AssetCategory;
  id: string;
  nbv: number;
  reason: string;
  rec: number;
  status: string;
  tone: string;
}

export interface FaDisposalSummary {
  approved: number;
  pending: number;
  total_nbv: number;
  total_recovery: number;
}

export interface FaMaintenanceSummary {
  avg_run_hours: number;
  critical_alerts: number;
  mtbf_days: number;
  open_wo: number;
  overdue_pm: number;
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
  status?: string;
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
  health_score: number;
  id: string;
  lastSeenLabel: string;
  lastSeenMin: number;
  loc: string;
  mtbf_days: number;
  name: string;
  next_pm_days: number;
  run_hours: number;
  since_maint_days: number;
  status: "critical" | "alert" | "watch" | "ok";
}

export interface FaPreUseAsset {
  asset: string;
  cat: AssetCategory;
  checks: string[];
  critical: boolean;
  dueIn: string;
  fail_item?: string;
  id: string;
  interval: string;
  lastCheckLabel: string;
  last_checker: string;
  last_result: "pass" | "fail";
  overdue: boolean;
  streak: number;
}

export interface FaPmScheduleItem {
  asset: string;
  asset_code: string;
  assigned_to: string;
  created_at: string;
  desc: string;
  priority: string;
  status: string;
}

export interface FaPmRule {
  auto_wo: boolean;
  name: string;
  remind: string;
  scope: string;
  tone: string;
  trigger: string;
}

export interface FaWorkOrder {
  asset: string;
  asset_id: string;
  assigned_to: string;
  cat: AssetCategory;
  created_at: string;
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
  asset_id: string;
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
  asset_id: string;
  encoded_at: string;
  epc: string;
  format: string;
  id: string;
  last_read: string;
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
  asset_id: string;
  by: string;
  condition: "excellent" | "good" | "fair";
  due_date: string;
  id: string;
  out_date: string;
  purpose: string;
  return_date: string | null;
  status: "active" | "returned" | "overdue";
}

export interface FaCheckOutSummary {
  active: number;
  avg_duration_days: number;
  on_time_rate: number;
  overdue: number;
}

export interface FaDoc {
  d: string;
  n: string;
}

export interface FaReportTemplate {
  desc: string;
  icon: string;
  id: string;
  last_run: string;
  name: string;
  tone: string;
}

export interface FaMasterDataRow {
  address?: string;
  city?: string;
  code?: string;
  contact?: string;
  count: number;
  department?: string;
  depreciation_method?: string;
  desc: string;
  email?: string;
  employee_id?: string;
  id: string;
  name: string;
  phone?: string;
  psak16_code?: string;
  useful_life_years?: number;
}

export interface FaUser {
  department: string;
  email: string;
  id: string;
  last_active: string;
  name: string;
  role: string;
  status: "active" | "inactive" | "suspended";
}

export interface FaUserSummary {
  active_rate: number;
  pending_invites: number;
  roles_count: number;
  total_users: number;
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

export interface FaRtlsSummary {
  avg_accuracy_m: number;
  missing_24h: number;
  online_readers: number;
  tracked_assets: number;
  zones_active: number;
}

export interface FaRTLSFloorPlanRoom {
  h: number;
  id: string;
  label: string;
  type: "gate" | "room" | "zone";
  w: number;
  x: number;
  y: number;
}

export interface FaRTLSFloorPlan {
  floor_plan_url: string;
  height: number;
  rooms?: FaRTLSFloorPlanRoom[];
  width: number;
}

export interface UpsertRTLSFloorPlanRequest {
  floor: string;
  floor_plan_url?: string;
  height: number;
  rooms: FaRTLSFloorPlanRoom[];
  site_id: string;
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

export interface FaAuditSignOffEntry {
  role: FaAuditSignOffRole;
  signed_at: string;
  user_name: string;
}

export interface FaAuditSession {
  id: string;
  name: string;
  required_sign_off: number;
  sign_off_count: number;
  sign_offs: FaAuditSignOffEntry[];
  status: string;
}

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
  status: "failed" | "generating" | "ready";
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
  page?: number;
  custodian?: string;
  limit?: number;
  loc?: string;
  q?: string;
  status?: AssetStatus;
  store_id?: string;
}

export interface FaRfidTagFilterOptions {
  asset_id?: string;
  page?: number;
  limit?: number;
  q?: string;
  status?: "active" | "inactive" | "lost";
}

export interface FaRfidTagOrderLine {
  cat: string;
  id: string;
  qty: number;
  size: string;
  tag_type: string;
}

export interface FaRfidTagOrder {
  created_at: string;
  id: string;
  lines: FaRfidTagOrderLine[];
  order_no: string;
  status: "placed" | "received" | "cancelled";
  supplier: string;
  total_qty: number;
}

export interface FaRfidTagOrderFilterOptions {
  page?: number;
  limit?: number;
  status?: "placed" | "received" | "cancelled";
}

export interface FaDisposalFilterOptions {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected" | "revision" | "completed";
}

export interface FaCheckOutFilterOptions {
  page?: number;
  limit?: number;
  status?: "active" | "returned" | "overdue";
}

export interface FaTransferFilterOptions {
  page?: number;
  limit?: number;
  status?: "dispatched" | "in-transit" | "received";
}

export interface FaPOFilterOptions {
  page?: number;
  limit?: number;
  status?: "pending" | "partial" | "received";
}

export interface FaSecurityAlertFilterOptions {
  page?: number;
  limit?: number;
  severity?: "critical" | "high" | "medium" | "low";
  status?: "active" | "investigating" | "resolved";
}

export interface FaUserFilterOptions {
  page?: number;
  limit?: number;
  q?: string;
  role?: "Admin" | "Manager" | "Auditor" | "Operator" | "Viewer";
  status?: string;
}

export interface FaUserAuditLogFilterOptions {
  page?: number;
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
  auto_wo: boolean;
  name: string;
  reminder_days: number[];
  scope: string;
  trigger_type: string;
  trigger_value: number;
}

export interface StartAuditSessionRequest {
  name?: string;
  required_sign_off?: number;
}

export interface StartAuditSessionResult {
  audit_id: string;
  name: string;
  status: string;
  zone_count: number;
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
  role: string;
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

export type ApprovalScope =
  | "organization"
  | "category"
  | "cost_center"
  | "store";

export interface FaApprovalStep {
  acted_at: string | null;
  approver_id: string | null;
  approver_name: string | null;
  assigned_at: string;
  decision_notes: string | null;
  escalated_at: string | null;
  escalated_to_id: string | null;
  id: string;
  status: string;
  step_name: string;
  step_order: number;
}

export interface FaApprovalRequest {
  completed_at: string | null;
  current_step: number;
  description: string | null;
  id: string;
  requester_id: string;
  source_entity_id: number;
  source_entity_type: string | null;
  status: ApprovalStatus;
  steps: FaApprovalStep[];
  submitted_at: string;
  title: string;
  tone: string;
  type: ApprovalType;
}

export interface FaApprovalRule {
  approval_type: ApprovalType;
  conditions: Record<string, unknown>;
  created_at: string;
  id: string;
  is_active: boolean;
  name: string;
  priority: number;
  scope: ApprovalScope;
  scope_value: string | null;
  updated_at: string;
  workflow_steps: Record<string, unknown>[];
}

export interface FaApprovalStats {
  approved: number;
  escalated: number;
  in_review: number;
  pending: number;
  rejected: number;
  withdrawn: number;
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
  actor_name: string;
  asset_code: string;
  asset_id: number;
  asset_name: string;
  detail: string;
  event_type: string;
  ext_id: string;
  from_stage: string | null;
  metadata: Record<string, unknown>;
  notes: string | null;
  stage: string;
  timestamp: string;
}

export interface FaLifecycleSummary {
  acquiring: number;
  disposed: number;
  in_use: number;
  retired: number;
  total_assets: number;
}

/* ============================================================
   Predictive Maintenance Analytics
   ============================================================ */

export type PredictionSeverity = "critical" | "warning" | "watch" | "healthy";

export interface FaPredictionResult {
  asset_code: string;
  asset_id: number;
  asset_name: string;
  confidence: number;
  current_health: number;
  days_to_failure: number;
  estimated_cost: number;
  ext_id: string;
  failed_part: string | null;
  failure_mode: string | null;
  last_updated: string;
  model_id: number;
  model_name: string;
  recommended_action: string | null;
  recommended_action_date: string | null;
  severity: PredictionSeverity;
  trend_data: Record<string, unknown>;
}

export interface FaPredictiveModel {
  accuracy: number;
  asset_count: number;
  asset_scope: string;
  avg_confidence: number;
  created_at: string;
  ext_id: string;
  false_positives: number;
  features: string[];
  is_active: boolean;
  last_trained_at: string | null;
  model_type: string;
  name: string;
  pending_retrain: boolean;
  precision: number;
  recall: number;
  total_predictions: number;
  true_positives: number;
  version: string;
}

export type FaPredictiveSummary = Record<string, number>;

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
  created_at: string;
  document_type: string;
  ext_id: string;
  file_size: number;
  file_url: string;
  handover_date: string | null;
  recipient_name: string;
  recipient_role: string;
  reference_id: number;
  reference_type: string;
  signed_at: string | null;
  signer_name: string | null;
  status: string;
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
  asset_count: number;
  contact_email: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  coverage_amount: number;
  created_at: string;
  document_url: string | null;
  expiry_date: string | null;
  ext_id: string;
  insurer_name: string;
  next_renewal_date: string | null;
  policy_number: string;
  policy_type: string;
  premium: number;
  renewal_reminder_days: number;
  status: string;
}
