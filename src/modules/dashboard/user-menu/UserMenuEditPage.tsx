"use client";

import { ArrowLeft, ChevronDown, ChevronRight, Mail } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import Loading from "@/components/shared/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/context/user-context";
import useGetUserMenuDataQuery from "@/hooks/api/user-menu/useGetUserMenuDataQuery";
import useUpsertUserMenuDataMutation from "@/hooks/api/user-menu/useUpsertUserMenuDataMutation";
import { toastError } from "@/services";
import { MenuStatus, UserMenuItemType } from "@/types/user-menu";

const formatMenuName = (name: string): string =>
  name
    .replace(/^WEB_|^MOBILE_/, "")
    .split("_")
    .map((w, i) =>
      i === 0
        ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        : w.toLowerCase(),
    )
    .join(" ");

const countDirectChildren = (
  children: UserMenuItemType[],
  statuses: Record<string, boolean>,
) => ({
  enabled: children.filter((c) => statuses[c.id]).length,
  total: children.length,
});

const getAllIds = (items: UserMenuItemType[]): string[] =>
  items.flatMap((item) => [item.id, ...getAllIds(item.children ?? [])]);

interface MenuNodeProps {
  depth: number;
  item: UserMenuItemType;
  menuStatuses: Record<string, boolean>;
  onToggle: (id: string, val: boolean) => void;
}

const MenuNode = ({ depth, item, menuStatuses, onToggle }: MenuNodeProps) => {
  const { t } = useTranslation("user-menu");
  const [isExpanded, setIsExpanded] = useState(false);
  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const isEnabled = menuStatuses[item.id] ?? false;
  const isOrgDisabled = item.organization_status !== "ACTIVE";
  const { enabled, total } = countDirectChildren(children, menuStatuses);

  return (
    <div>
      <div
        className="flex items-center justify-between rounded-lg py-2.5 pr-3 transition-colors hover:bg-muted/40"
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <button
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground ${
              hasChildren ? "hover:bg-muted" : "pointer-events-none"
            }`}
            onClick={() => hasChildren && setIsExpanded((v) => !v)}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
            )}
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm text-foreground/90">
              {formatMenuName(item.name)}
            </p>
            {hasChildren && (
              <p
                className={`text-[10px] ${
                  enabled === total
                    ? "text-green-600"
                    : enabled > 0
                      ? "text-amber-500"
                      : "text-muted-foreground"
                }`}
              >
                {enabled}/{total} {t("status.allowed")}
              </p>
            )}
          </div>
          {isOrgDisabled && (
            <Badge className="shrink-0 text-[10px]" variant="secondary">
              {t("modal.edit.orgDisabled")}
            </Badge>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`text-[11px] font-medium ${isEnabled ? "text-green-600" : "text-red-400"}`}
          >
            {isEnabled ? t("status.allowed") : t("status.forbidden")}
          </span>
          <Switch
            checked={isEnabled}
            onCheckedChange={(val) => onToggle(item.id, val)}
          />
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div className="ml-6 border-l border-muted">
          {children.map((child) => (
            <MenuNode
              key={child.id}
              depth={depth + 1}
              item={child}
              menuStatuses={menuStatuses}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ParentMenuCardProps {
  menu: UserMenuItemType;
  menuStatuses: Record<string, boolean>;
  onToggle: (id: string, val: boolean) => void;
}

const ParentMenuCard = ({ menu, menuStatuses, onToggle }: ParentMenuCardProps) => {
  const { t } = useTranslation("user-menu");
  const [isExpanded, setIsExpanded] = useState(false);
  const children = menu.children ?? [];
  const hasChildren = children.length > 0;
  const isEnabled = menuStatuses[menu.id] ?? false;
  const isOrgDisabled = menu.organization_status !== "ACTIVE";
  const { enabled, total } = countDirectChildren(children, menuStatuses);
  const initial = formatMenuName(menu.name).charAt(0).toUpperCase();

  return (
    <Card
      className={`overflow-hidden transition-all ${
        isEnabled ? "border-primary/20" : "border-border/60 opacity-75"
      }`}
    >
      <CardContent className="p-0">
        <div
          className={`flex items-center gap-3 p-4 ${hasChildren ? "cursor-pointer hover:bg-muted/30" : ""}`}
          onClick={() => hasChildren && setIsExpanded((v) => !v)}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
              isEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold leading-tight">
              {formatMenuName(menu.name)}
            </p>
            {hasChildren ? (
              <p
                className={`mt-0.5 text-xs ${
                  enabled === total
                    ? "text-green-600"
                    : enabled > 0
                      ? "text-amber-500"
                      : "text-muted-foreground"
                }`}
              >
                {enabled}/{total} {t("status.allowed")}
              </p>
            ) : (
              <p
                className={`mt-0.5 text-xs font-medium ${isEnabled ? "text-green-600" : "text-red-400"}`}
              >
                {isEnabled ? t("status.allowed") : t("status.forbidden")}
              </p>
            )}
          </div>
          {isOrgDisabled && (
            <Badge className="text-[10px]" variant="destructive">
              {t("modal.edit.orgDisabled")}
            </Badge>
          )}
          <div
            className="flex shrink-0 items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {hasChildren && (
              <span
                className={`text-[11px] font-medium ${isEnabled ? "text-green-600" : "text-red-400"}`}
              >
                {isEnabled ? t("status.allowed") : t("status.forbidden")}
              </span>
            )}
            <Switch
              checked={isEnabled}
              onCheckedChange={(val) => onToggle(menu.id, val)}
            />
          </div>
          {hasChildren && (
            <span className="shrink-0 text-muted-foreground">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          )}
        </div>

        {isExpanded && hasChildren && (
          <>
            <Separator />
            <div className="py-2">
              {children.map((child) => (
                <MenuNode
                  key={child.id}
                  depth={0}
                  item={child}
                  menuStatuses={menuStatuses}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

interface UserMenuEditPageProps {
  accountOrganizationId: string;
}

const UserMenuEditPage = ({ accountOrganizationId }: UserMenuEditPageProps) => {
  const { t } = useTranslation("user-menu");
  const router = useRouter();
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [menuStatuses, setMenuStatuses] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useGetUserMenuDataQuery({
    accountOrganizationId,
    enabled: !!accountOrganizationId,
    organizationId,
  });

  const { mutateAsync: upsertMenus, isPending } = useUpsertUserMenuDataMutation({
    onSuccess: () => {
      toast.success(t("toast.saved"));
      router.push("/dashboard/user-menu");
    },
  });

  const menus = useMemo(() => data?.data?.menus ?? [], [data]);
  const user = data?.data?.account_organization;

  useEffect(() => {
    if (menus.length === 0) return;
    const statuses: Record<string, boolean> = {};
    const init = (items: UserMenuItemType[]) => {
      items.forEach((m) => {
        statuses[m.id] = m.user_status === "ACTIVE";
        init(m.children ?? []);
      });
    };
    init(menus);
    setMenuStatuses(statuses);
  }, [menus]);

  const findParent = (
    items: UserMenuItemType[],
    childId: string,
  ): UserMenuItemType | undefined => {
    for (const item of items) {
      if (item.children?.some((c) => c.id === childId)) return item;
      const found = findParent(item.children ?? [], childId);
      if (found) return found;
    }
  };

  const handleToggle = (menuId: string, checked: boolean) => {
    setMenuStatuses((prev) => {
      const next = { ...prev, [menuId]: checked };
      const findItem = (items: UserMenuItemType[]): UserMenuItemType | undefined => {
        for (const item of items) {
          if (item.id === menuId) return item;
          const f = findItem(item.children ?? []);
          if (f) return f;
        }
      };
      const toggled = findItem(menus);
      if (toggled?.children?.length) {
        getAllIds(toggled.children).forEach((id) => {
          next[id] = checked;
        });
      }
      const syncParent = (childId: string) => {
        const parent = findParent(menus, childId);
        if (!parent) return;
        const anyEnabled = getAllIds(parent.children ?? []).some((id) => next[id]);
        next[parent.id] = anyEnabled;
        syncParent(parent.id);
      };
      syncParent(menuId);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await upsertMenus({
        accountOrganizationId,
        organizationId,
        params: {
          menu_statuses: Object.entries(menuStatuses).map(
            ([menu_id, isEnabled]) => ({
              menu_id,
              status: (isEnabled ? "ACTIVE" : "INACTIVE") as MenuStatus,
            }),
          ),
        },
      });
    } catch (err) {
      toastError(err as Error);
    }
  };

  const allIds = useMemo(() => getAllIds(menus), [menus]);
  const totalEnabled = allIds.filter((id) => menuStatuses[id]).length;
  const initials = user
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : "??";

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <button
            className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => router.push("/dashboard/user-menu")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("backToList")}
          </button>
          <h1 className="text-2xl font-bold font-heading">{t("editPage.title")}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            disabled={isPending}
            variant="outline"
            onClick={() => router.push("/dashboard/user-menu")}
          >
            {t("modal.edit.cancel")}
          </Button>
          <Button disabled={isPending || isLoading} onClick={handleSave}>
            {isPending ? t("editPage.saving") : t("modal.edit.save")}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Loading className="min-h-[400px]" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                    <Mail className="h-3 w-3 shrink-0" />
                    {user?.email}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col justify-center gap-1 p-4">
                <p className="text-xs text-muted-foreground">
                  {t("editPage.statsLabel")}
                </p>
                <p className="text-2xl font-bold font-heading tabular-nums">
                  {totalEnabled}
                  <span className="text-lg font-normal text-muted-foreground">
                    {" "}
                    / {allIds.length}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("editPage.menusAllowed")}
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("editPage.permissionsLabel")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {menus.map((menu) => (
                <ParentMenuCard
                  key={menu.id}
                  menu={menu}
                  menuStatuses={menuStatuses}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenuEditPage;
