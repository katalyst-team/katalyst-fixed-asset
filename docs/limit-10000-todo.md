# TODO: Replace `limit: 10000` with Paginated / Server-Side Search

These files still fetch with a large hardcoded limit. Each should be replaced with
`limit: 10` + debounced server-side search (using `Combobox` with `onSearchChange`),
or paginated lazy-loading, depending on the context.

**Reference implementation**: `CreateStockAuditModal.tsx` — uses `limit: 10` +
`useDebouncedValue` + `Combobox onSearchChange` for both SKU and section dropdowns.

---

## Dropdowns / Selectors (highest priority — UX impact)

| File | Field fetched | Limit |
|------|--------------|-------|
| `src/components/ui/bypass-rfid-dialog.tsx:64` | SKU | 10 000 |
| `src/modules/dashboard/packing-collection/components/PackingItemsSelector.tsx:42` | SKU | 10 000 |
| `src/modules/dashboard/ledger/LedgerModalAddLedgerV2.tsx:81` | store sections | 100 000 |
| `src/modules/dashboard/ledger/LedgerModalAddLedgerV2.tsx:91` | SKU | 10 000 |
| `src/modules/dashboard/ledger/LedgerModalAddReusableEpcV2.tsx:98` | store sections | 100 000 |
| `src/modules/dashboard/ledger/LedgerModalAddReusableEpcV2.tsx:108` | SKU | 10 000 |
| `src/modules/dashboard/ledger/LedgerModalAddReusableEpcV2.tsx:203` | SKU | 10 000 |
| `src/modules/dashboard/attribute/collection/AttributeCollectionModalAdd.tsx:81` | attributes | 10 000 |
| `src/modules/dashboard/attribute/collection/AttributeCollectionModalAdd.tsx:89` | SKU | 10 000 |
| `src/modules/dashboard/category/CategoryAttributeSelector.tsx:62` | attributes | 10 000 |
| `src/modules/dashboard/category/SubCategoryAttributeDefaults.tsx:152` | attributes | 10 000 |
| `src/modules/dashboard/product/components/AttributeSelector.tsx:60` | attributes | 10 000 |
| `src/modules/dashboard/sku/components/AttributeSelector.tsx:60` | attributes | 10 000 |
| `src/modules/dashboard/employee/components/EmployeeModallAddEmployee.tsx:52` | stores | 10 000 |
| `src/modules/dashboard/employee/components/EmployeeModalEditEmployee.tsx:89` | stores | 10 000 |
| `src/modules/dashboard/stock-audit/components/CreateStockAuditModal.tsx:78` | stores (store selector only) | 10 000 |
| `src/modules/dashboard/stock-audit-area/components/CreateStockAuditAreaModal.tsx:56` | SKU | 10 000 |
| `src/modules/dashboard/stock-audit-area/components/CreateStockAuditAreaModal.tsx:61` | store sections | 10 000 |
| `src/modules/dashboard/stock-audit/components/StockAuditFilter.tsx:59` | stores | 10 000 |
| `src/modules/dashboard/stock-audit/components/StockAuditFilter.tsx:67` | store sections | 10 000 |
| `src/modules/dashboard/inbound/create/CreateInboundPage.tsx:109` | SKU | 10 000 |
| `src/modules/dashboard/outbound/create/CreateOutboundPage.tsx:103` | SKU | 10 000 |
| `src/modules/dashboard/edge-config/components/EdgeConfigCategoryFilter.tsx:25` | categories | 10 000 |

## Page-Level Store Selectors (medium priority)

| File | Field fetched | Limit |
|------|--------------|-------|
| `src/modules/dashboard/stock-audit/StockAudit.tsx:146` | stores (store selector) | ~~10 000~~ → 20 |
| `src/modules/dashboard/stock-audit-total/StockAuditTotal.tsx:26` | stores | 10 000 |
| `src/modules/dashboard/stock-audit-area/StockAuditArea.tsx:156` | stores | 10 000 |
| `src/modules/dashboard/inventory-area/InventoryArea.tsx:78` | stores | 10 000 |

## Scan / Assign RFID flows (review separately)

These are high-throughput flows; replacing limit requires careful UX design (barcode scan + search).

| File | Field fetched | Limit |
|------|--------------|-------|
| `src/modules/dashboard/ledger-product/LedgerProductScanAction.tsx:73` | SKU | 10 000 |
| `src/modules/dashboard/ledger-product/LedgerProductScanAction.tsx:113` | store sections | 10 000 |
| `src/modules/dashboard/ledger-product/LedgerProductScanAction.tsx:137` | store sections | 10 000 |
| `src/modules/dashboard/ledger-product/LedgerProductScanAction.tsx:210` | store sections | 10 000 |
| `src/modules/dashboard/assign-rfid/useAssignRfid.tsx:62` | EPC | 100 000 |
| `src/modules/dashboard/assign-rfid/useAssignRfid.tsx:72` | SKU | 10 000 |
| `src/modules/dashboard/assign-rfid/useAssignRfid.tsx:95` | sections | 10 000 |
| `src/modules/dashboard/assign-rfid/useAssignRfid.tsx:108` | sections | 10 000 |
| `src/modules/dashboard/assign-rfid/useAssignRfid.tsx:123` | sections | 10 000 |
| `src/modules/dashboard/assign-rfid/useAssignRfid.tsx:138` | sections | 10 000 |

## Export hooks (skip — intentional full-fetch)

`src/hooks/useExport.tsx` uses `limit: 1000000` / `10000` intentionally to export all data.
Do **not** change these.

## Old / unused files (skip)

- `src/modules/dashboard/assign-rfid/AssignRfid.old.tsx` — suffixed `.old`, likely unused.

---

## Fix Pattern

```tsx
// Before
const { data } = useGetSkuDataQuery({
  filters: { limit: 10000 },
  organizationId,
});
<Select>...</Select>

// After
const [search, setSearch] = useState("");
const debouncedSearch = useDebouncedValue(search, 400);
const { data } = useGetSkuDataQuery({
  filters: { limit: 10, query: debouncedSearch || undefined },
  organizationId,
});
<Combobox
  options={skuOptions}
  placeholder="Select SKU..."
  value={selectedId}
  onSearchChange={setSearch}
  onSelect={(v) => setSelectedId(v || undefined)}
/>
```
