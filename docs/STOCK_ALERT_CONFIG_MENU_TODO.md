# Admin TODO: Menu Setup — Halaman Baru Frontend

Halaman-halaman berikut sudah diimplementasi di frontend.
Agar muncul di sidebar, admin perlu menambahkan menu di backend untuk masing-masing.

---

## 1. Stock Alert Config — `/dashboard/stock-alert-config`

| Field | Value |
|---|---|
| **Menu Name** | `WEB_STOCK_ALERT_CONFIG` |
| **Route** | `/dashboard/stock-alert-config` |
| **Label (en)** | Stock Alert Config |
| **Label (id)** | Konfigurasi Alert Stok |
| **Icon** | `Bell` (lucide) — opsional |
| **Parent** | Disarankan di bawah `WEB_INVENTORY_MENU` atau `WEB_OVERVIEW` |
| **Platform** | `WEB` |
| **Status** | Active |

**API yang digunakan** (sudah ada):
- `GET /v1/organizations/{id}/alerts/critical-stock`
- `GET /v1/organizations/{id}/alerts/aging-stock`
- `GET /v1/organizations/{id}/alerts/epc-mismatches`
- `GET /v1/organizations/{id}/alerts/pending-audits`
- `GET /v1/organizations/{id}/alerts/low-stock`
- `GET /v1/organizations/{id}/analytics/stock-health`

- [ ] Tambahkan menu `WEB_STOCK_ALERT_CONFIG`
- [ ] Set parent & sort order
- [ ] Aktifkan untuk organization yang relevan
- [ ] Verifikasi sidebar & halaman `/dashboard/stock-alert-config`

---

## 2. Gate Management (CRUD) — `/dashboard/gate-management`

| Field | Value |
|---|---|
| **Menu Name** | `WEB_GATE_MANAGEMENT` |
| **Route** | `/dashboard/gate-management` |
| **Label (en)** | Gate Management |
| **Label (id)** | Manajemen Gate |
| **Icon** | `Radio` (lucide) — opsional |
| **Parent** | Disarankan di bawah `WEB_HARDWARE` atau parent baru "Gate & Devices" |
| **Platform** | `WEB` |
| **Status** | Active |

**API yang digunakan** (sudah ada):
- `POST /v1/organizations/{id}/gates` — Create gate
- `GET /v1/organizations/{id}/gates` — List gates
- `PATCH /v1/organizations/{id}/gates/{gateID}` — Update gate
- `DELETE /v1/organizations/{id}/gates/{gateID}` — Delete gate

- [ ] Tambahkan menu `WEB_GATE_MANAGEMENT`
- [ ] Set parent & sort order
- [ ] Aktifkan untuk organization yang relevan
- [ ] Verifikasi sidebar & halaman `/dashboard/gate-management`

---

## 3. Gate Monitor — `/dashboard/gate-monitor`

| Field | Value |
|---|---|
| **Menu Name** | `WEB_GATE_MONITOR` |
| **Route** | `/dashboard/gate-monitor` |
| **Label (en)** | Gate Monitor |
| **Label (id)** | Monitor Gate |
| **Icon** | `Activity` (lucide) — opsional |
| **Parent** | Sama dengan Gate Management |
| **Platform** | `WEB` |
| **Status** | Active |

**API yang digunakan** (sudah ada):
- `GET /v1/organizations/{id}/gates` — List gates
- `GET /v1/organizations/{id}/gate-logs` — List gate logs

- [ ] Tambahkan menu `WEB_GATE_MONITOR`
- [ ] Set parent & sort order
- [ ] Aktifkan untuk organization yang relevan
- [ ] Verifikasi sidebar & halaman `/dashboard/gate-monitor`

---

## 4. Device Management — `/dashboard/device-management`

| Field | Value |
|---|---|
| **Menu Name** | `WEB_DEVICE_MANAGEMENT` |
| **Route** | `/dashboard/device-management` |
| **Label (en)** | Device Management |
| **Label (id)** | Manajemen Perangkat |
| **Icon** | `Cpu` (lucide) — opsional |
| **Parent** | Disarankan di bawah `WEB_HARDWARE` |
| **Platform** | `WEB` |
| **Status** | Active |

**API yang digunakan** (sudah ada):
- `GET /v1/organizations/{id}/gate-logs` — Data device di-agregasi dari gate logs (device_id, antenna, store)

- [ ] Tambahkan menu `WEB_DEVICE_MANAGEMENT`
- [ ] Set parent & sort order
- [ ] Aktifkan untuk organization yang relevan
- [ ] Verifikasi sidebar & halaman `/dashboard/device-management`

---

## 5. Gate Activity Report — `/dashboard/gate-activity`

| Field | Value |
|---|---|
| **Menu Name** | `WEB_GATE_ACTIVITY` |
| **Route** | `/dashboard/gate-activity` |
| **Label (en)** | Gate Activity |
| **Label (id)** | Aktivitas Gate |
| **Icon** | `BarChart3` (lucide) — opsional |
| **Parent** | Disarankan di bawah `WEB_REPORTS` atau parent "Gate & Devices" |
| **Platform** | `WEB` |
| **Status** | Active |

**API yang digunakan** (sudah ada):
- `GET /v1/organizations/{id}/gates` — List gates
- `GET /v1/organizations/{id}/gate-logs` — List gate logs (data aktivitas di-agregasi di frontend)

- [ ] Tambahkan menu `WEB_GATE_ACTIVITY`
- [ ] Set parent & sort order
- [ ] Aktifkan untuk organization yang relevan
- [ ] Verifikasi sidebar & halaman `/dashboard/gate-activity`

---

## Ringkasan Frontend Registration (semua sudah selesai)

Setiap menu sudah terdaftar di:
- `src/types/menu.ts` — Enum `MenuName` + `MENU_ROUTE_MAP`
- `src/lib/menu-utils.ts` — `MENU_CONFIG`
- `next-i18next.config.js` — i18n namespace
- `public/locales/{en,id}/common.json` — Sidebar label
