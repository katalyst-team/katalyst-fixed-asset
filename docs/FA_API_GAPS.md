# Fixed Assets — API Gaps (Backend Not Yet Provided)

> Generated from UI-to-spec gap analysis. The existing spec (`FA_API_REQUIREMENTS.md`)
> covers 58 endpoints. This doc lists features in the UI that **have no corresponding
> backend endpoint** or where existing endpoints need **additional fields**.

---

## A. Missing Endpoints (14)

### A1. Reservations

UI: `modals/ReservationModal.tsx`

```
POST /v1/organizations/{org_id}/fa/reservations
GET  /v1/organizations/{org_id}/fa/reservations
```

```typescript
// POST request
{
  asset_id: string;
  reserved_by: string;
  start_time: string;      // ISO datetime
  duration: string;        // "2 hours" | "4 hours" | "Full day" | "2 days" | "1 week"
  purpose?: string;
}

// GET response data
{
  reservations: Array<{
    id: string;
    asset_id: string;
    asset_name: string;
    reserved_by: string;
    start_time: string;
    end_time: string;
    status: "upcoming" | "active" | "completed" | "cancelled";
  }>;
}
```

---

### A2. EPC Range Registration

UI: `modals/EpcRangeModal.tsx`

```
POST /v1/organizations/{org_id}/fa/epc-ranges
GET  /v1/organizations/{org_id}/fa/epc-ranges
```

```typescript
// POST request
{
  company_prefix: string;   // GS1 company prefix
  filter_value: string;     // asset-type filter
  encoding_format: string;  // "SGTIN-96" | "GID-96" | ...
  range_start: string;
  range_end: string;
}
```

---

### A3. Export (CSV/Excel)

UI: `FaRegisterPage`, `FaRfidTagsPage`, `FaDashboardPage`, `FaCheckOutPage`, `FaScanOutPage`

```
POST /v1/organizations/{org_id}/fa/exports
```

```typescript
// Request
{
  source: "assets" | "rfid-tags" | "check-outs" | "disposals" | "transfers" | "dashboard";
  format: "csv" | "excel";
  filters?: Record<string, unknown>;  // same filters as the list endpoint
}

// Response data
{
  download_url: string;
  expires_at: string;
}
```

> Alternative: reuse `POST /fa/reports/generate` with predefined templates per source.

---

### A4. Scan-In History

UI: `FaScanInPage.tsx` — receiving history panel

```
GET /v1/organizations/{org_id}/fa/scan-in/history
```

```typescript
// Query params: cursor, limit
// Response data
{
  history: Array<{
    id: string;
    po_id: string;
    asset_id: string;
    asset_name: string;
    epc: string;
    deployed_at: string;
    deployed_by: string;
  }>;
}
```

---

### A5. Transfer History (detailed)

UI: `modals/TransferHistoryModal.tsx`

```
GET /v1/organizations/{org_id}/fa/transfers/history
```

```typescript
// Response data
{
  history: Array<{
    id: string;
    asset_name: string;
    from_loc: string;
    to_loc: string;
    initiated_by: string;
    dispatched_at: string;
    received_at: string | null;
    status: string;
    cost_center: string;
  }>;
}
```

> Current `GET /fa/transfers` exists but lacks `cost_center`, `initiated_by`, and
> timestamp detail fields needed for the history modal.

---

### A6. Saved RTLS Queries

UI: `FaRTLSPage.tsx`

```
GET  /v1/organizations/{org_id}/fa/rtls/saved-queries
POST /v1/organizations/{org_id}/fa/rtls/saved-queries
DELETE /v1/organizations/{org_id}/fa/rtls/saved-queries/{id}
```

```typescript
// POST request
{
  name: string;
  site_id: string;
  floor: string;
  zone?: string;
  filters?: Record<string, unknown>;
}
```

---

### A7. Billing / Subscription

UI: `FaSettingsPage.tsx` → BillingPanel

```
GET /v1/organizations/{org_id}/fa/billing
GET /v1/organizations/{org_id}/fa/billing/invoices
```

```typescript
// Response data (billing)
{
  plan: string;              // "Enterprise"
  seat_count: number;
  seats_used: number;
  asset_count: number;
  asset_limit: number;
  storage_used_mb: number;
  storage_limit_mb: number;
  renewal_date: string;
}

// Response data (invoices)
{
  invoices: Array<{
    id: string;
    date: string;
    amount: number;
    status: "paid" | "pending" | "overdue";
    download_url: string;
  }>;
}
```

---

### A8. Roles & Permissions

UI: `FaUsersPage.tsx` — Roles tab (currently hardcoded 6 roles)

```
GET /v1/organizations/{org_id}/fa/roles
PUT /v1/organizations/{org_id}/fa/roles/{role_id}
```

```typescript
// Response data
{
  roles: Array<{
    id: string;
    name: string;
    description: string;
    user_count: number;
    permissions: string[];   // ["All Modules", "Settings", ...]
  }>;
}
```

---

### A9. Report Preview & History

UI: `FaReportsPage.tsx`

```
GET /v1/organizations/{org_id}/fa/reports/{report_id}/preview
GET /v1/organizations/{org_id}/fa/reports/history
```

```typescript
// Preview response data
{
  html: string;              // or download_url
  generated_at: string;
}

// History response data
{
  reports: Array<{
    id: string;
    template_id: string;
    template_name: string;
    format: string;
    generated_at: string;
    generated_by: string;
    download_url: string;
    status: "ready" | "failed";
  }>;
}
```

---

### A10. RFID Reader Inventory & Health

UI: `FaSettingsPage.tsx` → RFID Hardware panel

```
GET /v1/organizations/{org_id}/fa/rfid-readers
```

```typescript
// Response data
{
  readers: Array<{
    id: string;
    name: string;
    model: string;
    location: string;
    ip: string;
    status: "online" | "offline" | "error";
    last_heartbeat: string;
    firmware_version: string;
    antenna_count: number;
  }>;
}
```

---

### A11. Notification Trigger Matrix

UI: `FaSettingsPage.tsx` → Notifications panel

The current `GET /fa/settings` returns `notifications.email_enabled` and
`maintenance_reminder_days[]`, but the UI has a full trigger matrix
(per-event × per-channel toggles). Need:

```
GET /v1/organizations/{org_id}/fa/settings/notifications/triggers
PUT /v1/organizations/{org_id}/fa/settings/notifications/triggers
```

```typescript
// Triggers
{
  triggers: Array<{
    event: string;            // "transfer_dispatched" | "disposal_approved" | ...
    channels: string[];       // ["email", "push", "sms"]
    enabled: boolean;
  }>;
}
```

---

### A12. CCTV Camera Feed

UI: `FaSecurityPage.tsx`

```
GET /v1/organizations/{org_id}/fa/security/cameras
GET /v1/organizations/{org_id}/fa/security/cameras/{camera_id}/feed
```

```typescript
// Cameras list
{
  cameras: Array<{
    id: string;
    name: string;
    zone: string;
    status: "online" | "offline";
    stream_url?: string;
  }>;
}
```

---

### A13. Asset Document Download

UI: `FaDetailPage.tsx` — Documents tab

The `GET /fa/assets/{id}` response includes `docs[]` with `{ id, title, ... }`
but no download URL. Need:

```
GET /v1/organizations/{org_id}/fa/assets/{asset_id}/docs/{doc_id}
```

```typescript
// Response data
{
  download_url: string;
  file_size: number;
  content_type: string;
  uploaded_at: string;
  uploaded_by: string;
}
```

---

### A14. Audit Report PDF Export

UI: `FaAuditPage.tsx`

```
POST /v1/organizations/{org_id}/fa/audit/{audit_id}/report
```

```typescript
// Response: binary PDF or { download_url: string }
```

---

## B. Existing Endpoints Needing Additional Fields

### B1. List Endpoints Needing Summary/KPI Block

Every page renders `<FaKpiStrip>` with hardcoded metrics. The corresponding GET
endpoints should return a `summary` block alongside the list data.

| Endpoint | Needed summary fields |
|----------|---------------------|
| `GET /fa/rfid-tags` | `total_tags`, `active`, `lost`, `unprinted` |
| `GET /fa/security/alerts` | `total`, `critical`, `investigating`, `resolution_rate` |
| `GET /fa/audit/zones` | `total_assets`, `found`, `variance_nbv`, `zones_total`, `zones_scanned` |
| `GET /fa/users` | `total_users`, `active_rate`, `roles_count`, `pending_invites` |
| `GET /fa/dashboard` | (already has most KPIs, but verify) |
| `GET /fa/check-outs` | `active`, `overdue`, `on_time_rate`, `avg_duration_days` |
| `GET /fa/transfers` | `in_transit`, `dispatched`, `received_total`, `late_rate` |
| `GET /fa/disposals` | `pending`, `approved`, `total_recovery`, `total_nbv` |
| `GET /fa/reports/templates` | `total_templates`, `ready_count`, `last_run_status` |
| `GET /fa/maintenance` | `open_wo`, `critical_alerts`, `overdue_pm`, `avg_run_hours` |
| `GET /fa/rtls/positions` | `tracked_assets`, `avg_accuracy_m`, `online_readers`, `zones_active` |

**Suggested response shape:**

```typescript
{
  data: { /* existing list data */ },
  summary: {
    [key: string]: string | number;   // page-specific KPI fields
  }
}
```

---

### B2. Floor Plan Needs Room/Zone Metadata

`GET /fa/rtls/floor-plan` currently returns `{ floor_plan_url, width, height }`.
The UI renders labeled rooms/zones on the SVG. Need:

```typescript
{
  floor_plan_url: string;
  width: number;
  height: number;
  rooms: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
    type: "room" | "zone" | "gate";
  }>;
}
```

---

### B3. Asset Detail Needs Health/Utilization Metrics

`GET /fa/assets/{id}` returns `depreciationSchedule[]` but the UI's Overview tab
shows health score, utilization %, and status. Need:

```typescript
{
  asset: FaAsset & {
    health_score?: number;        // 0-100
    utilization_pct?: number;     // 0-100
    // ... existing FaAssetDetail fields
  }
}
```

---

### B4. Disposal Detail Needs Approval Stage History

`GET /fa/disposals` returns `FaDisposalItem[]` with `status` (current stage).
The UI renders a full 5-step approval timeline. Need per-disposal:

```typescript
{
  approval_history: Array<{
    stage: string;
    approver: string;
    acted_at: string;
    action: "approved" | "rejected" | "revised" | "pending";
    notes?: string;
  }>;
}
```

---

### B5. Settings Integration List is Incomplete

`GET /fa/settings.integrations` returns `{ erp, active_directory, email_provider }`.
The UI shows 8 integration cards (DJP, BPJS, Zebra, SATO, Slack, etc.). Need:

```typescript
{
  integrations: {
    erp: { connected: boolean; type?: string };
    active_directory: { connected: boolean };
    email_provider: { connected: boolean };
    // Add these:
    accounting?: { connected: boolean; type?: "djp" | "bpjs" | "quickbooks" };
    label_printers?: { connected: boolean; devices?: string[] };
    messaging?: { connected: boolean; type?: "slack" | "teams" };
  };
}
```

---

## C. Structural Frontend Issue: Modal System Not Mounted

`FaModalProvider` / `FaModalRoot` are defined but **never mounted** in the app tree.
All 11 modals are unreachable. This is a frontend-only fix (no backend needed):

- Mount `<FaModalProvider>` in `FaShell.tsx` or `_app.tsx`
- Replace `toast.info("Opening form…")` calls with `openModal("checkOut")`, etc.

Modals with working mutations ready to connect:
- `CheckOutModal` → `useCreateCheckOutMutation`
- `TransferModal` → `useCreateTransferMutation`
- `DisposalRequestModal` → `useCreateDisposalMutation`
- `WorkOrderModal` → `useCreateWorkOrderMutation`
- `ReservationModal` → needs `POST /fa/reservations` (A1)
- `PmRuleModal` → `useCreatePmRuleMutation`
- `OrderStockModal` → `useOrderRFIDTagsMutation`
- `EditAssetModal` → `useUpdateAssetMutation`
- `EpcRangeModal` → needs `POST /fa/epc-ranges` (A2)
- `LocateAssetModal` → already wired (uses `useGetAssetRegisterQuery`)

---

## Summary

| Category | Count | Backend Needed? |
|----------|-------|-----------------|
| **A. Missing endpoints** | 14 | Yes |
| **B. Existing endpoints need more fields** | 5 | Yes (schema additions) |
| **C. Modal system not mounted** | 1 | No (frontend fix) |
| **Hardcoded data → existing API** | 20 | Mostly no (use existing endpoints better) |
| **Hardcoded KPI metrics** | 12 pages | Yes (add `summary` blocks) |

### Priority for Backend

1. **Reservations** (A1) — no endpoint at all, modal is blocked
2. **Export** (A3) — 5 pages need this
3. **Summary/KPI blocks** (B1) — 12 pages show fake metrics
4. **Roles & Permissions** (A8) — Users page is fully hardcoded
5. **Billing** (A7) — Settings page BillingPanel is fully hardcoded
6. **RFID Readers** (A10) — Settings RFID panel is hardcoded
7. Everything else can follow
