"use client";
import { BookOpen, Warehouse } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import * as React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type NavigationItem = {
  title: string;
  path: string;
  parent?: string;
  dynamicPaths?: {
    paramName: string;
    titlePrefix: string;
  }[];
};

type NavigationSection = {
  title: string;
  icon: React.ComponentType;
};

type NavigationStructure = {
  dashboard: {
    title: string;
    path: string;
    items: Record<string, NavigationItem>;
    sections: Record<string, NavigationSection>;
  };
};

type BreadcrumbItemType = {
  title: string;
  path: string;
  isActive: boolean;
};

export function BreadcrumbNavigation() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { pathname, query } = router;
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItemType[]>(
    []
  );

  // Navigation structure matching the sidebar
  const navigationStructure: NavigationStructure = React.useMemo(
    () => ({
      dashboard: {
        items: {
          category: {
            parent: "masterData",
            path: "/dashboard/category",
            title: t("sidebar.category"),
          },
          employee: {
            parent: "masterData",
            path: "/dashboard/employee",
            title: t("sidebar.employee"),
          },
          epc: {
            parent: "masterData",
            path: "/dashboard/epc",
            title: t("sidebar.epc"),
          },
          inbound: {
            parent: "warehouse",
            path: "/dashboard/inbound",
            title: t("sidebar.inbound"),
          },
          inventory: {
            dynamicPaths: [
              {
                paramName: "ledger_id",
                titlePrefix: t("breadcrumb.item"),
              },
            ],
            parent: "warehouse",
            path: "/dashboard/inventory",
            title: t("sidebar.inventory"),
          },
          ledger: {
            dynamicPaths: [
              {
                paramName: "ledger_id",
                titlePrefix: t("breadcrumb.detail"),
              },
            ],
            path: "/dashboard/ledger",
            title: t("sidebar.ledger"),
          },
          outbound: {
            parent: "warehouse",
            path: "/dashboard/outbound",
            title: t("sidebar.outbound"),
          },
          sku: {
            parent: "masterData",
            path: "/dashboard/sku",
            title: t("sidebar.sku"),
          },
          store: {
            dynamicPaths: [
              {
                paramName: "storeId",
                titlePrefix: t("breadcrumb.detail"),
              },
            ],
            parent: "masterData",
            path: "/dashboard/store",
            title: t("sidebar.store"),
          },
        },
        path: "/dashboard",
        sections: {
          masterData: {
            icon: BookOpen,
            title: t("masterData"),
          },
          warehouse: {
            icon: Warehouse,
            title: t("warehouse"),
          },
        },
        title: t("dashboard"),
      },
    }),
    [t]
  );

  React.useEffect(() => {
    const generateBreadcrumbs = () => {
      // Don't show breadcrumbs on the main dashboard page
      if (pathname === "/dashboard") {
        setBreadcrumbs([]);
        return;
      }

      const pathSegments = pathname.split("/").filter(Boolean);
      const items: BreadcrumbItemType[] = [];

      // Always add Dashboard as the first item
      items.push({
        isActive: false,
        path: "/dashboard",
        title: "Dashboard",
      });

      // Check if we're on a dynamic route (the actual resolved route, not the pattern)
      const hasQueryParam = Object.keys(query).length > 0;
      const basePathSegments = pathSegments.filter(
        (segment) => !segment.includes("[") && !segment.includes("]")
      );

      // If this is a dynamic segment route, the base path will be one segment shorter than the full path
      const isLikelyDynamicRoute =
        basePathSegments.length < pathSegments.length;

      if (hasQueryParam && isLikelyDynamicRoute) {
        // Handle dynamic routes with query parameters
        const basePathKey = basePathSegments[basePathSegments.length - 1];
        const baseInfo =
          navigationStructure.dashboard.items[
            basePathKey as keyof typeof navigationStructure.dashboard.items
          ];

        if (baseInfo) {
          // Add parent section if applicable
          if (baseInfo.parent) {
            const parentSection =
              navigationStructure.dashboard.sections[baseInfo.parent];
            items.push({
              isActive: false,
              path: "#",
              title: parentSection.title,
            });
          }

          // Add the base route item
          items.push({
            isActive: false,
            path: baseInfo.path,
            title: baseInfo.title,
          });

          // Add dynamic path items with query parameter values
          if (baseInfo.dynamicPaths) {
            for (const param of baseInfo.dynamicPaths) {
              const paramValue = query[param.paramName];
              if (paramValue) {
                const displayValue = Array.isArray(paramValue)
                  ? paramValue[0]
                  : paramValue;
                items.push({
                  isActive: true,
                  path: router.asPath,
                  title: `${param.titlePrefix} ${displayValue}`,
                });
              }
            }
          }
        }
      } else {
        // Handle specific paths from the navigation structure for non-dynamic routes
        if (pathSegments.length > 1) {
          const lastSegment = pathSegments[pathSegments.length - 1];
          const pageInfo =
            navigationStructure.dashboard.items[
              lastSegment as keyof typeof navigationStructure.dashboard.items
            ];

          if (pageInfo) {
            // If the page has a parent section, add it to the breadcrumb
            if (pageInfo.parent) {
              const parentSection =
                navigationStructure.dashboard.sections[pageInfo.parent];
              items.push({
                isActive: false,
                path: "#",
                title: parentSection.title,
              });
            }

            // Add the current page
            items.push({
              isActive: true,
              path: pageInfo.path,
              title: pageInfo.title,
            });
          } else {
            // Fallback for paths not in the navigation structure
            const formattedTitle = lastSegment
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            items.push({
              isActive: true,
              path: pathname,
              title: formattedTitle,
            });
          }
        }
      }

      setBreadcrumbs(items);
    };

    // Only run when the router is ready to avoid SSR issues
    if (router.isReady) {
      generateBreadcrumbs();
    }
    // Execute the function on mount or route change
    generateBreadcrumbs();
  }, [pathname, query, navigationStructure, t, router.isReady, router.asPath]);

  if (breadcrumbs.length <= 1) {
    // Don't show breadcrumbs if there's only one item or none
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={`${item.path}-${index}`}>
            {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            <BreadcrumbItem className="hidden md:block">
              {item.isActive ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.path}>{item.title}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
