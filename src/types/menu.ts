/**
 * Menu item as returned by GET /accounts/me/menus.
 * Only effectively ACTIVE menus are included — no user_status/organization_status fields.
 */
export interface MeMenuItem {
  children?: MeMenuItem[];
  id: string;
  name: string;
  parent_id?: string;
  sort_order: number;
}

export interface GetMeMenusResponse {
  data: {
    menus: MeMenuItem[];
  };
  metadata: {
    code: string;
    correlation_id: string;
    message: string;
    server_time: number;
    success: boolean;
  };
}

export interface AccountOrganization {
  email: string;
  first_name: string;
  id: string;
  last_name: string;
}

export interface MenuItem {
  children?: MenuItem[];
  id: string;
  is_overridden: boolean;
  name: string;
  organization_status: string;
  parent_id?: string;
  sort_order: number;
  user_status: string;
}

export interface GetOrganizationMenusResponse {
  data: {
    account_organization: AccountOrganization;
    menus: MenuItem[];
  };
  metadata: {
    success: boolean;
    code: string;
    message: string;
    server_time: number;
    correlation_id: string;
  };
  page_pagination?: {
    count: number;
    has_next: boolean;
    has_prev: boolean;
    limit: number;
    next_page: number;
    page: number;
    prev_page: number;
    total_pages: number;
    total_records: number;
  };
  pagination?: {
    count: number;
    next_cursor: string;
    prev_cursor: string;
    total_count: number;
  };
}

/**
 * Menu name constants that map to sidebar routes.
 * If a menu name appears in the organization's hidden menus list,
 * the corresponding route will be hidden from the sidebar.
 */
export enum MenuName {
  WEB_OVERVIEW = "WEB_OVERVIEW",
  WEB_LEDGER = "WEB_LEDGER",
  WEB_LEDGER_V2 = "WEB_LEDGER_V2",
  WEB_PRINT_RFID = "WEB_PRINT_RFID",
  WEB_ASSIGN_RFID = "WEB_ASSIGN_RFID",
  WEB_DISPOSABLE_EPC = "WEB_DISPOSABLE_EPC",
  WEB_REUSABLE_EPC = "WEB_REUSABLE_EPC",
  WEB_LEDGER_PRODUCT = "WEB_LEDGER_PRODUCT",
  WEB_INVENTORY = "WEB_INVENTORY",
  WEB_INBOUND = "WEB_INBOUND",
  WEB_INBOUND_LOG = "WEB_INBOUND_LOG",
  WEB_INVENTORY_MENU = "WEB_INVENTORY_MENU",
  WEB_OUTBOUND = "WEB_OUTBOUND",
  WEB_OUTBOUND_LOG = "WEB_OUTBOUND_LOG",
  WEB_REPORTS = "WEB_REPORTS",
  WEB_STOCK_AUDIT = "WEB_STOCK_AUDIT",
  WEB_STOCK_AUDIT_AREA = "WEB_STOCK_AUDIT_AREA",
  WEB_STOCK_AUDIT_TOTAL = "WEB_STOCK_AUDIT_TOTAL",

  WEB_PACKING = "WEB_PACKING",
  WEB_INBOUND_PACKING = "WEB_INBOUND_PACKING",
  WEB_OUTBOUND_PACKING = "WEB_OUTBOUND_PACKING",
  WEB_ODOO_MODULE = "WEB_ODOO_MODULE",
  WEB_CATEGORY = "WEB_CATEGORY",
  WEB_CATEGORY_MENU = "WEB_CATEGORY_MENU",
  WEB_ATTRIBUTE_LIST = "WEB_ATTRIBUTE_LIST",
  WEB_ATTRIBUTE_COLLECTION = "WEB_ATTRIBUTE_COLLECTION",
  WEB_SKU = "WEB_SKU",
  WEB_PRODUCT = "WEB_PRODUCT",
  WEB_PACKING_COLLECTION = "WEB_PACKING_COLLECTION",
  WEB_STORE = "WEB_STORE",
  WEB_EMPLOYEE = "WEB_EMPLOYEE",
  WEB_EPC = "WEB_EPC",
  WEB_API_KEYS = "WEB_API_KEYS",
  WEB_STOCK_MOVEMENT_TYPES = "WEB_STOCK_MOVEMENT_TYPES",
  WEB_GATE_LOG = "WEB_GATE_LOG",
  WEB_HARDWARE = "WEB_HARDWARE",
  WEB_MASTER_DATA = "WEB_MASTER_DATA",
  WEB_KBM_GRADE = "WEB_KBM_GRADE",
  WEB_KBM_GRADE_ST_BATANG = "WEB_KBM_GRADE_ST_BATANG",
  WEB_KBM_GRADE_ST_SUSUN = "WEB_KBM_GRADE_ST_SUSUN",
  WEB_KBM_NO_PALET = "WEB_KBM_NO_PALET",
  WEB_KBM_BATANG_MANUAL = "WEB_KBM_BATANG_MANUAL",
  WEB_KBM_PANJANG = "WEB_KBM_PANJANG",
  WEB_KBM_PANJANG_LOG = "WEB_KBM_PANJANG_LOG",
  WEB_KBM_TRIMMING_LOG = "WEB_KBM_TRIMMING_LOG",
  WEB_KBM_LEBAR = "WEB_KBM_LEBAR",
  WEB_KBM_TEBAL = "WEB_KBM_TEBAL",
  WEB_KBM_DEPARTMENT = "WEB_KBM_DEPARTMENT",

  WEB_KBM_BARANG = "WEB_KBM_BARANG",
  WEB_KBM_CATEGORY = "WEB_KBM_CATEGORY",
  WEB_KBM_GUDANG = "WEB_KBM_GUDANG",
  WEB_KBM_KAYU_BULAT = "WEB_KBM_KAYU_BULAT",
  WEB_KBM_KAYU_BULAT_GRADE = "WEB_KBM_KAYU_BULAT_GRADE",
  WEB_KBM_MESIN = "WEB_KBM_MESIN",
  WEB_KBM_MITRA_BISNIS = "WEB_KBM_MITRA_BISNIS",
  WEB_KBM_KAYU_LAMINA = "WEB_KBM_KAYU_LAMINA",
  WEB_KBM_LAMINA = "WEB_KBM_LAMINA",
  WEB_EDGE_CONFIG = "WEB_EDGE_CONFIG",
  WEB_ADD_REMOVE_RFID = "WEB_ADD_REMOVE_RFID",
  WEB_ST_KERING_LOG = "WEB_ST_KERING_LOG",
  WEB_ST_KERING = "WEB_ST_KERING",
  WEB_INVENTORY_AREA = "WEB_INVENTORY_AREA",
  WEB_USER_MANAGEMENT = "WEB_USER_MANAGEMENT",
  WEB_USER_MENU = "WEB_USER_MENU",
  WEB_VERIFICATION = "WEB_VERIFICATION",
  WEB_VERIFICATION_ST_KERING = "WEB_VERIFICATION_ST_KERING",
  WEB_LAMINA = "WEB_LAMINA",
  WEB_LAMINA_LOG = "WEB_LAMINA_LOG",
  WEB_LAMINA_INBOUND_LOG = "WEB_LAMINA_INBOUND_LOG",
  WEB_LAMINA_OUTBOUND_LOG = "WEB_LAMINA_OUTBOUND_LOG",
  WEB_ATTRIBUTE_V2 = "WEB_ATTRIBUTE_V2",
  WEB_CATEGORY_V2 = "WEB_CATEGORY_V2",
  WEB_KBM_DEPARTMENT_ST_KERING = "WEB_KBM_DEPARTMENT_ST_KERING",
  WEB_KBM_DEPARTMENT_V2 = "WEB_KBM_DEPARTMENT_V2",
  WEB_KBM_MESIN_KELUAR_LAMINA = "WEB_KBM_MESIN_KELUAR_LAMINA",
  WEB_KBM_MESIN_KELUAR_ST_KERING = "WEB_KBM_MESIN_KELUAR_ST_KERING",
  WEB_KBM_MESIN_MASUK_ST_KERING = "WEB_KBM_MESIN_MASUK_ST_KERING",
  WEB_KBM_MESIN_V2 = "WEB_KBM_MESIN_V2",
  WEB_KBM_MITRA_BISNIS_ST_KERING = "WEB_KBM_MITRA_BISNIS_ST_KERING",
  WEB_KBM_MITRA_BISNIS_V2 = "WEB_KBM_MITRA_BISNIS_V2",
  WEB_KBM_PROSES_V2 = "WEB_KBM_PROSES_V2",
  WEB_KBM_PROSES_KELUAR_LAMINA = "WEB_KBM_PROSES_KELUAR_LAMINA",
  WEB_KBM_PROSES_MASUK_ST_KERING = "WEB_KBM_PROSES_MASUK_ST_KERING",
  WEB_KBM_PROSES_KELUAR_ST_KERING = "WEB_KBM_PROSES_KELUAR_ST_KERING",
  WEB_KBM_SHIFT_V2 = "WEB_KBM_SHIFT_V2",
  WEB_KBM_SHIFT_KELUAR_LAMINA = "WEB_KBM_SHIFT_KELUAR_LAMINA",
  WEB_KBM_SUPPLIER_V2 = "WEB_KBM_SUPPLIER_V2",
  WEB_KBM_LAMINA_GRADE = "WEB_KBM_LAMINA_GRADE",
  WEB_KBM_LAMINA_MASTER = "WEB_KBM_LAMINA_MASTER",
  WEB_KBM_ST_KERING_GRADE = "WEB_KBM_ST_KERING_GRADE",
  WEB_ST_KERING_MASTER = "WEB_ST_KERING_MASTER",
  WEB_STOCK_ALERT_CONFIG = "WEB_STOCK_ALERT_CONFIG",
  WEB_GATE_MANAGEMENT = "WEB_GATE_MANAGEMENT",
  WEB_GATE_MONITOR = "WEB_GATE_MONITOR",
  WEB_DEVICE_MANAGEMENT = "WEB_DEVICE_MANAGEMENT",
  WEB_GATE_ACTIVITY = "WEB_GATE_ACTIVITY",
  WEB_ST_BASAH = "WEB_ST_BASAH",
  WEB_ST_BASAH_LOG = "WEB_ST_BASAH_LOG",
  WEB_KBM_ST_BASAH_GRADE = "WEB_KBM_ST_BASAH_GRADE",
  WEB_KBM_DEPARTMENT_ST_BASAH = "WEB_KBM_DEPARTMENT_ST_BASAH",
  WEB_KBM_DEPARTMENT_PENERIMAAN_LOG = "WEB_KBM_DEPARTMENT_PENERIMAAN_LOG",
  WEB_KBM_MESIN_KELUAR_PENERIMAAN_LOG = "WEB_KBM_MESIN_KELUAR_PENERIMAAN_LOG",
  WEB_KBM_MESIN_KELUAR_ST_BASAH = "WEB_KBM_MESIN_KELUAR_ST_BASAH",
  WEB_KBM_MESIN_MASUK_PENERIMAAN_LOG = "WEB_KBM_MESIN_MASUK_PENERIMAAN_LOG",
  WEB_KBM_MESIN_MASUK_ST_BASAH = "WEB_KBM_MESIN_MASUK_ST_BASAH",
  WEB_KBM_MITRA_BISNIS_PENERIMAAN_LOG = "WEB_KBM_MITRA_BISNIS_PENERIMAAN_LOG",
  WEB_KBM_MITRA_BISNIS_ST_BASAH = "WEB_KBM_MITRA_BISNIS_ST_BASAH",
  WEB_KBM_PENERIMAAN_LOG_GRADE = "WEB_KBM_PENERIMAAN_LOG_GRADE",
  WEB_KBM_PROSES_KELUAR_PENERIMAAN_LOG = "WEB_KBM_PROSES_KELUAR_PENERIMAAN_LOG",
  WEB_KBM_PROSES_KELUAR_ST_BASAH = "WEB_KBM_PROSES_KELUAR_ST_BASAH",
  WEB_KBM_PROSES_MASUK_PENERIMAAN_LOG = "WEB_KBM_PROSES_MASUK_PENERIMAAN_LOG",
  WEB_KBM_PROSES_MASUK_ST_BASAH = "WEB_KBM_PROSES_MASUK_ST_BASAH",
  WEB_PENERIMAAN_LOG = "WEB_PENERIMAAN_LOG",
  WEB_PENERIMAAN_LOG_LOG = "WEB_PENERIMAAN_LOG_LOG",
  WEB_ST_PENERIMAAN_LOG = "WEB_ST_PENERIMAAN_LOG",
  WEB_ST_PENERIMAAN_LOG_LOG = "WEB_ST_PENERIMAAN_LOG_LOG",
  WEB_VERIFICATION_PENERIMAAN_LOG = "WEB_VERIFICATION_PENERIMAAN_LOG",
  WEB_VERIFICATION_ST_BASAH = "WEB_VERIFICATION_ST_BASAH",
  WEB_VALIDATION_PENERIMAAN_LOG = "WEB_VALIDATION_PENERIMAAN_LOG",
  WEB_DEVICE_MONITORING = "WEB_DEVICE_MONITORING",

  WEB_FA_DASHBOARD = "WEB_FA_DASHBOARD",
  WEB_FA_REGISTER = "WEB_FA_REGISTER",
  WEB_FA_MASTER_DATA = "WEB_FA_MASTER_DATA",
  WEB_FA_RFID_TAGS = "WEB_FA_RFID_TAGS",
  WEB_FA_SCAN_IN = "WEB_FA_SCAN_IN",
  WEB_FA_SCAN_OUT = "WEB_FA_SCAN_OUT",
  WEB_FA_CHECK_OUT = "WEB_FA_CHECK_OUT",
  WEB_FA_TRANSFER = "WEB_FA_TRANSFER",
  WEB_FA_AUDIT = "WEB_FA_AUDIT",
  WEB_FA_MAINTENANCE = "WEB_FA_MAINTENANCE",
  WEB_FA_RTLS = "WEB_FA_RTLS",
  WEB_FA_SECURITY = "WEB_FA_SECURITY",
  WEB_FA_REPORTS = "WEB_FA_REPORTS",
  WEB_FA_USERS = "WEB_FA_USERS",
  WEB_FA_SETTINGS = "WEB_FA_SETTINGS",
  WEB_FA_DOCS = "WEB_FA_DOCS",
  WEB_FA_TAGS = "WEB_FA_TAGS",
  WEB_FA_OPERATIONS = "WEB_FA_OPERATIONS",
  WEB_FA_MOVEMENT = "WEB_FA_MOVEMENT",
  WEB_FA_ADMIN = "WEB_FA_ADMIN",
}

/**
 * Maps menu names to their corresponding sidebar routes.
 */
export const MENU_ROUTE_MAP: Record<string, string> = {
  [MenuName.WEB_OVERVIEW]: "/dashboard/fixed-assets/",
  [MenuName.WEB_LEDGER]: "/dashboard/ledger",
  [MenuName.WEB_LEDGER_V2]: "/dashboard/ledger-v2",
  [MenuName.WEB_PRINT_RFID]: "/dashboard/print-rfid",
  [MenuName.WEB_ASSIGN_RFID]: "/dashboard/assign-rfid",
  [MenuName.WEB_DISPOSABLE_EPC]: "/dashboard/disposable-epc",
  [MenuName.WEB_REUSABLE_EPC]: "/dashboard/reusable-epc",
  [MenuName.WEB_LEDGER_PRODUCT]: "/dashboard/ledger-product",
  [MenuName.WEB_INVENTORY]: "/dashboard/inventory",
  [MenuName.WEB_INBOUND]: "/dashboard/inbound",
  [MenuName.WEB_INBOUND_LOG]: "/dashboard/inbound-log",
  [MenuName.WEB_INVENTORY_MENU]: "/dashboard/inventory-menu",
  [MenuName.WEB_OUTBOUND]: "/dashboard/outbound",
  [MenuName.WEB_OUTBOUND_LOG]: "/dashboard/outbound-log",
  [MenuName.WEB_REPORTS]: "/dashboard/report",
  [MenuName.WEB_STOCK_AUDIT]: "/dashboard/stock-audit",

  [MenuName.WEB_STOCK_AUDIT_AREA]: "/dashboard/stock-audit-area",
  [MenuName.WEB_STOCK_AUDIT_TOTAL]: "/dashboard/stock-audit-total",
  [MenuName.WEB_PACKING]: "/dashboard/packing",
  [MenuName.WEB_INBOUND_PACKING]: "/dashboard/inbound-packing",
  [MenuName.WEB_OUTBOUND_PACKING]: "/dashboard/outbound-packing",
  [MenuName.WEB_CATEGORY]: "/dashboard/category",
  [MenuName.WEB_CATEGORY_MENU]: "/dashboard/category-menu",
  [MenuName.WEB_ATTRIBUTE_LIST]: "/dashboard/attribute",
  [MenuName.WEB_ATTRIBUTE_COLLECTION]: "/dashboard/attribute/collection",
  [MenuName.WEB_SKU]: "/dashboard/sku",
  [MenuName.WEB_PRODUCT]: "/dashboard/product",
  [MenuName.WEB_PACKING_COLLECTION]: "/dashboard/packing-collection",
  [MenuName.WEB_STORE]: "/dashboard/store",
  [MenuName.WEB_EMPLOYEE]: "/dashboard/employee",
  [MenuName.WEB_EPC]: "/dashboard/epc",
  [MenuName.WEB_API_KEYS]: "/dashboard/api-key",
  [MenuName.WEB_STOCK_MOVEMENT_TYPES]: "/dashboard/stock-movement-types",
  [MenuName.WEB_GATE_LOG]: "/dashboard/gate-log",
  [MenuName.WEB_EDGE_CONFIG]: "/dashboard/edge-config",
  [MenuName.WEB_ADD_REMOVE_RFID]: "/dashboard/add-remove-rfid",
  [MenuName.WEB_KBM_GRADE]: "/dashboard/kbm-grade-st-susun",
  [MenuName.WEB_KBM_GRADE_ST_BATANG]: "/dashboard/kbm-grade-st-batang",
  [MenuName.WEB_KBM_GRADE_ST_SUSUN]: "/dashboard/kbm-grade-st-susun",
  [MenuName.WEB_KBM_NO_PALET]: "/dashboard/kbm-no-palet",
  [MenuName.WEB_KBM_PANJANG]: "/dashboard/kbm-panjang",
  [MenuName.WEB_KBM_PANJANG_LOG]: "/dashboard/kbm-panjang-log",
  [MenuName.WEB_KBM_TRIMMING_LOG]: "/dashboard/kbm-trimming-log",
  [MenuName.WEB_KBM_LEBAR]: "/dashboard/kbm-lebar",
  [MenuName.WEB_KBM_TEBAL]: "/dashboard/kbm-tebal",
  [MenuName.WEB_KBM_DEPARTMENT]: "/dashboard/kbm-department",

  [MenuName.WEB_KBM_BARANG]: "/dashboard/kbm-barang",
  [MenuName.WEB_KBM_CATEGORY]: "/dashboard/kbm-category",
  [MenuName.WEB_KBM_GUDANG]: "/dashboard/kbm-gudang",
  [MenuName.WEB_KBM_KAYU_BULAT]: "/dashboard/kbm-kayu-bulat",
  [MenuName.WEB_KBM_KAYU_BULAT_GRADE]: "/dashboard/kbm-kayu-bulat-grade",
  [MenuName.WEB_KBM_MESIN]: "/dashboard/kbm-mesin",
  [MenuName.WEB_KBM_MITRA_BISNIS]: "/dashboard/kbm-mitra-bisnis",
  [MenuName.WEB_KBM_KAYU_LAMINA]: "/dashboard/kbm-kayu-lamina",
  [MenuName.WEB_KBM_LAMINA]: "/dashboard/kbm-lamina",
  [MenuName.WEB_ST_KERING_LOG]: "/dashboard/st-kering-log",
  [MenuName.WEB_ST_KERING]: "/dashboard/st-kering",
  [MenuName.WEB_INVENTORY_AREA]: "/dashboard/inventory-area",
  [MenuName.WEB_USER_MANAGEMENT]: "/dashboard/employee",
  [MenuName.WEB_USER_MENU]: "/dashboard/user-menu",
  [MenuName.WEB_VERIFICATION]: "/dashboard/verification",
  [MenuName.WEB_VERIFICATION_ST_KERING]: "/dashboard/verification-st-kering",
  [MenuName.WEB_LAMINA]: "/dashboard/lamina-log",
  [MenuName.WEB_LAMINA_LOG]: "/dashboard/lamina-log",
  [MenuName.WEB_LAMINA_INBOUND_LOG]: "/dashboard/lamina-inbound-log",
  [MenuName.WEB_LAMINA_OUTBOUND_LOG]: "/dashboard/lamina-outbound-log",
  [MenuName.WEB_ATTRIBUTE_V2]: "/dashboard/attribute",
  [MenuName.WEB_CATEGORY_V2]: "/dashboard/category",
  [MenuName.WEB_KBM_DEPARTMENT_ST_KERING]: "/dashboard/kbm-department-st-kering",
  [MenuName.WEB_KBM_DEPARTMENT_V2]: "/dashboard/kbm-department-v2",
  [MenuName.WEB_KBM_MESIN_KELUAR_LAMINA]: "/dashboard/kbm-mesin-keluar-lamina",
  [MenuName.WEB_KBM_MESIN_KELUAR_ST_KERING]: "/dashboard/kbm-mesin-keluar-st-kering",
  [MenuName.WEB_KBM_MESIN_MASUK_ST_KERING]: "/dashboard/kbm-mesin-masuk-st-kering",
  [MenuName.WEB_KBM_MESIN_V2]: "/dashboard/kbm-mesin-v2",
  [MenuName.WEB_KBM_MITRA_BISNIS_ST_KERING]: "/dashboard/kbm-mitra-bisnis-st-kering",
  [MenuName.WEB_KBM_MITRA_BISNIS_V2]: "/dashboard/kbm-mitra-bisnis-v2",
  [MenuName.WEB_KBM_PROSES_V2]: "/dashboard/kbm-proses-v2",
  [MenuName.WEB_KBM_PROSES_KELUAR_LAMINA]: "/dashboard/kbm-proses-keluar-lamina",
  [MenuName.WEB_KBM_PROSES_MASUK_ST_KERING]: "/dashboard/kbm-proses-masuk-st-kering",
  [MenuName.WEB_KBM_PROSES_KELUAR_ST_KERING]: "/dashboard/kbm-proses-keluar-st-kering",
  [MenuName.WEB_KBM_SHIFT_V2]: "/dashboard/kbm-shift-v2",
  [MenuName.WEB_KBM_SHIFT_KELUAR_LAMINA]: "/dashboard/kbm-shift-keluar-lamina",
  [MenuName.WEB_KBM_SUPPLIER_V2]: "/dashboard/kbm-supplier-v2",
  [MenuName.WEB_KBM_LAMINA_GRADE]: "/dashboard/kbm-lamina-grade",
  [MenuName.WEB_KBM_LAMINA_MASTER]: "/dashboard/kbm-lamina-grade",
  [MenuName.WEB_KBM_ST_KERING_GRADE]: "/dashboard/kbm-st-kering-grade",
  [MenuName.WEB_ST_KERING_MASTER]: "/dashboard/kbm-grade-st-susun",
  [MenuName.WEB_STOCK_ALERT_CONFIG]: "/dashboard/stock-alert-config",
  [MenuName.WEB_GATE_MANAGEMENT]: "/dashboard/gate-management",
  [MenuName.WEB_GATE_MONITOR]: "/dashboard/gate-monitor",
  [MenuName.WEB_DEVICE_MANAGEMENT]: "/dashboard/device-management",
  [MenuName.WEB_GATE_ACTIVITY]: "/dashboard/gate-activity",
  [MenuName.WEB_ST_BASAH]: "/dashboard/st-basah-grade",
  [MenuName.WEB_ST_BASAH_LOG]: "/dashboard/st-basah-log",
  [MenuName.WEB_KBM_ST_BASAH_GRADE]: "/dashboard/kbm-st-basah-grade",
  [MenuName.WEB_KBM_DEPARTMENT_ST_BASAH]: "/dashboard/kbm-department-st-basah",
  [MenuName.WEB_KBM_DEPARTMENT_PENERIMAAN_LOG]: "/dashboard/kbm-department-penerimaan-log",
  [MenuName.WEB_KBM_MESIN_KELUAR_PENERIMAAN_LOG]: "/dashboard/kbm-mesin-keluar-penerimaan-log",
  [MenuName.WEB_KBM_MESIN_KELUAR_ST_BASAH]: "/dashboard/kbm-mesin-keluar-st-basah",
  [MenuName.WEB_KBM_MESIN_MASUK_PENERIMAAN_LOG]: "/dashboard/kbm-mesin-masuk-penerimaan-log",
  [MenuName.WEB_KBM_MESIN_MASUK_ST_BASAH]: "/dashboard/kbm-mesin-masuk-st-basah",
  [MenuName.WEB_KBM_MITRA_BISNIS_PENERIMAAN_LOG]: "/dashboard/kbm-mitra-bisnis-penerimaan-log",
  [MenuName.WEB_KBM_MITRA_BISNIS_ST_BASAH]: "/dashboard/kbm-mitra-bisnis-st-basah",
  [MenuName.WEB_KBM_PENERIMAAN_LOG_GRADE]: "/dashboard/kbm-penerimaan-log-grade",
  [MenuName.WEB_KBM_PROSES_KELUAR_PENERIMAAN_LOG]: "/dashboard/kbm-proses-keluar-penerimaan-log",
  [MenuName.WEB_KBM_PROSES_KELUAR_ST_BASAH]: "/dashboard/kbm-proses-keluar-st-basah",
  [MenuName.WEB_KBM_PROSES_MASUK_PENERIMAAN_LOG]: "/dashboard/kbm-proses-masuk-penerimaan-log",
  [MenuName.WEB_KBM_PROSES_MASUK_ST_BASAH]: "/dashboard/kbm-proses-masuk-st-basah",
  [MenuName.WEB_PENERIMAAN_LOG]: "/dashboard/penerimaan-log",
  [MenuName.WEB_PENERIMAAN_LOG_LOG]: "/dashboard/penerimaan-log",
  [MenuName.WEB_ST_PENERIMAAN_LOG]: "/dashboard/st-penerimaan-log-grade",
  [MenuName.WEB_ST_PENERIMAAN_LOG_LOG]: "/dashboard/st-penerimaan-log-log",
  [MenuName.WEB_VERIFICATION_PENERIMAAN_LOG]: "/dashboard/verification-penerimaan-log",
  [MenuName.WEB_VERIFICATION_ST_BASAH]: "/dashboard/verification-st-basah",
  [MenuName.WEB_VALIDATION_PENERIMAAN_LOG]: "/dashboard/validation-penerimaan-log",
  [MenuName.WEB_DEVICE_MONITORING]: "/dashboard/device-monitoring",
  [MenuName.WEB_FA_DASHBOARD]: "/dashboard/fixed-assets",
  [MenuName.WEB_FA_REGISTER]: "/dashboard/fixed-assets/register",
  [MenuName.WEB_FA_MASTER_DATA]: "/dashboard/fixed-assets/master-data",
  [MenuName.WEB_FA_RFID_TAGS]: "/dashboard/fixed-assets/rfid-tags",
  [MenuName.WEB_FA_SCAN_IN]: "/dashboard/fixed-assets/scan-in",
  [MenuName.WEB_FA_SCAN_OUT]: "/dashboard/fixed-assets/scan-out",
  [MenuName.WEB_FA_CHECK_OUT]: "/dashboard/fixed-assets/check-out",
  [MenuName.WEB_FA_TRANSFER]: "/dashboard/fixed-assets/transfer",
  [MenuName.WEB_FA_AUDIT]: "/dashboard/fixed-assets/audit",
  [MenuName.WEB_FA_MAINTENANCE]: "/dashboard/fixed-assets/maintenance",
  [MenuName.WEB_FA_RTLS]: "/dashboard/fixed-assets/rtls",
  [MenuName.WEB_FA_SECURITY]: "/dashboard/fixed-assets/security",
  [MenuName.WEB_FA_REPORTS]: "/dashboard/fixed-assets/reports",
  [MenuName.WEB_FA_USERS]: "/dashboard/fixed-assets/users",
  [MenuName.WEB_FA_SETTINGS]: "/dashboard/fixed-assets/settings",
  [MenuName.WEB_FA_DOCS]: "/dashboard/fixed-assets/docs",
};

/**
 * Reverse map: route -> menu name for quick lookup
 */
export const ROUTE_MENU_MAP: Record<string, string> = Object.entries(
  MENU_ROUTE_MAP,
).reduce(
  (acc, [menuName, route]) => {
    acc[route] = menuName;
    return acc;
  },
  {} as Record<string, string>,
);
