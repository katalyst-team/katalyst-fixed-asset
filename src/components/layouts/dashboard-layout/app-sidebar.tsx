/* eslint-disable simple-import-sort/imports */
"use client";
import { GalleryVerticalEnd } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import * as React from "react";

import { NavMain } from "@/components/layouts/dashboard-layout/nav-main";
import { NavUser } from "@/components/layouts/dashboard-layout/nav-user";
import { TeamSwitcher } from "@/components/layouts/dashboard-layout/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useMenu } from "@/context/menu-context";
import { useUser } from "@/context/user-context";
import { type BaseNavItem, getMenuIcon, getMenuRoute } from "@/lib/menu-utils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation("common");
  const { tokenPayload } = useUser();
  const { menuTree, isLoading } = useMenu();
  const { pathname } = useRouter();
  const menuRoutes = React.useMemo(() => {
    const routes = new Set<string>();

    const collectRoutes = (item: BaseNavItem) => {
      const route = getMenuRoute(item.menuName);
      if (route && route !== "#") routes.add(route);
      item.children?.forEach(collectRoutes);
    };

    menuTree.forEach(collectRoutes);

    return Array.from(routes);
  }, [menuTree]);

  /**
   * Convert menu name to camelCase for translation key
   * e.g., WEB_LEDGER_V2 → ledgerV2, WEB_PRINT_RFID → printRfid
   */
  const menuNameToKey = (menuName: string): string => {
    const stripped = menuName.replace(/^WEB_|^MOBILE_/, "");
    return stripped
      .split("_")
      .map((part, index) => {
        if (index === 0) return part.toLowerCase();
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      })
      .join("");
  };

  /**
   * Check if a route is active based on pathname
   * Handles exact match and child routes
   */
  const isRouteActive = React.useCallback((route: string): boolean => {
    if (route === "#" || !route) return false;

    // Exact match
    if (pathname === route) return true;

    // Child routes - activate only when there is no more specific route match.
    if (!pathname.startsWith(route + "/")) return false;

    const hasMoreSpecificMatch = menuRoutes.some(
      (candidateRoute) =>
        candidateRoute !== route &&
        candidateRoute.startsWith(route + "/") &&
        pathname === candidateRoute,
    );

    if (!hasMoreSpecificMatch) return true;

    return false;
  }, [menuRoutes, pathname]);

  /**
   * Convert BASE_NAV_ITEMS to NavItem structure with i18n titles and active states
   * Recursively processes children
   */
  const convertToNavItem = React.useCallback(
    (baseItem: BaseNavItem, depth = 0): BaseNavItem => {
      const itemRoute = getMenuRoute(baseItem.menuName);
      const translationKey = menuNameToKey(baseItem.menuName);

      const converted: BaseNavItem = {
        ...baseItem,
        icon: depth === 0 ? getMenuIcon(baseItem.menuName) : undefined,
        isActive: isRouteActive(itemRoute),
        title: t(`sidebar.${translationKey}`, {
          defaultValue: baseItem.menuName.replace(/^WEB_|^MOBILE_/, "").replace(/_/g, " "),
        }),
        url: itemRoute,
      };

      // Recursively convert children
      if (baseItem.children && baseItem.children.length > 0) {
        converted.children = baseItem.children.map((child) => convertToNavItem(child, depth + 1));
        
        // Parent should be active if any child is active
        const hasActiveChild = converted.children.some(
          (child) => child.isActive || (child.children && child.children.some((gc) => gc.isActive))
        );
        if (hasActiveChild) {
          converted.isActive = true;
        }
      }

      return converted;
    },
    [isRouteActive, t],
  );

  /**
   * Convert all menu trees to NavItems
   */
  const navItems = React.useMemo(() => {
    return menuTree.map((menu) => convertToNavItem(menu));
  }, [menuTree, convertToNavItem]);

  const data = React.useMemo(
    () => ({
      navMain: navItems,
      teams: tokenPayload?.stores
        ? tokenPayload.stores.map((store) => ({
            id: store.id,
            logo: GalleryVerticalEnd,
            name: store.name,
            plan: "Enterprise",
          }))
        : [],
      user: {
        avatar: "/avatars/shadcn.jpg",
        email: tokenPayload?.email,
        name: tokenPayload?.first_name,
      },
    }),
    [navItems, tokenPayload],
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams ?? []} />
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <NavMain items={data.navMain} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
