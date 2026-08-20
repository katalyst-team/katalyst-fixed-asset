# Fixed Assets — API Gaps (FE ↔ BE cross-audit, Aug 2026)

> **Previous versions of this doc are obsolete.** katalyst-core has since implemented
> everything from the original gap list (A1–A14 missing endpoints, B1 summary blocks,
> B2 floor-plan rooms, B3 health/utilization, B4 approval history, B5 integrations
> connect, C modal mounting). The backend now serves ~95 routes under
> `/v1/organizations/:organizationID/fa/` and 13 list endpoints return a `summary`
> block (`Summary map[string]interface{}` in `fixed_asset_response/response.go`).
>
> This doc now tracks only what is **still open**, split by where the fix belongs.

---

## 1. Backend: summary values are hardcoded placeholders — ✅ FIXED (katalyst-core `develop`, Aug 2026)

> Fixed by replacing literals with real aggregates. New `FaSummaryRepository` methods:
> `AggregateCheckOuts` (AVG days out→return), `AggregateAuditZones` (SUM system/found/NBV),
> `AggregateDisposals` (SUM NBV all, SUM recovery approved-only), `CountLateTransfers`
> (past `expected_arrival`, stage dispatched/in-transit), `CountCriticalWorkOrders`
> (critical + open/in-progress), `AggregateAssetHealth` (overdue PM via `next_pm_days < 0`,
> AVG run hours, AVG MTBF), `AggregateRtls` (AVG accuracy, online readers, distinct zones),
> `CountUnprintedRfidTags`. Users summary now derives from the AOR list
> (`active_rate`, distinct `roles_count`, `pending_invites` = INACTIVE count) — `CountUsers`
> (distinct aor_id in activity log) removed. The 9 never-called `Get*Summary` methods on
> `FaExtraService` were deleted (dead duplicate of the inline logic). Column names and the
> `FILTER`/`EXTRACT EPOCH` SQL patterns verified read-only against the staging DB.

Definitions chosen (confirm if semantics should differ):
- `late_rate` = transfers past `expected_arrival` and still dispatched/in-transit, over ALL transfers
- `total_recovery` = SUM(recovery_value) of **approved** disposals only
- `pending_invites` = AORs with status `INACTIVE`
- `critical_alerts` = work orders priority `critical` AND status open/in-progress

---

## 2. Backend: summary keys not provided at all — partially fixed (Aug 2026)

| Page | FaStat label | Status |
|---|---|---|
| `FaUsersPage` | Failed logins (24h) | still open — no auth-event source |
| `FaDashboardPage` | Utilization | ✅ `utilization_pct` on dashboard response = deployed+in-service+checked-out ÷ non-retired fleet |
| `FaScanOutPage` | Tax impact | ✅ bound to disposals `summary.total_nbv` (NBV write-off) |
| `FaRTLSPage` | Missing >24h | ✅ `missing_24h` in RTLS summary = positions with `last_seen_at` older than 24h |
| `FaMaintenancePage` | Fleet MTBF | ✅ wired to maintenance summary `mtbf_days` (org-wide `open_wo` also replaces the page-local count) |
| `FaReportsPage` | Scheduled monthly | still open — needs report scheduler concept |
| `FaReportsPage` | Compliance status | still open — needs definition |
| `FaTransferPage` | Cross-site | still open — needs site-pair derivation |

Also fixed in the same pass (katalyst-core):
- **Removed fake seed-on-read blocks**: billing invoices (3× Rp25M "paid"), report history
  records, RFID readers (fake IPs), CCTV cameras (fake RTSP URLs). Empty list now returns
  empty — hardware/invoices must be created by real flows.
- `ConnectIntegration` now persists `{connected:true}` into `fa_settings.integrations`
  (key-mapped: erp / active_directory / email_provider) instead of returning success
  without writing anything.
- `GetUserAuditLog` resolves real user names via AOR lookup (was `"User"` placeholder).
- Kept intentionally: default role catalog seed and default billing plan seed (editable
  config, not fake stats).

Still stubs (need product/infra decisions, documented openly):
- `InviteUser` returns `invited` but creates nothing (needs real account-creation + email flow)
- `GenerateReport` returns `generating` but renders nothing (needs a report pipeline)
- `GetRtlsFloorPlan` rooms are demo data (needs a floor-plan table + management UI)

Transaction coverage note (Aug 2026): all ~50 FA write endpoints are now wired FE↔BE,
including the last two — `POST /fa/depreciation/run` (Run Depreciation button, confirm
dialog, invalidates schedule/journal/dashboard) and `POST /fa/journal-entries/:id/post`
(per-row Post button on pending entries in the Journal tab).

---

## 3. Frontend: wiring gaps (no backend work needed)

### 3a. Roles tab ignores the real API — ✅ FIXED

`FaUsersPage.tsx` Roles tab now renders from `useGetRolesQuery` (`GET /fa/roles`) —
name, description, `user_count`, and permission chips from the API's `permissions[]`.
The static `ROLE_CATALOG` is deleted. The tab meta count and the Users-tab role
filter chips now also come from real data (roles endpoint / distinct user roles).
Note: the backend seeds 6 default business roles on first `GET /fa/roles` call.

### 3b. CCTV feed never rendered

`FaSecurityPage.tsx` `handleOpenCCTV` (~72) only fires `toast.info("Opening CCTV…")`.
`GET /fa/security/cameras` is wired (camera list gates the alert buttons), but
`GET /fa/security/cameras/{cameraID}/feed` is never called. Camera list now returns
only real rows (fake camera seed removed) — a feed viewer still needs a product
decision on stream format.

### 3c. Pages that don't read the summary block they already get — ✅ FIXED

- `FaCheckOutPage` — KPI strip now reads `summary` (`active`, `overdue`, `on_time_rate`,
  `avg_duration_days`) instead of computing from the current page only; "Return rate"
  (page-local) replaced by org-wide "On-time rate"
- `FaRTLSPage` — "Zones" now reads `summary.zones_active`; "Tracked assets" keeps the
  per-site/floor filtered count (more accurate for the view than org-wide `tracked_assets`);
  "Missing >24h" still "—" (no backend field — see §2)
- `FaUsersPage` — KPI strip now reads users `summary` (`total_users`, `active_rate`,
  `pending_invites`); the dead "MFA enabled" card was replaced by "Active rate"

Once §1 lands real values, these pages should read `resp.data.summary.*`.

### 3d. Integrations panel is minimal

`FaSettingsPage` renders 3 integration cards (ERP, Active Directory, Email).
Backend `settings.integrations` is an open `map[string]interface{}` plus
`POST /fa/integrations/{type}/connect`, so more types (accounting, label printers,
messaging) can be surfaced without schema changes.

---

## Priority

1. ~~§1 hardcoded summary values~~ — ✅ done in katalyst-core
2. ~~§3a Roles tab wiring~~ — ✅ done
3. ~~§3c CheckOut/RTLS/Users pages read the summary block~~ — ✅ done
4. ~~§2 derivable keys~~ — ✅ `utilization_pct`, `total_nbv` tax impact, `missing_24h` done; invite modal now sends a role from the roles API
5. **Open (product/infra decisions)**: `failed_logins_24h`, reports scheduler/compliance, `cross_site`, CCTV feed viewer (§3b), integrations surface (§3d), and the invite/report-generation/floor-plan stubs listed in §2
