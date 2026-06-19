"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import Loading from "@/components/shared/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/context/user-context";
import useGetUserMenuDataQuery from "@/hooks/api/user-menu/useGetUserMenuDataQuery";
import useUpsertUserMenuDataMutation from "@/hooks/api/user-menu/useUpsertUserMenuDataMutation";
import { toastError } from "@/services";
import { MenuStatus, UserMenuItemType } from "@/types/user-menu";

interface UserMenuModalEditProps {
  accountOrganizationId?: string;
  firstName?: string;
  onClose: () => void;
  open: boolean;
}

const formatMenuName = (name: string): string =>
  name
    .replace(/^WEB_|^MOBILE_/, "")
    .split("_")
    .map((w, i) =>
      i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase(),
    )
    .join(" ");

const UserMenuModalEdit: React.FC<UserMenuModalEditProps> = ({
  accountOrganizationId,
  firstName,
  onClose,
  open,
}) => {
  const { t } = useTranslation(["user-menu"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [menuStatuses, setMenuStatuses] = useState<Record<string, boolean>>({});
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set()
  );

  const { data, isLoading } = useGetUserMenuDataQuery({
    accountOrganizationId: accountOrganizationId ?? "",
    enabled: open && !!accountOrganizationId,
    organizationId,
  });

  const { mutateAsync: upsertMenus, isPending } = useUpsertUserMenuDataMutation(
    {
      onSuccess: () => {
        toast.success(t("user-menu:toast.saved"));
        onClose();
      },
    }
  );

  const menus = useMemo(() => data?.data?.menus ?? [], [data]);

  useEffect(() => {
    if (menus.length > 0) {
      const statuses: Record<string, boolean> = {};
      const initStatuses = (items: UserMenuItemType[]) => {
        items.forEach((menu) => {
          statuses[menu.id] = menu.user_status === "ACTIVE";
          if (menu.children?.length > 0) initStatuses(menu.children);
        });
      };
      initStatuses(menus);
      setMenuStatuses(statuses);
      setExpandedParents(new Set());
    }
  }, [menus]);

  const getAllChildIds = (items: UserMenuItemType[]): string[] =>
    items.flatMap((item) => [item.id, ...getAllChildIds(item.children ?? [])]);

  const findParent = (
    items: UserMenuItemType[],
    childId: string
  ): UserMenuItemType | undefined => {
    for (const item of items) {
      if (item.children?.some((c) => c.id === childId)) return item;
      const found = findParent(item.children ?? [], childId);
      if (found) return found;
    }
    return undefined;
  };

  const handleToggle = (menuId: string, checked: boolean) => {
    setMenuStatuses((prev) => {
      const next = { ...prev, [menuId]: checked };

      // Find the toggled item in the tree
      const findItem = (items: UserMenuItemType[]): UserMenuItemType | undefined => {
        for (const item of items) {
          if (item.id === menuId) return item;
          const found = findItem(item.children ?? []);
          if (found) return found;
        }
        return undefined;
      };

      const toggled = findItem(menus);

      // Cascade down: if parent toggled, apply same to all descendants
      if (toggled?.children?.length) {
        getAllChildIds(toggled.children).forEach((id) => {
          next[id] = checked;
        });
      }

      // Cascade up: sync ancestors based on children state
      const syncParent = (childId: string) => {
        const parent = findParent(menus, childId);
        if (!parent) return;
        const allChildIds = getAllChildIds(parent.children ?? []);
        const anyEnabled = allChildIds.some((id) => next[id]);
        next[parent.id] = anyEnabled;
        syncParent(parent.id);
      };

      syncParent(menuId);

      return next;
    });
  };

  const toggleExpanded = (parentId: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!accountOrganizationId) return;

    try {
      await upsertMenus({
        accountOrganizationId,
        organizationId,
        params: {
          menu_statuses: Object.entries(menuStatuses).map(
            ([menu_id, isEnabled]) => ({
              menu_id,
              status: (isEnabled ? "ACTIVE" : "INACTIVE") as MenuStatus,
            })
          ),
        },
      });
    } catch (error) {
      toastError(error as Error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("user-menu:modal.edit.title")} - {firstName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <Loading className="min-h-[200px]" />
        ) : (
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
            {menus.map((parent) => {
              const children = parent.children ?? [];
              const isExpanded = expandedParents.has(parent.id);
              const isOrgDisabled = parent.organization_status !== "ACTIVE";

              return (
                <div key={parent.id} className="rounded-md border">
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatMenuName(parent.name)}</span>
                      {isOrgDisabled && (
                        <Badge className="text-xs" variant="destructive">
                          {t("user-menu:modal.edit.orgDisabled")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={menuStatuses[parent.id] ?? false}
                        onCheckedChange={(checked) =>
                          handleToggle(parent.id, checked)
                        }
                      />
                      {children.length > 0 ? (
                        <Button
                          className="h-6 w-6"
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleExpanded(parent.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      ) : (
                        <span className="h-6 w-6 shrink-0" />
                      )}
                    </div>
                  </div>

                  {isExpanded && children.length > 0 && (
                    <div className="border-t px-3 pb-3 pt-2 flex flex-col gap-2">
                      {children.map((child) => {
                        const isChildOrgDisabled =
                          child.organization_status !== "ACTIVE";
                        return (
                          <div
                            key={child.id}
                            className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{formatMenuName(child.name)}</span>
                              {isChildOrgDisabled && (
                                <Badge className="text-xs" variant="destructive">
                                  {t("user-menu:modal.edit.orgDisabled")}
                                </Badge>
                              )}
                            </div>
                            <Switch
                              checked={menuStatuses[child.id] ?? false}
                              onCheckedChange={(checked) =>
                                handleToggle(child.id, checked)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button disabled={isPending} variant="outline" onClick={onClose}>
            {t("user-menu:modal.edit.cancel")}
          </Button>
          <Button disabled={isPending || isLoading} onClick={handleSave}>
            {t("user-menu:modal.edit.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserMenuModalEdit;
