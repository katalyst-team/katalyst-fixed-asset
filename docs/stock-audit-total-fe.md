# Stock Audit Total FE

Dokumen ini menjelaskan rancangan halaman FE untuk fitur **Stock Audit Total** (sumber data Odoo stock opname).

## Scope
- Halaman list session stock audit total.
- Halaman detail session stock audit total.
- Export data detail ke Excel dari response API.

## Route FE
- List: `/dashboard/stock-audit-total`
- Detail: `/dashboard/stock-audit-total/[sessionId]`

## Endpoint API
- `GET /v1/organizations/{organizationID}/stock-audit-total`
- `GET /v1/organizations/{organizationID}/stock-audit-total/{sessionID}`
- `POST /v1/organizations/{organizationID}/stock-audit-total/sync` (opsional trigger manual)

## Kontrak Data Utama

### List Session
Field minimum yang dipakai FE:
- `id`
- `store_id`
- `source` (contoh: `ODOO_STOCK_OPNAME`)
- `external_ref`
- `status`
- `started_at`, `completed_at`
- `total_expected`, `total_actual`, `total_missing`, `total_extra`, `total_matched`
- `accuracy_percent`

### Detail Session
Field minimum yang dipakai FE:
- `summary`
- `breakdown_by_sku[]`
- `discrepancy_items[]`
- `meta`

## Mapping Label FE
- `source: ODOO_STOCK_OPNAME` -> tampilkan: `ODOO Stock Opname`

Contoh util:
```ts
const SOURCE_LABEL: Record<string, string> = {
  ODOO_STOCK_OPNAME: "ODOO Stock Opname",
};

export const formatStockAuditTotalSource = (source: string) => {
  if (!source) return "-";
  return (
    SOURCE_LABEL[source] ||
    source
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};
```

## Struktur FE (Rekomendasi)

### Service
- `src/services/stock-audit-total/getStockAuditTotalListService.ts`
- `src/services/stock-audit-total/getStockAuditTotalDetailService.ts`
- `src/services/stock-audit-total/syncStockAuditTotalService.ts`

### Query Hook
- `src/hooks/api/stock-audit-total/useGetStockAuditTotalListQuery.ts`
- `src/hooks/api/stock-audit-total/useGetStockAuditTotalDetailQuery.ts`
- `src/hooks/api/stock-audit-total/useSyncStockAuditTotalMutation.ts`

### Module UI
- `src/modules/dashboard/stock-audit-total/StockAuditTotal.tsx`
- `src/modules/dashboard/stock-audit-total/components/StockAuditTotalHeader.tsx`
- `src/modules/dashboard/stock-audit-total/components/StockAuditTotalTable.tsx`
- `src/modules/dashboard/stock-audit-total/detail/DetailStockAuditTotal.tsx`

## UI Behavior

### List Page
- Filter minimal:
  - Store
  - Status
  - Source
  - Date range (started_at)
- Tabel minimal kolom:
  - Session ID (short)
  - Store
  - Source
  - Status
  - Expected
  - Actual
  - Missing
  - Extra
  - Matched
  - Accuracy %
  - Started At
  - Completed At
  - Action (Detail)

### Detail Page
Tampilkan section:
1. **Summary Cards**
2. **Breakdown by SKU** (table)
3. **Discrepancy Items** (table)
4. Tombol **Export Excel**

## Export Excel (Client-side)
Sumber export hanya dari response detail:
- Sheet `Summary`
- Sheet `Breakdown by SKU`
- Sheet `Discrepancies`

Kolom rekomendasi:

### Summary
- Session ID
- Store ID
- Source
- External Ref
- Started At
- Completed At
- Total Expected
- Total Actual
- Total Missing
- Total Extra
- Total Matched
- Accuracy %

### Breakdown by SKU
- SKU ID
- SKU Code
- SKU Name
- Expected Qty
- Actual Qty
- Missing Qty
- Extra Qty
- Matched Qty

### Discrepancies
- Type
- RFID
- EPC
- SKU ID
- SKU Code
- SKU Name
- Section ID
- Section Name
- Expected Qty
- Actual Qty
- Delta Qty
- Updated At

## Handling Empty/Error State
- Jika list kosong: tampilkan empty state + deskripsi filter.
- Jika detail tidak ditemukan: tampilkan not found state.
- Jika API error: gunakan pattern toast + retry action.

## Catatan Implementasi
- Gunakan format tanggal konsisten (`yyyy-MM-dd HH:mm:ss` atau locale internal aplikasi).
- Gunakan `queryKey` stabil berbasis `organizationId + filters`.
- `accuracy_percent` ditampilkan maksimal 2 desimal di UI.
- Pastikan enum/label source terpusat di util agar konsisten di list, detail, dan export.
