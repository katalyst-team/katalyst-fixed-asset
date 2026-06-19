# Pages With Special Logic / Hardcode Notes

Dokumentasi ini fokus ke halaman yang punya:
- logic khusus (conditional flow, provider dependency, route param, URL sync), atau
- hardcode tertentu (limit default, pagination size, polling interval, default filter, noindex).

## 1) Auth Flow Pages

### `/sign-up/[email]`
- Page: `src/pages/sign-up/[email].tsx`
- Logic khusus:
  - pakai `getServerSideProps` (SSR) agar route parameter email selalu fresh per request.
  - halaman verifikasi email dipisah dari form sign-up utama.
- Hardcode:
  - `SEO noindex` aktif.
  - namespace i18n fixed: `["common", "auth"]`.

### `/reset-password` dan `/reset-password-confirmation/[email]`
- Page: `src/pages/reset-password.tsx`, `src/pages/reset-password-confirmation/[email].tsx`
- Logic khusus:
  - split 2 langkah: request reset + OTP confirmation.
  - halaman OTP pakai SSR.
- Hardcode:
  - kedua halaman pakai `noindex`.
  - namespace i18n fixed `["common", "auth"]`.

### `/verification-access`
- Page: `src/pages/verification-access.tsx`
- Logic khusus:
  - jalur verifikasi akses terpisah dari login/sign-up.
- Hardcode:
  - `noindex` aktif.
  - namespace i18n fixed `["common", "auth"]`.

## 2) Overview Dashboard

### `/dashboard/overview`
- Page: `src/pages/dashboard/overview/index.tsx`
- Core logic: `src/modules/dashboard/overview/useOverview.tsx`
- Logic khusus:
  - filter default diinisialisasi `{ interval: "1M" }`.
  - `store_ids` di-set sekali dari `selectedTeam` via `initializedRef` (menghindari overwrite setelah user ubah filter).
  - `inventoryAccuracy` dihitung lokal dari `total_items`, `total_inbound`, `total_outbound`.
  - query gabungan beberapa endpoint (overview, trend, metric config) lalu `isLoading` di-aggregate manual.
- Hardcode:
  - interval default `"1M"`.
  - fallback kalkulasi: jika `expectedItems === 0` maka `100`, dan hasil di-clamp `0..100`.
  - ada disable eslint dependency pada efek inisialisasi store.

## 3) Inbound / Outbound List Pages

### `/dashboard/inbound`
- Page: `src/pages/dashboard/inbound/index.tsx`
- Core logic: `src/modules/dashboard/inbound/useInbound.tsx`
- Logic khusus:
  - `stock_movement_type_ids` otomatis diisi dari endpoint type dengan filter `direction === "INBOUND"` saat user belum pilih tipe.
  - prioritas store query:
    1. `filters.selected_store_for_section`
    2. `selectedTeam` jika bukan `"0"`
    3. fallback `selectedTeam` apa adanya.
- Hardcode:
  - `limit` request selalu mengikuti `itemLimit` dari zustand.
  - sentinel multi-store `"0"` dipakai sebagai representasi all store.

### `/dashboard/outbound`
- Page: `src/pages/dashboard/outbound/index.tsx`
- Core logic: `src/modules/dashboard/outbound/useOutbound.tsx`
- Logic khusus:
  - identik inbound, tapi type filter diarahkan ke `direction === "OUTBOUND"`.
  - prioritas store query sama dengan inbound.
- Hardcode:
  - sentinel `"0"` untuk all store.
  - pagination limit mengikuti state store.

## 4) Inbound/Outbound Detail Pages

### `/dashboard/inbound/[ledger_id]` dan `/dashboard/outbound/[ledger_id]`
- Page:
  - `src/pages/dashboard/inbound/[ledger_id].tsx`
  - `src/pages/dashboard/outbound/[ledger_id].tsx`
- Core logic: `src/modules/dashboard/detail-inbound-outbound/useDetailInboundOutbound.tsx`
- Logic khusus:
  - butuh kombinasi `organizationId + storeId + stockMovementId` sebelum fetch detail (`enabled` guard).
  - data detail diproses client-side:
    - grouping `new_item_status_histories` per SKU,
    - pagination produk dan EPC per SKU,
    - hitung `packageQuantity` dari unique EPC kategori `PACKAGE`.
- Hardcode:
  - default pagination: `productItemsPerPage = 10`, `epcItemsPerPage = 10`.
  - fallback text `"Unknown"` untuk data kosong.
  - format timestamp EPC pakai `toLocaleString()` browser.
  - `noindex` aktif untuk kedua halaman detail.

## 5) Stock Audit Pages

### `/dashboard/stock-audit`
- Page: `src/pages/dashboard/stock-audit/index.tsx`
- Core logic: `src/modules/dashboard/stock-audit/StockAudit.tsx`
- Logic khusus:
  - sinkronisasi dua arah filter <-> URL query (`router.replace` shallow).
  - inisialisasi store/filter dari URL hanya sekali (`hasInitializedRef`).
  - path tabel detail berubah dinamis:
    - default: `/dashboard/stock-audit`
    - mode tertentu: `/dashboard/kbm-stock-audit` (`requireStockMovementType`).
- Hardcode:
  - default `order_direction = "DESC"`.
  - fetch store list pakai `limit: 20`.
  - opsi all store manual: `{ label: "All Store", value: "0" }`.
  - key query URL fixed: `store_id`, `type`, `status`, `aor_id`, `result`, `checking_object_id`, `order_direction`, `stock_movement_type_name`.

### `/dashboard/stock-audit/[storeId]/[audit-id]`
- Page: `src/pages/dashboard/stock-audit/[storeId]/[audit-id].tsx`
- Core logic: `src/modules/dashboard/stock-audit/detail-stock-audit/DetailStockAudit.tsx`
- Logic khusus:
  - render blok laporan kondisional via `getReportConfig`:
    - section report hanya untuk tipe tertentu,
    - SKU report hanya untuk tipe tertentu,
    - Odoo scan section hanya untuk `ODOO_STOCK_OPNAME`.
  - gambar preview dibatasi, selebihnya via modal gallery.
- Hardcode:
  - preview image maksimum `12`.
  - judul menampilkan `id.slice(0, 8)`.
  - `noindex` aktif.

## 6) API Key Management

### `/dashboard/api-key`
- Page: `src/pages/dashboard/api-key.tsx`
- Core logic:
  - provider: `src/modules/dashboard/api-key/useApiKey.tsx`
  - create dialog: `src/modules/dashboard/api-key/ApiKeyCreateDialog.tsx`
- Logic khusus:
  - pagination dilakukan client-side (`slice`) dari full list API key.
  - sesudah create/update/delete, query di-invalidate manual.
  - generated API key ditampilkan sekali via toast.
- Hardcode:
  - `itemsPerPage` default provider: `5`.
  - durasi toast generated key: `10000ms`.
  - filter state disiapkan (`filters`) namun belum dipakai ke query backend (masih lokal).

## 7) Cross-Page Hardcode Patterns (Related)

### Alert polling intervals
- File: `src/hooks/api/alert/useAlertsQuery.ts`
- Hardcode:
  - Critical stock: `120000ms` (stale + refetch)
  - Aging stock: `300000ms`
  - EPC mismatches: `180000ms`
  - Pending audits: `300000ms`
- Dampak:
  - beban polling fixed; belum adaptive per visibilitas tab/user activity.

### High-limit fetch examples
- File: `src/modules/dashboard/stock-audit-total/StockAuditTotal.tsx`
- Hardcode:
  - store fetch limit `10000`.
  - pilihan status/source masih static options.
- Dampak:
  - aman untuk data kecil-menengah, tapi bisa berat jika organisasi punya store sangat banyak.

## Catatan Refactor Prioritas

1. Pindahkan angka hardcode (limit, interval, default sort) ke constants config per domain.
2. Standarkan sentinel all-store (`"0"` vs `"all"`) agar tidak campur antar modul.
3. Tambahkan dokumentasi kontrak URL query untuk semua halaman yang sinkronisasi filter.
4. Pertimbangkan server-side pagination untuk API key agar tidak slice penuh di client.
