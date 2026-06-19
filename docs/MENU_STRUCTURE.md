# Menu Structure Reference

Complete list of all registered web menus, organized by parent-child hierarchy.
Hierarchy is determined by the backend API (`/accounts/me/menus`), but the suggested grouping below is based on menu naming conventions and domain.

---

## Parent Menus (Icon Only, No URL)

These menus act as collapsible group headers in the sidebar.

| Menu Name | Icon | Suggested Children |
|-----------|------|-------------------|
| `WEB_CATEGORY_MENU` | Book | Category & Attribute pages |
| `WEB_HARDWARE` | Radio | Gate & Device pages |
| `WEB_INVENTORY_MENU` | Warehouse | Inventory pages |
| `WEB_KBM_BATANG_MANUAL` | — | KBM dimension pages |
| `WEB_KBM_LAMINA_MASTER` | Package | KBM Lamina pages |
| `WEB_LAMINA` | Package | Lamina log pages |
| `WEB_LEDGER_V2` | Book | Ledger V2 pages |
| `WEB_MASTER_DATA` | BookOpen | Master data pages |
| `WEB_PENERIMAAN_LOG` | Package | Penerimaan Log pages |
| `WEB_ST_BASAH` | Package | ST Basah pages |
| `WEB_ST_KERING` | Package | ST Kering pages |
| `WEB_ST_PENERIMAAN_LOG` | Package | ST Penerimaan Log pages |

## Standalone Menus (Have Both Icon + URL)

These appear as top-level sidebar items with their own page.

| Menu Name | Icon | Route |
|-----------|------|-------|
| `WEB_LEDGER` | Book | `/dashboard/ledger` |
| `WEB_OVERVIEW` | Gauge | `/dashboard/overview` |
| `WEB_VALIDATION_PENERIMAAN_LOG` | ClipboardCheck | `/dashboard/validation-penerimaan-log` |
| `WEB_VERIFICATION` | ClipboardCheck | `/dashboard/verification` |
| `WEB_VERIFICATION_PENERIMAAN_LOG` | ClipboardCheck | `/dashboard/verification-penerimaan-log` |
| `WEB_VERIFICATION_ST_BASAH` | ClipboardCheck | `/dashboard/verification-st-basah` |
| `WEB_VERIFICATION_ST_KERING` | ClipboardCheck | `/dashboard/verification-st-kering` |

## Leaf Menus (URL Only, No Icon)

Grouped by suggested parent.

### WEB_OVERVIEW (root)

| Menu Name | Route |
|-----------|-------|

### WEB_INVENTORY_MENU

| Menu Name | Route |
|-----------|-------|
| `WEB_INVENTORY` | `/dashboard/inventory` |
| `WEB_INVENTORY_AREA` | `/dashboard/inventory-area` |
| `WEB_STOCK_ALERT_CONFIG` | `/dashboard/stock-alert-config` |
| `WEB_STOCK_AUDIT` | `/dashboard/stock-audit` |
| `WEB_STOCK_AUDIT_AREA` | `/dashboard/stock-audit-area` |
| `WEB_STOCK_AUDIT_TOTAL` | `/dashboard/stock-audit-total` |
| `WEB_KBM_STOCK_AUDIT` | `/dashboard/kbm-stock-audit` |
| `WEB_KBM_STOCK_AUDIT_AREA` | `/dashboard/kbm-stock-audit-area` |
| `WEB_STOCK_MOVEMENT_TYPES` | `/dashboard/stock-movement-types` |
| `WEB_STORE` | `/dashboard/store` |

### WEB_INBOUND / Inbound

| Menu Name | Route |
|-----------|-------|
| `WEB_INBOUND` | `/dashboard/inbound` |
| `WEB_INBOUND_LOG` | `/dashboard/inbound-log` |
| `WEB_INBOUND_PACKING` | `/dashboard/inbound-packing` |
| `WEB_INBOUND_PENERIMAAN_LOG` | `/dashboard/inbound-penerimaan-log` |
| `WEB_INBOUND_ST_BASAH` | `/dashboard/inbound-st-basah` |
| `WEB_PACKING` | `/dashboard/packing` |
| `WEB_INBOUND_PACKING` | `/dashboard/inbound-packing` |

### WEB_OUTBOUND / Outbound

| Menu Name | Route |
|-----------|-------|
| `WEB_OUTBOUND` | `/dashboard/outbound` |
| `WEB_OUTBOUND_LOG` | `/dashboard/outbound-log` |
| `WEB_OUTBOUND_PACKING` | `/dashboard/outbound-packing` |
| `WEB_OUTBOUND_PENERIMAAN_LOG` | `/dashboard/outbound-penerimaan-log` |
| `WEB_OUTBOUND_ST_BASAH` | `/dashboard/outbound-st-basah` |

### WEB_LEDGER / WEB_LEDGER_V2

| Menu Name | Route |
|-----------|-------|
| `WEB_LEDGER` | `/dashboard/ledger` |
| `WEB_LEDGER_PRODUCT` | `/dashboard/ledger-product` |

### WEB_PENERIMAAN_LOG

| Menu Name | Route |
|-----------|-------|
| `WEB_PENERIMAAN_LOG_MASTER` | `/dashboard/kbm-penerimaan-log-master` |
| `WEB_INBOUND_PENERIMAAN_LOG` | `/dashboard/inbound-penerimaan-log` |
| `WEB_OUTBOUND_PENERIMAAN_LOG` | `/dashboard/outbound-penerimaan-log` |

### WEB_ST_KERING

| Menu Name | Route |
|-----------|-------|
| `WEB_ST_KERING_LOG` | `/dashboard/st-kering-log` |
| `WEB_ST_KERING_MASTER` | `/dashboard/kbm-grade-st-susun` |
| `WEB_KBM_ST_KERING_GRADE` | `/dashboard/kbm-st-kering-grade` |
| `WEB_KBM_DEPARTMENT_ST_KERING` | `/dashboard/kbm-department-st-kering` |
| `WEB_KBM_MESIN_KELUAR_ST_KERING` | `/dashboard/kbm-mesin-keluar-st-kering` |
| `WEB_KBM_MESIN_MASUK_ST_KERING` | `/dashboard/kbm-mesin-masuk-st-kering` |
| `WEB_KBM_MITRA_BISNIS_ST_KERING` | `/dashboard/kbm-mitra-bisnis-st-kering` |
| `WEB_KBM_PROSES_KELUAR_ST_KERING` | `/dashboard/kbm-proses-keluar-st-kering` |
| `WEB_KBM_PROSES_MASUK_ST_KERING` | `/dashboard/kbm-proses-masuk-st-kering` |

### WEB_ST_BASAH

| Menu Name | Route |
|-----------|-------|
| `WEB_ST_BASAH_LOG` | `/dashboard/st-basah-log` |
| `WEB_KBM_ST_BASAH_GRADE` | `/dashboard/kbm-st-basah-grade` |
| `WEB_KBM_DEPARTMENT_ST_BASAH` | `/dashboard/kbm-department-st-basah` |
| `WEB_KBM_MESIN_KELUAR_ST_BASAH` | `/dashboard/kbm-mesin-keluar-st-basah` |
| `WEB_KBM_MESIN_MASUK_ST_BASAH` | `/dashboard/kbm-mesin-masuk-st-basah` |
| `WEB_KBM_MITRA_BISNIS_ST_BASAH` | `/dashboard/kbm-mitra-bisnis-st-basah` |
| `WEB_KBM_PROSES_KELUAR_ST_BASAH` | `/dashboard/kbm-proses-keluar-st-basah` |
| `WEB_KBM_PROSES_MASUK_ST_BASAH` | `/dashboard/kbm-proses-masuk-st-basah` |

### WEB_ST_PENERIMAAN_LOG

| Menu Name | Route |
|-----------|-------|
| `WEB_ST_PENERIMAAN_LOG_LOG` | `/dashboard/st-penerimaan-log-log` |
| `WEB_KBM_PENERIMAAN_LOG_GRADE` | `/dashboard/kbm-penerimaan-log-grade` |
| `WEB_KBM_DEPARTMENT_PENERIMAAN_LOG` | `/dashboard/kbm-department-penerimaan-log` |
| `WEB_KBM_MESIN_KELUAR_PENERIMAAN_LOG` | `/dashboard/kbm-mesin-keluar-penerimaan-log` |
| `WEB_KBM_MESIN_MASUK_PENERIMAAN_LOG` | `/dashboard/kbm-mesin-masuk-penerimaan-log` |
| `WEB_KBM_MITRA_BISNIS_PENERIMAAN_LOG` | `/dashboard/kbm-mitra-bisnis-penerimaan-log` |
| `WEB_KBM_PROSES_KELUAR_PENERIMAAN_LOG` | `/dashboard/kbm-proses-keluar-penerimaan-log` |
| `WEB_KBM_PROSES_MASUK_PENERIMAAN_LOG` | `/dashboard/kbm-proses-masuk-penerimaan-log` |

### WEB_LAMINA

| Menu Name | Route |
|-----------|-------|
| `WEB_LAMINA_LOG` | `/dashboard/lamina-log` |
| `WEB_LAMINA_INBOUND_LOG` | `/dashboard/lamina-inbound-log` |
| `WEB_LAMINA_OUTBOUND_LOG` | `/dashboard/lamina-outbound-log` |

### WEB_KBM_LAMINA_MASTER

| Menu Name | Route |
|-----------|-------|
| `WEB_KBM_LAMINA_GRADE` | `/dashboard/kbm-lamina-grade` |
| `WEB_KBM_KAYU_LAMINA` | `/dashboard/kbm-kayu-lamina` |
| `WEB_KBM_LAMINA` | `/dashboard/kbm-lamina` |
| `WEB_KBM_MESIN_KELUAR_LAMINA` | `/dashboard/kbm-mesin-keluar-lamina` |
| `WEB_KBM_PROSES_KELUAR_LAMINA` | `/dashboard/kbm-proses-keluar-lamina` |
| `WEB_KBM_SHIFT_KELUAR_LAMINA` | `/dashboard/kbm-shift-keluar-lamina` |

### WEB_HARDWARE

| Menu Name | Route |
|-----------|-------|
| `WEB_GATE_MANAGEMENT` | `/dashboard/gate-management` |
| `WEB_GATE_MONITOR` | `/dashboard/gate-monitor` |
| `WEB_DEVICE_MANAGEMENT` | `/dashboard/device-management` |
| `WEB_DEVICE_MONITORING` | `/dashboard/device-monitoring` |
| `WEB_GATE_LOG` | `/dashboard/gate-log` |
| `WEB_GATE_ACTIVITY` | `/dashboard/gate-activity` |
| `WEB_EDGE_CONFIG` | `/dashboard/edge-config` |

### WEB_CATEGORY_MENU

| Menu Name | Route |
|-----------|-------|
| `WEB_CATEGORY` | `/dashboard/category` |
| `WEB_ATTRIBUTE_LIST` | `/dashboard/attribute` |
| `WEB_ATTRIBUTE_COLLECTION` | `/dashboard/attribute/collection` |

### WEB_MASTER_DATA

| Menu Name | Route |
|-----------|-------|
| `WEB_SKU` | `/dashboard/sku` |
| `WEB_PRODUCT` | `/dashboard/product` |
| `WEB_PACKING_COLLECTION` | `/dashboard/packing-collection` |
| `WEB_EPC` | `/dashboard/epc` |
| `WEB_USER_MANAGEMENT` | `/dashboard/employee` |
| `WEB_USER_MENU` | `/dashboard/user-menu` |
| `WEB_API_KEYS` | `/dashboard/api-key` |
| `WEB_ODOO_MODULE` | `/dashboard/odoo-module` |
| `WEB_REFERENCE` | `/dashboard/reference` |

### WEB_KBM_BATANG_MANUAL

| Menu Name | Route |
|-----------|-------|
| `WEB_KBM_PANJANG` | `/dashboard/kbm-panjang` |
| `WEB_KBM_LEBAR` | `/dashboard/kbm-lebar` |
| `WEB_KBM_TEBAL` | `/dashboard/kbm-tebal` |
| `WEB_KBM_NO_PALET` | `/dashboard/kbm-no-palet` |
| `WEB_KBM_PANJANG_LOG` | `/dashboard/kbm-panjang-log` |
| `WEB_KBM_TRIMMING_LOG` | `/dashboard/kbm-trimming-log` |

### KBM Shared (Master Data)

| Menu Name | Route |
|-----------|-------|
| `WEB_KBM_GRADE_ST_SUSUN` | `/dashboard/kbm-grade-st-susun` |
| `WEB_KBM_GRADE_ST_BATANG` | `/dashboard/kbm-grade-st-batang` |
| `WEB_KBM_BARANG` | `/dashboard/kbm-barang` |
| `WEB_KBM_CATEGORY` | `/dashboard/kbm-category` |
| `WEB_KBM_DEPARTMENT` | `/dashboard/kbm-department` |
| `WEB_KBM_DEPARTMENT_V2` | `/dashboard/kbm-department-v2` |
| `WEB_KBM_GUDANG` | `/dashboard/kbm-gudang` |
| `WEB_KBM_KAYU_BULAT` | `/dashboard/kbm-kayu-bulat` |
| `WEB_KBM_KAYU_BULAT_GRADE` | `/dashboard/kbm-kayu-bulat-grade` |
| `WEB_KBM_MESIN` | `/dashboard/kbm-mesin` |
| `WEB_KBM_MESIN_V2` | `/dashboard/kbm-mesin-v2` |
| `WEB_KBM_MITRA_BISNIS` | `/dashboard/kbm-mitra-bisnis` |
| `WEB_KBM_MITRA_BISNIS_V2` | `/dashboard/kbm-mitra-bisnis-v2` |
| `WEB_KBM_SUPPLIER_V2` | `/dashboard/kbm-supplier-v2` |
| `WEB_KBM_PROSES_V2` | `/dashboard/kbm-proses-v2` |
| `WEB_KBM_SHIFT_V2` | `/dashboard/kbm-shift-v2` |

### RFID

| Menu Name | Route |
|-----------|-------|
| `WEB_PRINT_RFID` | `/dashboard/print-rfid` |
| `WEB_ASSIGN_RFID` | `/dashboard/assign-rfid` |
| `WEB_ADD_REMOVE_RFID` | `/dashboard/add-remove-rfid` |
| `WEB_DISPOSABLE_EPC` | `/dashboard/disposable-epc` |
| `WEB_REUSABLE_EPC` | `/dashboard/reusable-epc` |

### WEB_REPORTS

| Menu Name | Route |
|-----------|-------|
| `WEB_REPORTS` | `/dashboard/report` |

---

## Unassigned / Root-Level

These menus have no obvious parent group — they sit at the sidebar root level.

| Menu Name | Route |
|-----------|-------|
| `WEB_KBM_MASTER` | `/dashboard/kbm-grade-st-susun` |

---

## Total Count

| Type | Count |
|------|-------|
| Parent menus (icon, no url) | 12 |
| Standalone (icon + url) | 6 |
| Leaf menus (url only) | ~100 |
| **Total registered** | **~118** |
