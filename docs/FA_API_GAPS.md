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

## 2. Backend: summary keys not provided at all

Frontend renders these `FaStat` cards as `"—"` because no endpoint returns the field.

| Page | FaStat label | Suggested key / home |
|---|---|---|
| `FaUsersPage` | ~~MFA enabled~~ | Card replaced with "Active rate" (real data); re-add only when `mfa_enabled` exists |
| `FaUsersPage` | Failed logins (24h) | `failed_logins_24h` in users summary |
| `FaDashboardPage` | Utilization | `utilization_pct` in dashboard response (`utilization_pct` exists only on asset detail, `response.go:40`) |
| `FaScanOutPage` | Tax impact (fiscal drag) | `tax_impact` in scan-out/disposal summary |
| `FaMaintenancePage` | Fleet MTBF | ✅ provided as `mtbf_days` (fleet AVG of `fa_asset_healths.mtbf_days`) in maintenance summary |
| `FaReportsPage` | Scheduled monthly | `scheduled_monthly` in reports/templates summary |
| `FaReportsPage` | Compliance status | `compliance_status` in reports/templates summary |
| `FaTransferPage` | Cross-site | `cross_site` in transfer summary |
| `FaRTLSPage` | Zones | ✅ provided as `zones_active` (COUNT DISTINCT zone) — see §3c |

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
`GET /fa/security/cameras/{cameraID}/feed` is never called. Needs a feed viewer
(stream URL / embed) — coordinate on what the feed endpoint actually returns.

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
4. **§2 remaining summary keys** (`failed_logins_24h`, `utilization_pct`, `tax_impact`, `scheduled_monthly`, `compliance_status`, `cross_site`, RTLS `missing_24h`) — no data source exists yet; needs product decisions
5. **§3b CCTV feed viewer** — needs product decision on feed format
6. **§3d integrations surface area** — optional
