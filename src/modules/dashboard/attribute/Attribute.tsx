"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import { KEY_USE_GET_ATTRIBUTE_DATA } from "@/hooks/api/attribute/useGetAttributeDataQuery";
import { toastError } from "@/services";
import { updateAttributeDataService } from "@/services/attribute/updateAttributeDataService";
import {
  AttributeDirection,
  AttributeItemType,
  AttributeTypeEnum,
} from "@/types/attribute";

import AttributeHeader from "./AttributeHeader";
import AttributeItem from "./AttributeItem";
import AttributeModalAdd from "./AttributeModalAdd";
import { useAttribute } from "./useAttribute";

const Attribute = () => {
  const { t } = useTranslation(["attribute", "common"]);
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const { attributeData, isLoadingAttributeData, nextCursor, prevCursor, totalCount } = useAttribute();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const tableHeader = useMemo(
    () => [
      "",
      t("attribute:table.header.no"),
      t("attribute:table.header.name"),
      t("attribute:table.header.type"),
      t("attribute:table.header.direction"),
      t("attribute:table.header.description"),
      t("attribute:table.header.presets"),
      t("attribute:table.header.action"),
    ],
    [t]
  );
  const selectedCount = selectedIds.size;
  const allSelected =
    attributeData.length > 0 && selectedCount === attributeData.length;

  const onToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const onToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(attributeData.map((item) => item.id)));
      return;
    }
    setSelectedIds(new Set());
  };

  const handleBulkUpdateDirection = async (
    direction: AttributeDirection | null,
  ) => {
    if (!tokenPayload?.organization_id || selectedIds.size === 0) return;

    const selectedItems = attributeData.filter((item) => selectedIds.has(item.id));
    const invalidItems = selectedItems.filter((item) => {
      if (item.type === AttributeTypeEnum.REFERENCE_GROUP) {
        return !item.presets || item.presets.length !== 1;
      }
      if (
        item.type === AttributeTypeEnum.SELECT ||
        item.type === AttributeTypeEnum.CHECKBOX
      ) {
        return !item.presets || item.presets.length === 0;
      }
      return false;
    });

    if (invalidItems.length > 0) {
      toast.error(
        t(
          "attribute:bulkUpdatePresetRequired",
          "Some selected attributes require valid presets before updating direction",
        ),
      );
      return;
    }

    setIsBulkUpdating(true);
    const results = await Promise.allSettled(
      selectedItems.map((item) =>
        updateAttributeDataService({
          attributeId: item.id,
          data: {
            direction,
            name: item.name,
            presets:
              item.type === AttributeTypeEnum.REFERENCE_GROUP ||
              item.type === AttributeTypeEnum.SELECT ||
              item.type === AttributeTypeEnum.CHECKBOX
                ? (item.presets ?? undefined)
                : undefined,
            type: item.type,
          },
          organizationId: tokenPayload.organization_id,
        }),
      ),
    );
    setIsBulkUpdating(false);

    const failed = results.filter((r) => r.status === "rejected").length;
    const successCount = results.length - failed;
    if (failed > 0) {
      toastError((results.find((r) => r.status === "rejected") as PromiseRejectedResult).reason);
    }
    if (successCount > 0) {
      toast.success(
        t("attribute:updateSuccess", "Attribute updated successfully"),
      );
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_ATTRIBUTE_DATA(tokenPayload.organization_id),
      });
      await queryClient.refetchQueries({
        queryKey: KEY_USE_GET_ATTRIBUTE_DATA(tokenPayload.organization_id),
      });
    }
  };

  return (
    <div
      className={`flex w-full flex-col gap-4 ${attributeData.length === 0 ? "h-[calc(100vh-120px)]" : ""}`}
    >
      <div className="flex-shrink-0">
        <AttributeHeader
          nextCursor={nextCursor}
          prevCursor={prevCursor}
          totalCount={totalCount}
        />
      </div>

      <div
        className={`w-full max-w-[91vw] flex-1 lg:max-w-full ${attributeData.length === 0 ? "overflow-visible" : "overflow-x-auto"}`}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedCount} selected
          </span>
          <Button
            disabled={isBulkUpdating || selectedCount === 0}
            size="sm"
            variant="outline"
            onClick={() => handleBulkUpdateDirection("INBOUND")}
          >
            Set INBOUND
          </Button>
          <Button
            disabled={isBulkUpdating || selectedCount === 0}
            size="sm"
            variant="outline"
            onClick={() => handleBulkUpdateDirection("OUTBOUND")}
          >
            Set OUTBOUND
          </Button>
          <Button
            disabled={isBulkUpdating || selectedCount === 0}
            size="sm"
            variant="outline"
            onClick={() => handleBulkUpdateDirection(null)}
          >
            Clear
          </Button>
        </div>

        <Table className="rounded-md border shadow-md">
          <TableHeader>
            <TableRow>
              {tableHeader.map((header, index) => (
                <TableHead key={`${header}-${index}`}>
                  {index === 0 ? (
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) =>
                        onToggleSelectAll(checked === true)
                      }
                    />
                  ) : (
                    header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoadingAttributeData &&
              attributeData.length > 0 &&
              attributeData.map((item: AttributeItemType, index: number) => (
                <AttributeItem
                  key={item.id}
                  item={item}
                  num={index + 1}
                  selected={selectedIds.has(item.id)}
                  onToggleSelect={onToggleSelect}
                />
              ))}
          </TableBody>
        </Table>

        {isLoadingAttributeData ? (
          <Loading className="min-h-[50vh]" />
        ) : (
          attributeData.length === 0 && (
            <EmptyState
              action={<AttributeModalAdd attributeId="" type="create" />}
              className="mt-4"
              description={t("attribute:empty.description")}
              title={t("attribute:empty.title")}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Attribute;
