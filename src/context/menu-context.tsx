"use client";

import { createContext, useContext, useMemo } from "react";

import { useUser } from "@/context/user-context";
import useGetMeMenusQuery from "@/hooks/api/menu/useGetMeMenusQuery";
import { type BaseNavItem, buildNavTreeFromApi, getMenuRoute } from "@/lib/menu-utils";
import { MeMenuItem, ROUTE_MENU_MAP } from "@/types/menu";

/**
 * Hierarchical fallback menu tree — mirrors the structure expected from /me/menus.
 * Used when the API returns empty so the sidebar always has grouped, collapsible items.
 * Top-level items with `children` render as collapsible sections in NavMain.
 */
const FALLBACK_TREE: Array<{
  name: string;
  children?: string[];
}> = [
  { name: "WEB_OVERVIEW" },
  {
    children: [
      "WEB_SKU",
      "WEB_PRODUCT",
      "WEB_CATEGORY",
      "WEB_ATTRIBUTE_LIST",
      "WEB_ATTRIBUTE_COLLECTION",
      "WEB_REFERENCE",
      "WEB_STORE",
      "WEB_STOCK_MOVEMENT_TYPES",
    ],
    name: "WEB_CATEGORY_MENU",
  },
  {
    children: [
      "WEB_INVENTORY",
      "WEB_INVENTORY_AREA",
      "WEB_STOCK_AUDIT",
      "WEB_STOCK_AUDIT_AREA",
      "WEB_STOCK_AUDIT_TOTAL",
    ],
    name: "WEB_INVENTORY_MENU",
  },
  { name: "WEB_LEDGER" },
  { name: "WEB_LEDGER_V2" },
  { name: "WEB_LEDGER_PRODUCT" },
  { name: "WEB_INBOUND" },
  { name: "WEB_INBOUND_PACKING" },
  { name: "WEB_OUTBOUND" },
  { name: "WEB_OUTBOUND_PACKING" },
  { name: "WEB_PACKING" },
  { name: "WEB_PACKING_COLLECTION" },
  { name: "WEB_VERIFICATION" },
  { name: "WEB_VERIFICATION_ST_KERING" },
  { name: "WEB_INBOUND_LOG" },
  { name: "WEB_OUTBOUND_LOG" },
  { name: "WEB_GATE_LOG" },
  {
    children: [
      "WEB_EPC",
      "WEB_REUSABLE_EPC",
      "WEB_DISPOSABLE_EPC",
      "WEB_ASSIGN_RFID",
      "WEB_ADD_REMOVE_RFID",
      "WEB_PRINT_RFID",
      "WEB_EDGE_CONFIG",
    ],
    name: "WEB_HARDWARE",
  },
  { name: "WEB_REPORTS" },
  { name: "WEB_EMPLOYEE" },
  { name: "WEB_USER_MENU" },
  { name: "WEB_API_KEYS" },
];

function buildFallbackMenuTree(): MeMenuItem[] {
  return FALLBACK_TREE.map((entry, parentIdx) => {
    const item: MeMenuItem = {
      id: `fallback-${entry.name}`,
      name: entry.name,
      sort_order: parentIdx,
    };
    if (entry.children && entry.children.length > 0) {
      item.children = entry.children.map((childName, childIdx) => ({
        id: `fallback-${childName}`,
        name: childName,
        parent_id: item.id,
        sort_order: childIdx,
      }));
    }
    return item;
  });
}

interface MenuContextType {
  /**
   * List of active menus in tree structure from the API.
   * Only menus that exist in MENU_CONFIG/MENU_ROUTE_MAP are included.
   */
  menuTree: BaseNavItem[];
  /**
   * Set of menu names that are active for the current user.
   */
  allowedMenus: Set<string>;
  /**
   * Whether the menu data is still loading.
   */
  isLoading: boolean;
  /**
   * Check if a menu is visible based on its name.
   */
  isMenuVisible: (menuName: string) => boolean;
  /**
   * Check if a route is visible based on its path.
   */
  isRouteVisible: (route: string) => boolean;
  /**
   * Get the route for a menu name.
   */
  getMenuRoute: (menuName: string) => string;
}

const MenuContext = createContext<MenuContextType>({
  allowedMenus: new Set(),
  getMenuRoute: () => "#",
  isLoading: true,
  isMenuVisible: () => true,
  isRouteVisible: () => true,
  menuTree: [],
});

/** Recursively collect all menu names from the tree. */
function collectMenuNames(menus: MeMenuItem[]): string[] {
  return menus.flatMap((menu) => [
    menu.name,
    ...(menu.children ? collectMenuNames(menu.children) : []),
  ]);
}

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const { tokenPayload } = useUser();

  const organizationId = tokenPayload?.organization_id;
  const { data: meMenusResponse, isError, isLoading } = useGetMeMenusQuery({
    enabled: Boolean(tokenPayload),
    organizationId,
  });

  // Build menu tree from API response, with fallback to local config when empty
  const menuTree = useMemo(() => {
    const apiMenus = meMenusResponse?.data?.menus;
    if (apiMenus && apiMenus.length > 0) {
      const tree = buildNavTreeFromApi(apiMenus);
      if (tree.length > 0) return tree;
    }
    // Fallback: render every configured route so the sidebar is never empty
    if (!isLoading) {
      return buildNavTreeFromApi(buildFallbackMenuTree());
    }
    return [];
  }, [meMenusResponse, isLoading]);

  // All menu names returned by /me/menus are effectively ACTIVE
  const allowedMenus = useMemo(() => {
    if (!meMenusResponse?.data?.menus) return new Set<string>();
    return new Set(collectMenuNames(meMenusResponse.data.menus));
  }, [meMenusResponse]);

  const isMenuVisible = (menuName: string): boolean => {
    if (isLoading) return true;
    if (isError) {
      console.warn("Me menus endpoint failed, showing all menus as fallback");
      return true;
    }
    if (allowedMenus.size === 0) {
      console.warn("No allowed menus configured, showing all menus as fallback");
      return true;
    }
    return allowedMenus.has(menuName);
  };

  const isRouteVisible = (route: string): boolean => {
    if (isLoading) return true;
    const menuName = ROUTE_MENU_MAP[route];
    if (!menuName) return true;
    return isMenuVisible(menuName);
  };

  return (
    <MenuContext.Provider
      value={{
        allowedMenus,
        getMenuRoute,
        isLoading,
        isMenuVisible,
        isRouteVisible,
        menuTree,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}
