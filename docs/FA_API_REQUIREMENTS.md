# Fixed Assets — API Requirements

> Comprehensive endpoint specification for the Fixed Assets module.
> Frontend stubs live in `src/services/fixed-assets/` and `src/hooks/api/fixed-assets/`.
> All types defined in `src/types/fixed-assets.ts`.

## Conventions

| Item | Value |
|------|-------|
| Base URL | `NEXT_PUBLIC_ENDPOINT_URL` (e.g. `http://localhost:8000/api`) |
| Auth | JWT in cookies (`token`, `refresh_token`) — auto-refresh handled by `fetcher` |
| Org scope | Every endpoint takes `organization_id` as path param or query param |
| Store scope | Optional `store_id` / `store_ids` for multi-store filtering |
| Pagination | Cursor-based: `next_cursor` / `prev_cursor` |
| Response | `ApiResponse<T>` wrapper: `{ data, metadata, pagination, message }` |

### Standard Response Envelope

```typescript
interface ApiResponse<T> {
  data: T;
  message: string;
  metadata: {
    code: string;           // "200"
    correlation_id: string;
    message: string;
    server_time: number;     // epoch ms
    success: boolean;
  };
  pagination: {
    count: number;           // items in current page
    total_count: number;     // total matching items
    next_cursor: string;     // "" if no more
    prev_cursor: string;     // "" if at start
  };
}
```

### Error Response

```typescript
interface ApiError {
  metadata: {
    code: string;            // "400" | "401" | "403" | "404" | "422" | "500"
    success: false;
    message: string;
  };
  // validation errors (422):
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

---

## 1. Dashboard

### `GET /v1/organizations/{organization_id}/fa/dashboard`

Aggregated dashboard data (KPIs, activity feed, site rollup, live RFID reads).

**Query params:** (none)

**Response `data`:**
```typescript
{
  activity: FaActivityItem[];          // recent system events
  categoryStats: FaCategoryStat[];     // asset count + value by category
  financialCategories: FaFinancialCategory[]; // cost / NBV / pct by class
  maintenanceUpcoming: FaMaintenanceUpcoming[]; // next 5-7 PM items
  rfidReads: FaRfidRead[];             // last ~8 RFID gate events
  sites: FaSite[];                     // per-site asset count + value
}
```

**Types:**
```typescript
interface FaActivityItem {
  t: string;       // timestamp label ("2m ago")
  txt: string;     // event description
  icon: string;    // icon key
  ic: string;      // icon color key
  id?: string;     // related entity ID
  go?: string;     // navigation target
}

interface FaCategoryStat {
  cat: AssetCategory;  // "it" | "tool" | "furn" | "veh" | "lab" | "med" | "mach"
  n: string;           // count label ("48")
  pct: number;         // percentage of total
  v: number;           // total value (IDR)
}

interface FaFinancialCategory {
  n: string;       // class name ("IT Equipment")
  cost: number;    // acquisition cost
  nbv: number;     // net book value
  pct: number;     // % of total NBV
}

interface FaRfidRead {
  t: string;           // time label
  a: string;           // asset name
  g: string;           // gate/reader ID
  dir: "in" | "out";   // direction
  rssi: number;        // signal strength
  who: string;         // person (if known)
}

interface FaSite {
  n: string;            // site name
  sub?: string;         // sub-location
  city: string;
  assets: string;       // asset count label
  val: number;          // total asset value
  pct: number;          // % of org total
  status: "on" | "off"; // online status
}

interface FaMaintenanceUpcoming {
  t: string;     // task name
  d: string;     // due date label
  dt: string;    // date detail
  icon: string;  // icon key
  tone: string;  // "info" | "warn" | "danger"
}
```

---

## 2. Asset Register

### `GET /v1/organizations/{organization_id}/fa/assets`

Paginated, filterable asset list.

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search by name, ID, serial, EPC |
| `cat` | AssetCategory | Filter by category |
| `status` | AssetStatus | Filter by status |
| `loc` | string | Filter by location |
| `custodian` | string | Filter by custodian |
| `store_id` | string | Store scope |
| `cursor` | string | Pagination cursor |
| `limit` | number | Page size (default 20) |

**Response `data`:**
```typescript
{
  assets: FaAsset[];
}
```

**Type:**
```typescript
interface FaAsset {
  id: string;            // asset ID ("IT-LP-9847")
  name: string;
  cat: AssetCategory;
  loc: string;           // location label
  custodian: string;
  status: AssetStatus;   // "deployed" | "in-service" | "checked-out" | "maint" | "idle" | "retired"
  val: number;           // acquisition value (IDR)
  dep: number;           // accumulated depreciation (IDR)
  age: number;           // age in days
  epc: string;           // RFID EPC code
  serial: string;
  supplier: string;
  purchased: string;     // purchase date label
  warranty: string;      // warranty info label
  spark: number[];       // utilization sparkline (14 data points)
}

type AssetCategory = "it" | "tool" | "furn" | "veh" | "lab" | "med" | "mach";
type AssetStatus = "deployed" | "in-service" | "checked-out" | "maint" | "idle" | "retired";
```

### `GET /v1/organizations/{organization_id}/fa/assets/{asset_id}`

Single asset detail (includes activity log, maintenance history, depreciation schedule, documents).

**Response `data`:**
```typescript
{
  asset: FaAsset & {
    docs?: FaDoc[];                    // attached documents
    activityLog?: FaActivityItem[];    // asset-specific events
    maintenanceHistory?: FaWorkOrder[]; // past work orders
    depreciationSchedule?: Array<{     // NBV projection
      year: number;
      cost: number;
      depreciation: number;
      nbv: number;
    }>;
  } | null;
}
```

### `POST /v1/organizations/{organization_id}/fa/assets`

Create a single asset (manual registration).

**Request body:**
```typescript
{
  name: string;
  cat: AssetCategory;
  loc: string;
  custodian: string;
  val: number;
  serial: string;
  supplier: string;
  purchased: string;        // ISO date
  warranty: string;
  store_id?: string;
  // Financial defaults:
  depreciation_method?: "straight-line" | "declining-balance";
  useful_life_years?: number;
  salvage_value?: number;
}
```

**Response `data`:** `{ asset: FaAsset }`

### `POST /v1/organizations/{organization_id}/fa/assets/bulk`

Bulk create assets (from CSV import or PO deployment).

**Request body:**
```typescript
{
  assets: Array<{
    name: string;
    cat: AssetCategory;
    loc: string;
    custodian: string;
    val: number;
    serial: string;
    epc: string;
    supplier: string;
    purchased: string;
    warranty: string;
  }>;
  source_po_id?: string;   // if deployed from a PO
}
```

**Response `data`:** `{ assets: FaAsset[]; created_count: number }`

### `PUT /v1/organizations/{organization_id}/fa/assets/{asset_id}`

Update asset fields.

**Request body:** `Partial<FaAsset>` (only fields being changed)

**Response `data`:** `{ asset: FaAsset }`

### `POST /v1/organizations/{organization_id}/fa/assets/bulk-update`

Bulk update (change custodian, transfer, etc. for multiple assets).

**Request body:**
```typescript
{
  asset_ids: string[];
  action: "transfer" | "dispose" | "change-custodian" | "change-location";
  payload: {
    custodian?: string;
    loc?: string;
    // ...action-specific fields
  };
}
```

**Response `data`:** `{ updated_count: number; asset_ids: string[] }`

---

## 3. Master Data

### `GET /v1/organizations/{organization_id}/fa/master-data`

Returns all master data sections. Each section contains rows of master records.

**Query params:** `tab` (optional — filter to one section: `cat` | `loc` | `cust` | `cc` | `sup` | `cls`)

**Response `data`:**
```typescript
{
  masterDataSections: FaMasterDataSection[];
}
```

**Types:**
```typescript
interface FaMasterDataSection {
  tab: string;              // "cat" | "loc" | "cust" | "cc" | "sup" | "cls"
  label: string;            // "Category" | "Location" | ...
  icon: string;             // icon key
  rows: FaMasterDataRow[];
}

interface FaMasterDataRow {
  id: string;
  name: string;
  count: number;            // number of assets using this master record
  desc: string;             // description ("7 groups · 24 sub")
}
```

### `POST /v1/organizations/{organization_id}/fa/master-data/{section}`

Create a master data record (category, location, custodian, cost center, supplier, or asset class).

**Path param:** `section` = `cat` | `loc` | `cust` | `cc` | `sup` | `cls`

**Request body:** (section-specific)
```typescript
// Category (cat)
{ name: string; parent_id?: string; depreciation_method?: string; useful_life_years?: number; }

// Location (loc)
{ name: string; parent_id?: string; address?: string; city?: string; }

// Custodian (cust)
{ name: string; email?: string; department?: string; employee_id?: string; }

// Cost Center (cc)
{ name: string; code: string; department?: string; }

// Supplier (sup)
{ name: string; contact?: string; phone?: string; email?: string; }

// Asset Class (cls)
{ name: string; psak16_code: string; depreciation_method?: string; useful_life_years?: number; }
```

**Response `data`:** `{ row: FaMasterDataRow }`

### `POST /v1/organizations/{organization_id}/fa/master-data/{section}/import`

Bulk import via CSV.

**Request body:** `multipart/form-data` with CSV file

**Response `data`:** `{ imported_count: number; errors?: Array<{ row: number; message: string }> }`

### `PUT /v1/organizations/{organization_id}/fa/master-data/{section}/{id}`

Update a master data record.

### `DELETE /v1/organizations/{organization_id}/fa/master-data/{section}/{id}`

Delete (soft-delete) a master data record. Fails if assets are still assigned.

---

## 4. RFID Tags

### `GET /v1/organizations/{organization_id}/fa/rfid-tags`

Paginated RFID tag register.

**Query params:** `q`, `status` (`active` | `inactive` | `lost`), `asset_id`, `cursor`, `limit`

**Response `data`:**
```typescript
{
  tags: FaRfidTag[];
}
```

**Type:**
```typescript
interface FaRfidTag {
  id: string;            // tag ID ("TAG-9847")
  assetId: string;
  asset: string;         // asset name
  epc: string;           // EPC code ("E280-1170-0000-50CA-9847")
  tid: string;           // TID (tag unique ID)
  format: string;        // encoding format ("SGTIN-96")
  rssi: number;          // last signal strength
  status: "active" | "inactive" | "lost";
  printed: boolean;      // label printed?
  encodedAt: string;     // encoding date
  lastRead: string;      // last read time label ("2s ago")
}
```

### `POST /v1/organizations/{organization_id}/fa/rfid-tags/encode`

Encode EPC to a blank RFID tag (hardware bridge operation).

**Request body:**
```typescript
{
  asset_id: string;
  tag_type: string;       // "Alien Higgs 9" | "Zebra ZD621" | ...
  epc_format?: string;    // default "SGTIN-96"
  reader_id?: string;     // which reader to use
}
```

**Response `data`:** `{ tag: FaRfidTag; tid: string; epc: string }`

### `POST /v1/organizations/{organization_id}/fa/rfid-tags/print`

Send tags to print queue (QZ Tray / label printer).

**Request body:**
```typescript
{
  tag_ids: string[];      // tags to print
  printer?: string;       // printer name (optional, uses default if omitted)
  label_size?: string;    // "70x40mm" | "50x30mm" | ...
}
```

**Response `data`:** `{ queued_count: number; print_job_id: string }`

### `POST /v1/organizations/{organization_id}/fa/rfid-tags/order`

Create a purchase order for blank RFID tags.

**Request body:**
```typescript
{
  items: Array<{
    cat: AssetCategory;
    qty: number;
    size: string;         // "70x40mm"
    tag_type: string;     // "Alien Higgs 9"
  }>;
  supplier: string;
}
```

**Response `data`:** `{ order_id: string; status: string }`

---

## 5. Scan-In (Asset Receiving)

### `GET /v1/organizations/{organization_id}/fa/po`

List purchase orders available for receiving.

**Query params:** `status` (`pending` | `partial` | `received`), `cursor`, `limit`

**Response `data`:**
```typescript
{
  purchase_orders: Array<{
    id: string;               // PO number
    supplier: string;
    date: string;
    expected: string;         // expected delivery
    status: "pending" | "partial" | "received";
    lines: Array<{
      id: string;
      cat: AssetCategory;
      name: string;
      qty: number;
      received: number;
      unit_cost: number;
      tag_type: string;       // suggested RFID tag type
      size: string;           // suggested label size
    }>;
  }>;
}
```

### `POST /v1/organizations/{organization_id}/fa/scan-in/deploy`

Deploy scanned/tagged assets to the register (completes the 3-step wizard).

**Request body:**
```typescript
{
  po_id: string;
  assets: Array<{
    line_id: string;
    name: string;
    serial: string;
    epc: string;
    tid: string;
    val: number;               // acquisition value
  }>;
  custodian: string;
  loc: string;                 // deployment location
  cost_center: string;
  qc_passed: boolean;          // QC checkbox
}
```

**Response `data`:** `{ assets: FaAsset[]; deployed_count: number; po_status: string }`

### `POST /v1/organizations/{organization_id}/fa/po/import`

Import a PO file (CSV/Excel upload).

**Request body:** `multipart/form-data`

**Response `data`:** `{ po_id: string; line_count: number }`

---

## 6. Scan-Out (Asset Disposal)

### `GET /v1/organizations/{organization_id}/fa/disposals`

List disposal requests in the approval queue.

**Query params:** `status` (`pending` | `approved` | `rejected` | `revision` | `completed`), `cursor`, `limit`

**Response `data`:**
```typescript
{
  disposals: FaDisposalItem[];
}
```

**Type:**
```typescript
interface FaDisposalItem {
  id: string;          // disposal request ID
  a: string;           // asset name
  cat: AssetCategory;
  nbv: number;         // net book value at disposal
  rec: number;         // recovery value (sale/scrap proceeds)
  reason: string;      // disposal reason
  status: string;      // approval stage
  tone: string;        // badge tone
}
```

### `POST /v1/organizations/{organization_id}/fa/disposals`

Create a new disposal request.

**Request body:**
```typescript
{
  asset_id: string;
  reason: "sold" | "scrapped" | "donated" | "lost" | "obsolete";
  nbv: number;
  recovery_value: number;       // 0 if scrapped/lost
  notes?: string;
}
```

**Response `data`:** `{ disposal: FaDisposalItem }`

### `POST /v1/organizations/{organization_id}/fa/disposals/{id}/approve`

Advance disposal to next approval stage.

**Response `data:** `{ disposal: FaDisposalItem; next_stage: string; journal_entry_id?: string }`

### `POST /v1/organizations/{organization_id}/fa/disposals/{id}/reject`

Reject disposal request.

**Request body:** `{ reason: string }`

### `POST /v1/organizations/{organization_id}/fa/disposals/{id}/revise`

Return for revision.

**Request body:** `{ notes: string }`

### `POST /v1/organizations/{organization_id}/fa/disposals/{id}/journal-entry`

Generate / post the disposal journal entry to GL.

**Response `data`:**
```typescript
{
  journal_entry_id: string;
  lines: Array<{
    account: string;       // "1.500 Aset Tetap"
    description: string;
    debit: number;
    credit: number;
  }>;
  posted: boolean;
}
```

### `POST /v1/organizations/{organization_id}/fa/disposals/{id}/bast`

Generate BAST (Berita Acara Serah Terima) PDF.

**Response:** Binary PDF (content-type: `application/pdf`) or `{ download_url: string }`

---

## 7. Check-Out (Asset Loans)

### `GET /v1/organizations/{organization_id}/fa/check-outs`

List check-out / loan records.

**Query params:** `status` (`active` | `returned` | `overdue`), `cursor`, `limit`

**Response `data`:**
```typescript
{
  checkOuts: FaCheckOutRecord[];
}
```

**Type:**
```typescript
interface FaCheckOutRecord {
  id: string;          // loan ID ("LOAN-0142")
  assetId: string;
  asset: string;
  by: string;          // borrower name
  condition: "excellent" | "good" | "fair";
  outDate: string;     // checkout timestamp label
  dueDate: string;     // due date label
  returnDate: string | null;
  purpose: string;
  status: "active" | "returned" | "overdue";
}
```

### `POST /v1/organizations/{organization_id}/fa/check-outs`

Create a new check-out (loan).

**Request body:**
```typescript
{
  asset_id: string;
  borrower: string;       // custodian/user ID
  out_date: string;       // ISO datetime
  due_date: string;       // ISO datetime
  purpose: string;
  condition: "excellent" | "good" | "fair";
}
```

**Response `data`:** `{ checkOut: FaCheckOutRecord }`

### `PUT /v1/organizations/{organization_id}/fa/check-outs/{id}/return`

Return an asset (close the loan).

**Request body:**
```typescript
{
  return_date: string;     // ISO datetime
  condition: "excellent" | "good" | "fair" | "damaged";
  notes?: string;
}
```

**Response `data`:** `{ checkOut: FaCheckOutRecord }`

---

## 8. Transfers

### `GET /v1/organizations/{organization_id}/fa/transfers`

List asset transfers.

**Query params:** `status` (`dispatched` | `in-transit` | `received`), `cursor`, `limit`

**Response `data`:**
```typescript
{
  transfers: FaTransferItem[];
}
```

**Type:**
```typescript
interface FaTransferItem {
  id: string;
  n: string;           // asset name
  from: string;        // source location
  to: string;          // destination
  by: string;          // initiator
  stage: number;       // 0 = dispatched, 1 = in-transit, 2 = received
  late: boolean;       // overdue receipt
}
```

### `POST /v1/organizations/{organization_id}/fa/transfers`

Create a new transfer.

**Request body:**
```typescript
{
  asset_ids: string[];
  from_loc: string;
  to_loc: string;
  custodian: string;       // receiving custodian
  expected_arrival?: string;
}
```

**Response `data`:** `{ transfer: FaTransferItem }`

### `PUT /v1/organizations/{organization_id}/fa/transfers/{id}/confirm-receipt`

Confirm receipt at destination (RFID gate auto-confirms or manual).

**Response `data`:** `{ transfer: FaTransferItem; received_at: string }`

---

## 9. Stock Audit

### `GET /v1/organizations/{organization_id}/fa/audit/zones`

List audit zones with reconciliation status.

**Query params:** `audit_id` (optional — scope to a specific audit cycle)

**Response `data`:**
```typescript
{
  zones: FaAuditZone[];
  audit_progress?: {
    total_zones: number;
    scanned_zones: number;
    pct_complete: number;
  };
}
```

**Type:**
```typescript
interface FaAuditZone {
  z: string;                // zone name
  s: number;                // system count (expected)
  f: number;                // found count (physical scan)
  v: number | string;       // variance count (f - s) or label
  nbv: number | string;     // NBV impact of variance
  tone: string;             // "success" | "warn" | "danger"
}
```

### `POST /v1/organizations/{organization_id}/fa/audit/{audit_id}/post-adjustment`

Post audit variance adjustment as a journal entry to GL.

**Request body:**
```typescript
{
  zone_id: string;
  lines: Array<{
    account: string;        // "1.500 Aset Tetap"
    description: string;
    debit: number;
    credit: number;
  }>;
}
```

**Response `data:** `{ journal_entry_id: string; posted: boolean }`

### `POST /v1/organizations/{organization_id}/fa/audit/{audit_id}/sign-off`

Submit a sign-off (one of 5 required signatures).

**Request body:**
```typescript
{
  role: "stock_count_lead" | "dept_head" | "internal_audit" | "finance_manager" | "external_accountant";
  user_id: string;
  signature: string;       // e-signature or hash
}
```

**Response `data:** `{ signed: boolean; remaining_signoffs: number }`

### `POST /v1/organizations/{organization_id}/fa/audit/{audit_id}/resume-sweep`

Resume / continue zone sweep.

**Request body:** `{ zone_id: string }`

---

## 10. Maintenance (CMMS)

### `GET /v1/organizations/{organization_id}/fa/maintenance`

Aggregated CMMS data (all 4 tabs in one call, or split into separate endpoints).

**Query params:** `tab` (optional — `flow` | `health` | `wo` | `schedule`)

**Response `data`:**
```typescript
{
  healthData: FaHealthItem[];
  pmRules: FaPmRule[];
  pmSchedule: FaPmScheduleItem[];
  preUseAssets: FaPreUseAsset[];
  workOrders: FaWorkOrder[];
}
```

**Types:**
```typescript
interface FaHealthItem {
  id: string;
  name: string;
  cat: AssetCategory;
  loc: string;
  custodian: string;
  healthScore: number;        // 0-100
  status: "critical" | "alert" | "watch" | "ok";
  ageDays: number;
  runHours: number;
  cycles: number;
  mtbfDays: number;           // mean time between failures
  sinceMaintDays: number;
  nextPMDays: number;
  lastSeenMin: number;
  lastSeenLabel: string;
  ai: string;                 // AI prediction label
}

interface FaPreUseAsset {
  id: string;
  asset: string;
  cat: AssetCategory;
  checks: string[];           // checklist items
  critical: boolean;
  interval: string;           // "Every shift (8h)"
  lastCheckLabel: string;
  lastChecker: string;
  lastResult: "pass" | "fail";
  overdue: boolean;
  streak: number;
  dueIn: string;
  failItem?: string;          // specific failure item
}

interface FaPmScheduleItem {
  id: string;
  asset: string;
  date: string;
  task: string;
  type: string;               // "PM" | "Predictive" | "Calibration" | "Warranty" | "Inspection"
  who: string;
  eta: string;
  when: string;
  tone: string;
}

interface FaPmRule {
  name: string;
  scope: string;
  trigger: string;            // "Every 90 days" | "500 cycles / 1000h"
  remind: string;             // "14d · 3d · 1d"
  autoWO: boolean;
  tone: string;
}

interface FaWorkOrder {
  id: string;                 // "WO-2410-091"
  asset: string;
  assetId: string;
  cat: AssetCategory;
  desc: string;
  type: "corrective" | "pm" | "predictive" | "inspection";
  priority: "critical" | "high" | "medium" | "low";
  status: "open" | "in-progress" | "on-hold" | "done";
  assignedTo: string;
  createdAt: string;
  eta: string;
}
```

### `POST /v1/organizations/{organization_id}/fa/work-orders`

Create a work order.

**Request body:**
```typescript
{
  asset_id: string;
  desc: string;               // issue description
  type: "corrective" | "pm" | "predictive" | "inspection";
  priority: "critical" | "high" | "medium" | "low";
  assigned_to: string;
}
```

**Response `data`:** `{ workOrder: FaWorkOrder }`

### `PUT /v1/organizations/{organization_id}/fa/work-orders/{id}/status`

Update work order status (start work → in-progress, close → done).

**Request body:** `{ status: "in-progress" | "on-hold" | "done"; notes?: string }`

### `POST /v1/organizations/{organization_id}/fa/pre-use-checks`

Submit a pre-use inspection checklist.

**Request body:**
```typescript
{
  asset_id: string;
  results: Array<{
    check: string;
    passed: boolean;
  }>;
  overall_result: "pass" | "fail";
  fail_item?: string;
  checker: string;
}
```

**Response `data:** `{ preUseCheck: FaPreUseAsset }`

### `POST /v1/organizations/{organization_id}/fa/pm-rules`

Create a preventive maintenance rule.

**Request body:** `Omit<FaPmRule, "tone"> & { scope_assets?: string[] }`

### `PUT /v1/organizations/{organization_id}/fa/pm-rules/{id}`

Update a PM rule.

---

## 11. RTLS (Real-Time Location System)

### `GET /v1/organizations/{organization_id}/fa/rtls/positions`

Current positions of all tracked assets (polled or SSE).

**Query params:** `site_id`, `floor`, `zone`

**Response `data`:**
```typescript
{
  positions: Array<{
    asset_id: string;
    name: string;
    x: number;                 // normalized 0-1 (or pixel coords)
    y: number;
    z?: number;                // floor
    last_seen: string;         // ISO datetime
    accuracy_m: number;        // positioning accuracy in meters
    anchor_ids: string[];      // BLE anchors used for triangulation
  }>;
  anchors: Array<{             // BLE anchor positions
    id: string;
    x: number;
    y: number;
    label: string;
  }>;
}
```

### `GET /v1/organizations/{organization_id}/fa/rtls/floor-plan`

Floor plan SVG/image for rendering.

**Query params:** `site_id`, `floor`

**Response `data`:** `{ floor_plan_url: string; width: number; height: number }`

> **Note:** For live tracking, consider Server-Sent Events (SSE) or WebSocket:
> `GET /v1/organizations/{org_id}/fa/rtls/stream` — pushes position updates.

---

## 12. Security / Loss Prevention

### `GET /v1/organizations/{organization_id}/fa/security/alerts`

List security alerts.

**Query params:** `severity` (`critical` | `high` | `medium` | `low`), `status` (`active` | `investigating` | `resolved`), `cursor`, `limit`

**Response `data`:**
```typescript
{
  alerts: FaSecurityAlert[];
}
```

**Type:**
```typescript
interface FaSecurityAlert {
  id: string;               // "SEC-001"
  assetId: string;
  asset: string;
  desc: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "active" | "investigating" | "resolved";
  action: "halt" | "review" | "monitor";
  zone: string;
  camera: string;           // CCTV camera ID
  time: string;             // time label
}
```

### `POST /v1/organizations/{organization_id}/fa/security/alerts/{id}/halt`

Emergency halt + page security team.

**Response `data:** `{ alert: FaSecurityAlert; paged: boolean }`

### `PUT /v1/organizations/{organization_id}/fa/security/alerts/{id}/resolve`

Mark alert as resolved.

**Request body:** `{ resolution_notes: string }`

### `POST /v1/organizations/{organization_id}/fa/security/geofence-rules`

Create / update geofence rules (allowed zones per asset category).

---

## 13. Reports

### `GET /v1/organizations/{organization_id}/fa/reports/templates`

List available report templates.

**Response `data`:**
```typescript
{
  templates: FaReportTemplate[];
}
```

**Type:**
```typescript
interface FaReportTemplate {
  id: string;          // template identifier
  name: string;
  desc: string;
  icon: string;        // icon key
  tone: string;        // badge tone
  lastRun: string;     // last generation time label
}
```

### `POST /v1/organizations/{organization_id}/fa/reports/generate`

Generate a report.

**Request body:**
```typescript
{
  template_id: string;
  format: "pdf" | "excel" | "json-ld";
  params?: {
    date_from?: string;
    date_to?: string;
    cost_center?: string;
    category?: AssetCategory;
    site_id?: string;
  };
}
```

**Response `data`:**
```typescript
{
  report_id: string;
  status: "generating" | "ready";
  download_url?: string;     // present when ready
}
```

> Long-running reports should return `202 Accepted` with a job ID, then poll
> `GET /v1/organizations/{org_id}/fa/reports/{report_id}` for status.

### `POST /v1/organizations/{organization_id}/fa/reports/generate-all`

Bulk generate all standard reports (year-end audit pack scenario).

**Request body:** `{ format: "pdf" | "excel" }`

---

## 14. Users

### `GET /v1/organizations/{organization_id}/fa/users`

List FA module users.

**Query params:** `q`, `role` (`Admin` | `Manager` | `Auditor` | `Operator` | `Viewer`), `status`, `cursor`, `limit`

**Response `data`:**
```typescript
{
  users: FaUser[];
}
```

**Type:**
```typescript
interface FaUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Auditor" | "Operator" | "Viewer";
  department: string;
  status: "active" | "invited" | "suspended";
  lastActive: string;     // time label
}
```

### `POST /v1/organizations/{organization_id}/fa/users/invite`

Invite a user to the FA module.

**Request body:**
```typescript
{
  email: string;
  role: "Admin" | "Manager" | "Auditor" | "Operator" | "Viewer";
  department: string;
}
```

### `GET /v1/organizations/{organization_id}/fa/users/audit-log`

User action audit trail (for the Audit Log tab).

**Query params:** `user_id`, `cursor`, `limit`, `date_from`, `date_to`

**Response `data`:**
```typescript
{
  logs: Array<{
    id: string;
    user_id: string;
    user_name: string;
    action: string;        // "login" | "create_asset" | "approve_disposal" | ...
    entity_type: string;
    entity_id: string;
    timestamp: string;     // ISO datetime
    ip: string;
    details?: Record<string, unknown>;
  }>;
}
```

---

## 15. Settings

### `GET /v1/organizations/{organization_id}/fa/settings`

Get all FA module settings.

**Response `data`:**
```typescript
{
  workspace: {
    company_name: string;
    npwp: string;
    currency: string;           // "IDR"
    fiscal_year_start: string;  // "January"
    depreciation_standard: string; // "PSAK 16"
    asset_id_prefix: string;
    next_asset_number: number;
  };
  notifications: {
    email_enabled: boolean;
    push_enabled: boolean;
    maintenance_reminder_days: number[];
    disposal_approval_notify: boolean;
    audit_complete_notify: boolean;
  };
  integrations: {
    erp: { connected: boolean; type?: "odoo" | "sap" | "oracle"; };
    active_directory: { connected: boolean; };
    email_provider: { connected: boolean; };
  };
  security: {
    mfa_required: boolean;
    session_timeout_min: number;
    ip_whitelist: string[];
    password_policy: string;
  };
  rfid_hardware: {
    reader_polling_interval_ms: number;
    rssi_threshold: number;
    epc_encoding: string;       // "SGTIN-96"
    default_tag_type: string;   // "Alien Higgs 9"
  };
  depreciation: {
    method: "straight-line" | "declining-balance";
    default_useful_life_years: Record<AssetCategory, number>;
  };
}
```

### `PUT /v1/organizations/{organization_id}/fa/settings`

Update settings (partial update — only changed sections).

**Request body:** `Partial` of the settings object above (per-section).

### `POST /v1/organizations/{organization_id}/fa/integrations/{type}/connect`

Connect an external integration.

**Path param:** `type` = `erp` | `active-directory` | `email`

**Request body:** (type-specific credentials/config)

---

## 16. Documents

### `GET /v1/organizations/{organization_id}/fa/docs`

List documentation articles / help guides.

**Response `data`:**
```typescript
{
  docs: Array<{
    id: string;
    title: string;
    category: string;       // "Getting Started" | "RFID" | "Audit" | ...
    icon: string;
    url: string;            // link to article
  }>;
}
```

---

## Endpoint Summary

| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | GET | `/fa/dashboard` | Dashboard aggregation |
| 2 | GET | `/fa/assets` | Asset register list |
| 3 | GET | `/fa/assets/{id}` | Asset detail |
| 4 | POST | `/fa/assets` | Create asset |
| 5 | POST | `/fa/assets/bulk` | Bulk create (CSV / PO deploy) |
| 6 | PUT | `/fa/assets/{id}` | Update asset |
| 7 | POST | `/fa/assets/bulk-update` | Bulk update (transfer/dispose/custodian) |
| 8 | GET | `/fa/master-data` | All master data sections |
| 9 | POST | `/fa/master-data/{section}` | Create master record |
| 10 | POST | `/fa/master-data/{section}/import` | CSV import |
| 11 | PUT | `/fa/master-data/{section}/{id}` | Update master record |
| 12 | DELETE | `/fa/master-data/{section}/{id}` | Delete master record |
| 13 | GET | `/fa/rfid-tags` | RFID tag register |
| 14 | POST | `/fa/rfid-tags/encode` | Encode EPC to tag |
| 15 | POST | `/fa/rfid-tags/print` | Print tag labels |
| 16 | POST | `/fa/rfid-tags/order` | Order blank tags |
| 17 | GET | `/fa/po` | List purchase orders |
| 18 | POST | `/fa/scan-in/deploy` | Deploy tagged assets |
| 19 | POST | `/fa/po/import` | Import PO file |
| 20 | GET | `/fa/disposals` | Disposal queue |
| 21 | POST | `/fa/disposals` | Create disposal |
| 22 | POST | `/fa/disposals/{id}/approve` | Approve disposal |
| 23 | POST | `/fa/disposals/{id}/reject` | Reject disposal |
| 24 | POST | `/fa/disposals/{id}/revise` | Return for revision |
| 25 | POST | `/fa/disposals/{id}/journal-entry` | Post disposal JE to GL |
| 26 | POST | `/fa/disposals/{id}/bast` | Generate BAST PDF |
| 27 | GET | `/fa/check-outs` | Loan records |
| 28 | POST | `/fa/check-outs` | Create check-out |
| 29 | PUT | `/fa/check-outs/{id}/return` | Return asset |
| 30 | GET | `/fa/transfers` | Transfer list |
| 31 | POST | `/fa/transfers` | Create transfer |
| 32 | PUT | `/fa/transfers/{id}/confirm-receipt` | Confirm receipt |
| 33 | GET | `/fa/audit/zones` | Audit zone status |
| 34 | POST | `/fa/audit/{id}/post-adjustment` | Post variance JE |
| 35 | POST | `/fa/audit/{id}/sign-off` | Submit sign-off |
| 36 | POST | `/fa/audit/{id}/resume-sweep` | Resume zone sweep |
| 37 | GET | `/fa/maintenance` | CMMS data (4 tabs) |
| 38 | POST | `/fa/work-orders` | Create work order |
| 39 | PUT | `/fa/work-orders/{id}/status` | Update WO status |
| 40 | POST | `/fa/pre-use-checks` | Submit inspection |
| 41 | POST | `/fa/pm-rules` | Create PM rule |
| 42 | PUT | `/fa/pm-rules/{id}` | Update PM rule |
| 43 | GET | `/fa/rtls/positions` | Live asset positions |
| 44 | GET | `/fa/rtls/floor-plan` | Floor plan image |
| 45 | GET | `/fa/security/alerts` | Security alerts |
| 46 | POST | `/fa/security/alerts/{id}/halt` | Emergency halt |
| 47 | PUT | `/fa/security/alerts/{id}/resolve` | Resolve alert |
| 48 | POST | `/fa/security/geofence-rules` | Manage geofence |
| 49 | GET | `/fa/reports/templates` | Report templates |
| 50 | POST | `/fa/reports/generate` | Generate report |
| 51 | POST | `/fa/reports/generate-all` | Bulk generate |
| 52 | GET | `/fa/users` | FA user list |
| 53 | POST | `/fa/users/invite` | Invite user |
| 54 | GET | `/fa/users/audit-log` | User audit trail |
| 55 | GET | `/fa/settings` | Module settings |
| 56 | PUT | `/fa/settings` | Update settings |
| 57 | POST | `/fa/integrations/{type}/connect` | Connect integration |
| 58 | GET | `/fa/docs` | Documentation list |

> All endpoints prefixed with `/v1/organizations/{organization_id}`.
> Standard query params (`cursor`, `limit`) omitted from summary for brevity.
