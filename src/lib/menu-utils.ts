import type { LucideIcon } from "lucide-react";
import {
  Book,
  BookOpen,
  Boxes,
  Circle,
  ClipboardCheck,
  Download,
  FileText,
  Gauge,
  LayoutDashboard,
  MapPin,
  Package,
  Radio,
  Settings,
  Shield,
  ShoppingCart,
  Tags,
  Truck,
  Users,
  Warehouse,
  Wrench,
} from "lucide-react";

import { MeMenuItem, MENU_ROUTE_MAP } from "@/types/menu";

/**
 * Base navigation item type
 */
export interface BaseNavItem {
  children?: BaseNavItem[];
  icon?: LucideIcon;
  isActive?: boolean;
  menuName: string;
  title?: string;
  url: string;
}

/**
 * Flat config: menuName → { url, icon }
 * Only defines routes and icons — hierarchy comes entirely from the API response.
 * Parent menus (with children in API) do NOT need a url here; they will use "#".
 */
const MENU_CONFIG: Record<string, { icon?: LucideIcon; url?: string }> = {
  WEB_ADD_REMOVE_RFID: { url: "/dashboard/add-remove-rfid" },
  WEB_API_KEYS: { url: "/dashboard/api-key" },
  WEB_ASSIGN_RFID: { url: "/dashboard/assign-rfid" },
  WEB_ATTRIBUTE_COLLECTION: { url: "/dashboard/attribute/collection" },
  WEB_ATTRIBUTE_LIST: { url: "/dashboard/attribute" },
  WEB_CATEGORY: { url: "/dashboard/category" },
  WEB_CATEGORY_MENU: { icon: Book },
  WEB_DEVICE_MANAGEMENT: { url: "/dashboard/device-management" },
  WEB_DEVICE_MONITORING: { url: "/dashboard/device-monitoring" },
  WEB_DISPOSABLE_EPC: { url: "/dashboard/disposable-epc" },
  WEB_EDGE_CONFIG: { url: "/dashboard/edge-config" },
  WEB_EPC: { url: "/dashboard/epc" },
  WEB_FA_AUDIT: { icon: ClipboardCheck, url: "/dashboard/fixed-assets/audit" },
  WEB_FA_CHECK_OUT: { icon: Truck, url: "/dashboard/fixed-assets/check-out" },
  WEB_FA_DASHBOARD: { icon: LayoutDashboard, url: "/dashboard/fixed-assets" },
  WEB_FA_DOCS: { icon: BookOpen, url: "/dashboard/fixed-assets/docs" },
  WEB_FA_MAINTENANCE: { icon: Wrench, url: "/dashboard/fixed-assets/maintenance" },
  WEB_FA_MASTER_DATA: { icon: Boxes, url: "/dashboard/fixed-assets/master-data" },
  WEB_FA_REGISTER: { icon: Package, url: "/dashboard/fixed-assets/register" },
  WEB_FA_REPORTS: { icon: FileText, url: "/dashboard/fixed-assets/reports" },
  WEB_FA_RFID_TAGS: { icon: Tags, url: "/dashboard/fixed-assets/rfid-tags" },
  WEB_FA_RTLS: { icon: MapPin, url: "/dashboard/fixed-assets/rtls" },
  WEB_FA_SCAN_IN: { icon: Download, url: "/dashboard/fixed-assets/scan-in" },
  WEB_FA_SCAN_OUT: { icon: ShoppingCart, url: "/dashboard/fixed-assets/scan-out" },
  WEB_FA_SECURITY: { icon: Shield, url: "/dashboard/fixed-assets/security" },
  WEB_FA_SETTINGS: { icon: Settings, url: "/dashboard/fixed-assets/settings" },
  WEB_FA_TRANSFER: { icon: Radio, url: "/dashboard/fixed-assets/transfer" },
  WEB_FA_USERS: { icon: Users, url: "/dashboard/fixed-assets/users" },
  WEB_GATE_ACTIVITY: { url: "/dashboard/gate-activity" },
  WEB_GATE_LOG: { url: "/dashboard/gate-log" },
  WEB_GATE_MANAGEMENT: { url: "/dashboard/gate-management" },
  WEB_GATE_MONITOR: { url: "/dashboard/gate-monitor" },
  WEB_HARDWARE: { icon: Radio },
  WEB_INBOUND: { url: "/dashboard/inbound" },
  WEB_INBOUND_LOG: { url: "/dashboard/inbound-log" },
  WEB_INBOUND_PACKING: { url: "/dashboard/inbound-packing" },
  WEB_INBOUND_PENERIMAAN_LOG: { url: "/dashboard/inbound-penerimaan-log" },
  WEB_INBOUND_ST_BASAH: { url: "/dashboard/inbound-st-basah" },
  WEB_INVENTORY: { url: "/dashboard/inventory" },
  WEB_INVENTORY_AREA: { url: "/dashboard/inventory-area" },
  WEB_INVENTORY_MENU: { icon: Warehouse },
  WEB_KBM_BARANG: { url: "/dashboard/kbm-barang" },
  WEB_KBM_BATANG_MANUAL: {},
  WEB_KBM_CATEGORY: { url: "/dashboard/kbm-category" },
  WEB_KBM_DEPARTMENT: { url: "/dashboard/kbm-department" },
  WEB_KBM_DEPARTMENT_PENERIMAAN_LOG: { url: "/dashboard/kbm-department-penerimaan-log" },
  WEB_KBM_DEPARTMENT_ST_BASAH: { url: "/dashboard/kbm-department-st-basah" },
  WEB_KBM_DEPARTMENT_ST_KERING: { url: "/dashboard/kbm-department-st-kering" },
  WEB_KBM_DEPARTMENT_V2: { url: "/dashboard/kbm-department-v2" },
  WEB_KBM_GRADE_ST_BATANG: { url: "/dashboard/kbm-grade-st-batang" },
  WEB_KBM_GRADE_ST_SUSUN: { url: "/dashboard/kbm-grade-st-susun" },
  WEB_KBM_GUDANG: { url: "/dashboard/kbm-gudang" },
  WEB_KBM_KAYU_BULAT: { url: "/dashboard/kbm-kayu-bulat" },
  WEB_KBM_KAYU_BULAT_GRADE: { url: "/dashboard/kbm-kayu-bulat-grade" },
  WEB_KBM_KAYU_LAMINA: { url: "/dashboard/kbm-kayu-lamina" },
  WEB_KBM_KAYU_ST_KERING: { url: "/dashboard/kbm-kayu-st-kering" },
  WEB_KBM_LAMINA: { url: "/dashboard/kbm-lamina" },
  WEB_KBM_LAMINA_GRADE: { url: "/dashboard/kbm-lamina-grade" },
  WEB_KBM_LAMINA_MASTER: { icon: Package, url: "/dashboard/kbm-lamina-grade" },
  WEB_KBM_LEBAR: { url: "/dashboard/kbm-lebar" },
  WEB_KBM_MASTER: { url: "/dashboard/kbm-grade-st-susun" },
  WEB_KBM_MESIN: { url: "/dashboard/kbm-mesin" },
  WEB_KBM_MESIN_KELUAR_LAMINA: { url: "/dashboard/kbm-mesin-keluar-lamina" },
  WEB_KBM_MESIN_KELUAR_PENERIMAAN_LOG: { url: "/dashboard/kbm-mesin-keluar-penerimaan-log" },
  WEB_KBM_MESIN_KELUAR_ST_BASAH: { url: "/dashboard/kbm-mesin-keluar-st-basah" },
  WEB_KBM_MESIN_KELUAR_ST_KERING: { url: "/dashboard/kbm-mesin-keluar-st-kering" },
  WEB_KBM_MESIN_MASUK_PENERIMAAN_LOG: { url: "/dashboard/kbm-mesin-masuk-penerimaan-log" },
  WEB_KBM_MESIN_MASUK_ST_BASAH: { url: "/dashboard/kbm-mesin-masuk-st-basah" },
  WEB_KBM_MESIN_MASUK_ST_KERING: { url: "/dashboard/kbm-mesin-masuk-st-kering" },
  WEB_KBM_MESIN_V2: { url: "/dashboard/kbm-mesin-v2" },
  WEB_KBM_MITRA_BISNIS: { url: "/dashboard/kbm-mitra-bisnis" },
  WEB_KBM_MITRA_BISNIS_PENERIMAAN_LOG: { url: "/dashboard/kbm-mitra-bisnis-penerimaan-log" },
  WEB_KBM_MITRA_BISNIS_ST_BASAH: { url: "/dashboard/kbm-mitra-bisnis-st-basah" },
  WEB_KBM_MITRA_BISNIS_ST_KERING: { url: "/dashboard/kbm-mitra-bisnis-st-kering" },
  WEB_KBM_MITRA_BISNIS_V2: { url: "/dashboard/kbm-mitra-bisnis-v2" },
  WEB_KBM_NO_PALET: { url: "/dashboard/kbm-no-palet" },
  WEB_KBM_PANJANG: { url: "/dashboard/kbm-panjang" },
  WEB_KBM_PANJANG_LOG: { url: "/dashboard/kbm-panjang-log" },
  WEB_KBM_PENERIMAAN_LOG_GRADE: { url: "/dashboard/kbm-penerimaan-log-grade" },
  WEB_KBM_PENERIMAAN_LOG_MASTER: { url: "/dashboard/kbm-penerimaan-log-master" },
  WEB_KBM_PROSES_KELUAR_LAMINA: { url: "/dashboard/kbm-proses-keluar-lamina" },
  WEB_KBM_PROSES_KELUAR_PENERIMAAN_LOG: { url: "/dashboard/kbm-proses-keluar-penerimaan-log" },
  WEB_KBM_PROSES_KELUAR_ST_BASAH: { url: "/dashboard/kbm-proses-keluar-st-basah" },
  WEB_KBM_PROSES_KELUAR_ST_KERING: { url: "/dashboard/kbm-proses-keluar-st-kering" },
  WEB_KBM_PROSES_MASUK_PENERIMAAN_LOG: { url: "/dashboard/kbm-proses-masuk-penerimaan-log" },
  WEB_KBM_PROSES_MASUK_ST_BASAH: { url: "/dashboard/kbm-proses-masuk-st-basah" },
  WEB_KBM_PROSES_MASUK_ST_KERING: { url: "/dashboard/kbm-proses-masuk-st-kering" },
  WEB_KBM_PROSES_V2: { url: "/dashboard/kbm-proses-v2" },
  WEB_KBM_SHIFT_KELUAR_LAMINA: { url: "/dashboard/kbm-shift-keluar-lamina" },
  WEB_KBM_SHIFT_V2: { url: "/dashboard/kbm-shift-v2" },

  WEB_KBM_ST_BASAH_GRADE: { url: "/dashboard/kbm-st-basah-grade" },
  WEB_KBM_ST_KERING_GRADE: { icon: Package, url: "/dashboard/kbm-st-kering-grade" },
  WEB_KBM_SUPPLIER_V2: { url: "/dashboard/kbm-supplier-v2" },
  WEB_KBM_TEBAL: { url: "/dashboard/kbm-tebal" },
  WEB_KBM_TRIMMING_LOG: { url: "/dashboard/kbm-trimming-log" },
  WEB_LAMINA: { icon: Package },
  WEB_LAMINA_INBOUND_LOG: { url: "/dashboard/lamina-inbound-log" },
  WEB_LAMINA_LOG: { url: "/dashboard/lamina-log" },
  WEB_LAMINA_OUTBOUND_LOG: { url: "/dashboard/lamina-outbound-log" },
  WEB_LEDGER: { icon: Book, url: "/dashboard/ledger" },
  WEB_LEDGER_PRODUCT: { url: "/dashboard/ledger-product" },
  WEB_LEDGER_V2: { icon: Book },
  WEB_MASTER_DATA: { icon: BookOpen },
  WEB_ODOO_MODULE: { url: "/dashboard/odoo-module" },
  WEB_OUTBOUND: { url: "/dashboard/outbound" },
  WEB_OUTBOUND_LOG: { url: "/dashboard/outbound-log" },
  WEB_OUTBOUND_PACKING: { url: "/dashboard/outbound-packing" },
  WEB_OUTBOUND_PENERIMAAN_LOG: { url: "/dashboard/outbound-penerimaan-log" },
  WEB_OUTBOUND_ST_BASAH: { url: "/dashboard/outbound-st-basah" },
  WEB_OVERVIEW: { icon: Gauge, url: "/dashboard/overview" },
  WEB_PACKING: { url: "/dashboard/packing" },
  WEB_PACKING_COLLECTION: { url: "/dashboard/packing-collection" },
  WEB_PENERIMAAN_LOG: { icon: Package, url: "/dashboard/penerimaan-log" },
  WEB_PENERIMAAN_LOG_MASTER: { url: "/dashboard/kbm-penerimaan-log-master" },
  WEB_PRINT_RFID: { url: "/dashboard/print-rfid" },
  WEB_PRODUCT: { url: "/dashboard/product" },
  WEB_REFERENCE: { url: "/dashboard/reference" },
  WEB_REPORTS: { url: "/dashboard/report" },
  WEB_REUSABLE_EPC: { url: "/dashboard/reusable-epc" },
  WEB_SKU: { url: "/dashboard/sku" },
  WEB_STOCK_ALERT_CONFIG: { url: "/dashboard/stock-alert-config" },
  WEB_STOCK_AUDIT: { url: "/dashboard/stock-audit" },
  WEB_STOCK_AUDIT_AREA: { url: "/dashboard/stock-audit-area" },
  WEB_STOCK_AUDIT_TOTAL: { url: "/dashboard/stock-audit-total" },
  WEB_STOCK_MOVEMENT_TYPES: { url: "/dashboard/stock-movement-types" },
  WEB_STORE: { url: "/dashboard/store" },
  WEB_ST_BASAH: { icon: Package },
  WEB_ST_BASAH_LOG: { url: "/dashboard/st-basah-log" },
  WEB_ST_KERING: { icon: Package },
  WEB_ST_KERING_LOG: { url: "/dashboard/st-kering-log" },
  WEB_ST_KERING_MASTER: { url: "/dashboard/kbm-grade-st-susun" },
  WEB_ST_PENERIMAAN_LOG: { icon: Package },
  WEB_ST_PENERIMAAN_LOG_LOG: { url: "/dashboard/st-penerimaan-log-log" },
  WEB_USER_MANAGEMENT: { url: "/dashboard/employee" },
  WEB_USER_MENU: { url: "/dashboard/user-menu" },
  WEB_VALIDATION_PENERIMAAN_LOG: { icon: ClipboardCheck, url: "/dashboard/validation-penerimaan-log" },
  WEB_VERIFICATION: { icon: ClipboardCheck, url: "/dashboard/verification" },
  WEB_VERIFICATION_PENERIMAAN_LOG: { icon: ClipboardCheck, url: "/dashboard/verification-penerimaan-log" },
  WEB_VERIFICATION_ST_BASAH: { icon: ClipboardCheck, url: "/dashboard/verification-st-basah" },
  WEB_VERIFICATION_ST_KERING: { icon: ClipboardCheck, url: "/dashboard/verification-st-kering" },
};

/**
 * Builds a navigation tree from the /accounts/me/menus API response.
 * Hierarchy and order (sort_order) come from the API.
 * MENU_CONFIG provides icon and url for each menu name.
 *
 * Rules:
 * - MOBILE_* menus are filtered out (web sidebar only)
 * - All returned menus are already effectively ACTIVE (no user_status check needed)
 * - Parent menus (has children after filtering) → url: "#"
 * - Leaf menus → url from MENU_CONFIG or MENU_ROUTE_MAP fallback
 * - Children sorted by sort_order
 */
export function buildNavTreeFromApi(apiMenus: MeMenuItem[]): BaseNavItem[] {
  function convertMenu(apiMenu: MeMenuItem): BaseNavItem | null {
    if (apiMenu.name.startsWith("MOBILE")) return null;
    // Skip menus not configured in frontend (unknown menus)
    if (!(apiMenu.name in MENU_CONFIG) && !(apiMenu.name in MENU_ROUTE_MAP))
      return null;

    const children = apiMenu.children
      ?.slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(convertMenu)
      .filter((item): item is BaseNavItem => item !== null);

    const hasChildren = children && children.length > 0;
    const config = MENU_CONFIG[apiMenu.name] ?? {};
    const url = hasChildren
      ? "#"
      : (config.url ?? MENU_ROUTE_MAP[apiMenu.name] ?? "#");

    return {
      children: hasChildren ? children : undefined,
      icon: config.icon,
      menuName: apiMenu.name,
      url,
    };
  }

  return apiMenus
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(convertMenu)
    .filter((item): item is BaseNavItem => item !== null);
}

/**
 * Gets the route for a menu name from MENU_CONFIG or MENU_ROUTE_MAP.
 */
export function getMenuRoute(menuName: string): string {
  return MENU_CONFIG[menuName]?.url ?? MENU_ROUTE_MAP[menuName] ?? "#";
}

/**
 * Gets the icon for a menu name. Returns Circle as fallback.
 */
export function getMenuIcon(menuName: string): LucideIcon {
  return MENU_CONFIG[menuName]?.icon ?? Circle;
}
