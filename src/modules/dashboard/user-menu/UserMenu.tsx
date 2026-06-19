"use client";

import { Check, Pencil, X } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import PaginationCursor from "@/components/shared/PaginationCursor";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useGetRoleDataQuery from "@/hooks/api/role/useGetRoleDataQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import useGetAllUserMenuDataQuery from "@/hooks/api/user-menu/useGetAllUserMenuDataQuery";
import {
  UserMenuListItemMenuType,
  UserMenuListItemType,
} from "@/types/user-menu";

import { useUserMenuStore } from "./store";

const hasAnyChildDisabled = (children: UserMenuListItemMenuType[]): boolean => {
  if (!children?.length) return false;
  return children.some(
    (child) => !child.is_enabled || hasAnyChildDisabled(child.children ?? []),
  );
};

const StatusIcon = ({
  enabled,
  partial = false,
}: {
  enabled: boolean;
  partial?: boolean;
}) => {
  if (!enabled)
    return <X className="h-3.5 w-3.5 shrink-0 text-red-400" strokeWidth={3} />;
  if (partial)
    return <Check className="h-3.5 w-3.5 shrink-0 text-amber-400" strokeWidth={3} />;
  return <Check className="h-3.5 w-3.5 shrink-0 text-green-600" strokeWidth={3} />;
};

const CELL = "py-1 px-2 !text-center align-middle";
const HEAD = "py-2 px-2 !text-center text-xs font-semibold text-muted-foreground";

const UserMenu = () => {
  const { t } = useTranslation(["user-menu", "common"]);
  const router = useRouter();
  const { hasMultipleStores, stores: userStores, tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const currentCursor = useUserMenuStore((state) => state.currentCursor);
  const currentPage = useUserMenuStore((state) => state.currentPage);
  const goToNextPage = useUserMenuStore((state) => state.goToNextPage);
  const goToPrevPage = useUserMenuStore((state) => state.goToPrevPage);
  const hasNextPage = useUserMenuStore((state) => state.hasNextPage);
  const hasPrevPage = useUserMenuStore((state) => state.hasPrevPage);
  const itemLimit = useUserMenuStore((state) => state.itemLimit);
  const resetPagination = useUserMenuStore((state) => state.resetPagination);
  const setHasNextPage = useUserMenuStore((state) => state.setHasNextPage);
  const setHasPrevPage = useUserMenuStore((state) => state.setHasPrevPage);
  const setNextCursor = useUserMenuStore((state) => state.setNextCursor);
  const setPrevCursor = useUserMenuStore((state) => state.setPrevCursor);

  const selectedStoreId = (router.query.store_id as string) ?? "all";
  const selectedRoleName = (router.query.role_name as string) ?? "all";

  // Auto-select the only store when user has exactly one
  useEffect(() => {
    if (!hasMultipleStores && userStores.length === 1) {
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, store_id: userStores[0].id },
        },
        undefined,
        { shallow: true },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMultipleStores, userStores.length]);

  const apiFilters = {
    cursor: currentCursor,
    limit: itemLimit,
    ...(selectedRoleName !== "all" ? { role_name: selectedRoleName } : {}),
    ...(selectedStoreId !== "all" ? { store_id: selectedStoreId } : {}),
  };

  const { data, isLoading } = useGetAllUserMenuDataQuery({
    filters: apiFilters,
    organizationId,
  });

  const { data: storeData } = useGetStoreDataQuery({ organizationId });
  const stores = storeData?.data?.stores ?? [];

  const { data: roleData } = useGetRoleDataQuery({ organizationId });
  const roles = roleData?.data?.roles ?? [];

  const users = useMemo(
    () => data?.data?.account_organizations ?? [],
    [data],
  );

  useEffect(() => {
    const next = data?.pagination?.next_cursor ?? null;
    const prev = data?.pagination?.prev_cursor ?? null;
    setNextCursor(next);
    setPrevCursor(prev);
    setHasNextPage(Boolean(next));
    setHasPrevPage(Boolean(prev) || currentPage > 1);
  }, [
    currentPage,
    data?.pagination?.next_cursor,
    data?.pagination?.prev_cursor,
    setHasNextPage,
    setHasPrevPage,
    setNextCursor,
    setPrevCursor,
  ]);

  const parentMenus = useMemo((): UserMenuListItemMenuType[] => {
    const map = new Map<string, UserMenuListItemMenuType>();
    users.forEach((user) =>
      user.menus.forEach((menu) => {
        if (!map.has(menu.id)) map.set(menu.id, menu);
      }),
    );
    return Array.from(map.values());
  }, [users]);

  const formatMenuName = (name: string): string =>
    name
      .replace(/^WEB_|^MOBILE_/, "")
      .split("_")
      .map((w, i) =>
        i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase(),
      )
      .join(" ");

  const getMenuLabel = (name: string): string => {
    const key = `common:sidebar.${name.replace(/^WEB_|^MOBILE_/, "").toLowerCase()}`;
    return (t as unknown as (k: string, opts: Record<string, unknown>) => string)(key, {
      defaultValue: formatMenuName(name),
    });
  };

  const renderChildren = (
    children: UserMenuListItemMenuType[],
    depth = 0,
  ): React.ReactNode =>
    children.map((child) => (
      <div key={child.id}>
        <div
          className="flex items-center gap-1.5 py-0.5"
          style={{ paddingLeft: depth * 10 + 4 }}
        >
          <StatusIcon enabled={child.is_enabled} />
          <span className="truncate text-[11px] text-foreground/70">
            {getMenuLabel(child.name)}
          </span>
        </div>
        {child.children?.length > 0 && renderChildren(child.children, depth + 1)}
      </div>
    ));

  const renderMenuCell = (
    menu: UserMenuListItemMenuType | undefined,
    key: string,
  ) => {
    if (!menu) {
      return (
        <TableCell key={key} className={CELL}>
          <div className="flex justify-center">
            <span className="text-xs text-muted-foreground/40">—</span>
          </div>
        </TableCell>
      );
    }

    const isPartial = menu.is_enabled && hasAnyChildDisabled(menu.children ?? []);

    if (!menu.children?.length) {
      return (
        <TableCell key={key} className={CELL}>
          <div className="flex justify-center">
            <StatusIcon enabled={menu.is_enabled} partial={isPartial} />
          </div>
        </TableCell>
      );
    }

    return (
      <TableCell key={key} className={CELL}>
        <div className="flex justify-center">
        <HoverCard closeDelay={50} openDelay={100}>
          <HoverCardTrigger asChild>
            <span className="inline-flex cursor-help items-center rounded border border-dashed border-current/20 px-1 py-0.5 transition-colors hover:bg-muted/50">
              <StatusIcon enabled={menu.is_enabled} partial={isPartial} />
            </span>
          </HoverCardTrigger>
          <HoverCardContent
            align="center"
            className="w-auto min-w-[172px] p-0"
            side="bottom"
          >
            <div className="px-3 py-2">
              <p className="mb-1.5 text-[10px] font-semibold text-muted-foreground">
                {getMenuLabel(menu.name)}
              </p>
              <div className="space-y-0.5">
                {renderChildren(menu.children)}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        </div>
      </TableCell>
    );
  };

  const handleStoreChange = (value: string) => {
    const query = { ...router.query };
    if (value === "all") delete query.store_id;
    else query.store_id = value;
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
    resetPagination();
  };

  const handleRoleChange = (value: string) => {
    const query = { ...router.query };
    if (value === "all") delete query.role_name;
    else query.role_name = value;
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
    resetPagination();
  };

  return (
    <div
      className={`flex flex-col gap-3 ${users.length === 0 ? "h-[calc(100vh-120px)]" : ""}`}
    >
      <div className="flex flex-col lg:flex-row gap-2 mt-4">
        <Select value={selectedStoreId} onValueChange={handleStoreChange}>
          <SelectTrigger className="lg:max-w-[200px]">
            <SelectValue placeholder="All Stores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedRoleName} onValueChange={handleRoleChange}>
          <SelectTrigger className="lg:max-w-[200px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.name}>
                {role.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 shrink-0 text-green-600" strokeWidth={3} />
          {t("user-menu:table.legend.fullyEnabled")}
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 shrink-0 text-amber-400" strokeWidth={3} />
          {t("user-menu:table.legend.partialEnabled")}
        </span>
        <span className="flex items-center gap-1.5">
          <X className="h-3.5 w-3.5 shrink-0 text-red-400" strokeWidth={3} />
          {t("user-menu:table.legend.disabled")}
        </span>
        <span className="ml-auto italic text-muted-foreground/60">
          {t("user-menu:table.legend.hoverHint")}
        </span>
      </div>
      <div className="flex justify-end">
        <PaginationCursor
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          limit={itemLimit}
          onNext={goToNextPage}
          onPrev={goToPrevPage}
        />
      </div>
      <div className="w-full max-w-[91vw] lg:max-w-full flex-1 overflow-x-auto rounded-lg border border-border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
              {/* Fixed info columns */}
              <TableHead className={`sticky left-0 z-10 w-10 bg-muted/50 ${HEAD} after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border`}>
                {t("user-menu:table.header.no")}
              </TableHead>
              <TableHead className={`sticky left-10 z-10 min-w-[150px] bg-muted/50 ${HEAD} after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border`}>
                {t("user-menu:table.header.name")}
              </TableHead>
              <TableHead className={`min-w-[100px] bg-muted/50 ${HEAD}`}>
                {t("user-menu:table.header.stores")}
              </TableHead>
              <TableHead className={`min-w-[100px] bg-muted/50 ${HEAD}`}>
                {t("user-menu:table.header.phone")}
              </TableHead>
              <TableHead className={`min-w-[130px] bg-muted/50 ${HEAD} border-r border-border`}>
                {t("user-menu:table.header.role")}
              </TableHead>
              {/* Menu access columns — distinct background */}
              {parentMenus.map((menu) => (
                <TableHead
                  key={menu.id}
                  className={`min-w-[88px] whitespace-nowrap bg-blue-50/60 ${HEAD} text-blue-600/70`}
                >
                  {getMenuLabel(menu.name)}
                </TableHead>
              ))}
              <TableHead className={`sticky right-0 z-10 bg-muted/50 ${HEAD} before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-border`}>
                {t("user-menu:table.header.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!isLoading &&
              users.length > 0 &&
              users.map((user: UserMenuListItemType, index: number) => (
                <TableRow
                  key={user.id}
                  className="text-xs border-b border-border hover:bg-muted/40 transition-colors"
                >
                  <TableCell className={`sticky left-0 z-10 w-10 bg-background text-muted-foreground ${CELL} after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border`}>
                    {(currentPage - 1) * itemLimit + index + 1}
                  </TableCell>
                  <TableCell className={`sticky left-10 z-10 min-w-[150px] bg-background font-medium text-foreground/80 ${CELL} after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border`}>
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell className={`min-w-[100px] text-muted-foreground ${CELL}`}>
                    {user.stores?.length
                      ? user.stores.map((s) => s.name).join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell className={`text-muted-foreground ${CELL}`}>
                    {user.phone ?? "—"}
                  </TableCell>
                  <TableCell className={`text-muted-foreground border-r border-border ${CELL}`}>
                    {user.role_name ?? "—"}
                  </TableCell>
                  {parentMenus.map((parentMenu) =>
                    renderMenuCell(
                      user.menus.find((m) => m.id === parentMenu.id),
                      `${user.id}-${parentMenu.id}`,
                    ),
                  )}
                  <TableCell className={`sticky right-0 z-10 bg-background ${CELL} before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-border`}>
                    <Button
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/dashboard/user-menu/edit?accountOrganizationId=${user.id}`)
                      }
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {isLoading ? (
          <Loading className="min-h-[50vh]" />
        ) : (
          users.length === 0 && (
            <EmptyState
              className="mt-4"
              description={t("user-menu:empty.description")}
              title={t("user-menu:empty.title")}
            />
          )
        )}
      </div>
    </div>
  );
};

export default UserMenu;
