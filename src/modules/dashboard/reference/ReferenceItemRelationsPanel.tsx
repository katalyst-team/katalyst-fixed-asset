"use client";

import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import useCreateReferenceItemRelationMutation from "@/hooks/api/reference/useCreateReferenceItemRelationMutation";
import useDeleteReferenceItemRelationMutation from "@/hooks/api/reference/useDeleteReferenceItemRelationMutation";
import useGetReferenceGroupsQuery from "@/hooks/api/reference/useGetReferenceGroupsQuery";
import useGetReferenceItemRelationsQuery from "@/hooks/api/reference/useGetReferenceItemRelationsQuery";
import useGetReferenceItemsQuery from "@/hooks/api/reference/useGetReferenceItemsQuery";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { toastError } from "@/services";
import { ReferenceItemType } from "@/types/reference";

interface ReferenceItemRelationsPanelProps {
  groupId: string;
  item: ReferenceItemType;
}

const ReferenceItemRelationsPanel = ({
  groupId,
  item,
}: ReferenceItemRelationsPanelProps) => {
  const { t } = useTranslation(["reference", "common"]);
  const { tokenPayload } = useUser();
  const { canCreate, canDelete } = usePermissions();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [modalOpen, setModalOpen] = useState(false);
  const [groupPopoverOpen, setGroupPopoverOpen] = useState(false);
  const [itemPopoverOpen, setItemPopoverOpen] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState("");
  const [targetItemId, setTargetItemId] = useState("");
  const [relationType, setRelationType] = useState("belongs_to");

  const { data: relationsData, isLoading: isLoadingRelations } =
    useGetReferenceItemRelationsQuery({ groupId, itemId: item.id, organizationId });

  const { data: groupsData } = useGetReferenceGroupsQuery({ organizationId });

  const { data: targetItemsData } = useGetReferenceItemsQuery({
    enabled: Boolean(targetGroupId),
    groupId: targetGroupId,
    limit: 500,
    organizationId,
  });

  const { isPending: isCreating, mutate: createRelation } =
    useCreateReferenceItemRelationMutation({ groupId, itemId: item.id, organizationId });

  const { isPending: isDeleting, mutate: deleteRelation } =
    useDeleteReferenceItemRelationMutation({ groupId, itemId: item.id, organizationId });

  const relations = relationsData?.data?.relations ?? [];
  const allGroups = groupsData?.data?.groups ?? [];
  const allTargetItems = targetItemsData?.data?.items ?? [];

  const groupOptions = allGroups.map((g) => ({ label: g.name, value: g.id }));
  const itemOptions = allTargetItems.map((i) => ({
    label: i.code ? `${i.name} (${i.code})` : i.name,
    value: i.id,
  }));

  const selectedGroupLabel = groupOptions.find((g) => g.value === targetGroupId)?.label;
  const selectedItemLabel = itemOptions.find((i) => i.value === targetItemId)?.label;

  const handleGroupSelect = (value: string) => {
    setTargetGroupId(value === targetGroupId ? "" : value);
    setTargetItemId("");
    setGroupPopoverOpen(false);
  };

  const handleItemSelect = (value: string) => {
    setTargetItemId(value === targetItemId ? "" : value);
    setItemPopoverOpen(false);
  };

  const handleAdd = () => {
    if (!targetItemId || !relationType.trim()) return;
    createRelation(
      { relation_type: relationType.trim(), to_item_id: targetItemId },
      {
        onError: (err) => toastError(err),
        onSuccess: () => {
          toast.success(t("reference:relation.createSuccess", "Relation added"));
          setModalOpen(false);
          setTargetGroupId("");
          setTargetItemId("");
          setRelationType("belongs_to");
        },
      }
    );
  };

  const handleDelete = (relationId: string) => {
    deleteRelation(relationId, {
      onError: (err) => toastError(err),
      onSuccess: () =>
        toast.success(t("reference:relation.deleteSuccess", "Relation removed")),
    });
  };

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setTargetGroupId("");
      setTargetItemId("");
      setRelationType("belongs_to");
      setGroupPopoverOpen(false);
      setItemPopoverOpen(false);
    }
  };

  return (
    <div className="p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {t("reference:relation.existing", "Relations")}
          {relations.length > 0 && (
            <Badge className="ml-2" variant="secondary">
              {relations.length}
            </Badge>
          )}
        </p>

        {canCreate && (
          <Dialog open={modalOpen} onOpenChange={handleModalOpenChange}>
            <DialogTrigger asChild>
              <Button className="h-8 gap-1.5 text-xs" size="sm">
                <Plus className="h-3.5 w-3.5" />
                {t("reference:relation.add", "Add Relation")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {t("reference:relation.add", "Add Relation")}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Target Group Combobox */}
                <div className="space-y-1.5">
                  <Label className="text-sm">
                    {t("reference:relation.targetGroup", "Target Group")}
                  </Label>
                  <Popover open={groupPopoverOpen} onOpenChange={setGroupPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        aria-expanded={groupPopoverOpen}
                        className="w-full justify-between"
                        role="combobox"
                        variant="outline"
                      >
                        {selectedGroupLabel ??
                          t("reference:relation.selectGroup", "Select group...")}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popper-anchor-width)] p-0"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <Command>
                        <CommandInput
                          placeholder={t("common:search", "Search...")}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {t("reference:relation.noItems", "No items found")}
                          </CommandEmpty>
                          <CommandGroup>
                            {groupOptions.map((opt) => (
                              <CommandItem
                                key={opt.value}
                                value={opt.label}
                                onSelect={() => handleGroupSelect(opt.value)}
                              >
                                {opt.label}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    targetGroupId === opt.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Target Item Combobox */}
                <div className="space-y-1.5">
                  <Label className="text-sm">
                    {t("reference:relation.targetItem", "Target Item")}
                  </Label>
                  <Popover open={itemPopoverOpen} onOpenChange={setItemPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        aria-expanded={itemPopoverOpen}
                        className="w-full justify-between"
                        disabled={!targetGroupId}
                        role="combobox"
                        variant="outline"
                      >
                        {selectedItemLabel ??
                          (targetGroupId
                            ? t("reference:relation.selectItem", "Select item...")
                            : t("reference:relation.selectGroupFirst", "Select a group first"))}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popper-anchor-width)] p-0"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <Command>
                        <CommandInput
                          placeholder={t("common:search", "Search...")}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {t("reference:relation.noItems", "No items found")}
                          </CommandEmpty>
                          <CommandGroup>
                            {itemOptions.map((opt) => (
                              <CommandItem
                                key={opt.value}
                                value={opt.label}
                                onSelect={() => handleItemSelect(opt.value)}
                              >
                                {opt.label}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    targetItemId === opt.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Relation Type */}
                <div className="space-y-1.5">
                  <Label className="text-sm">
                    {t("reference:relation.type", "Relation Type")}
                  </Label>
                  <Select value={relationType} onValueChange={setRelationType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="belongs_to">
                        {t("reference:relation.typeBelongsTo", "Belongs To")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleModalOpenChange(false)}
                >
                  {t("common:cancel", "Cancel")}
                </Button>
                <Button
                  disabled={isCreating || !targetItemId || !relationType.trim()}
                  onClick={handleAdd}
                >
                  {isCreating
                    ? t("common:saving", "Saving...")
                    : t("reference:relation.addButton", "Add Relation")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Relations list */}
      {isLoadingRelations ? (
        <p className="text-sm text-muted-foreground">
          {t("common:loading", "Loading...")}
        </p>
      ) : relations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("reference:relation.empty", "No relations yet.")}
        </p>
      ) : (
        <div className="space-y-2">
          {relations.map((rel) => (
            <div
              key={rel.id}
              className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                <Badge className="shrink-0 text-xs" variant="outline">
                  {rel.relation_type === "belongs_to"
                    ? t("reference:relation.typeBelongsTo", "Belongs To")
                    : rel.relation_type}
                </Badge>
                <span className="text-muted-foreground">→</span>
                <span className="truncate font-medium">
                  {rel.to_item?.name ?? rel.to_item_id}
                </span>
                {rel.to_item?.code && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    ({rel.to_item.code})
                  </span>
                )}
              </div>
              {canDelete && (
                <Button
                  className="ml-2 h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                  disabled={isDeleting}
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(rel.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReferenceItemRelationsPanel;
