"use client";

import { Info } from "lucide-react";
import { useTranslation } from "next-i18next";
import {useMemo } from "react";

import EmptyState from "@/components/shared/EmptyState";
import SkeletonTable from "@/components/shared/SkeletonTable";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/context/user-context";
import { useColumnVisibility } from "@/hooks/useColumnVisibility";
import { InventoryItem as InventoryItemType } from "@/types/inventory";

import InventoryHeader from "./InventoryHeader";
import InventoryItem from "./InventoryItem";
import { useInventoryStore } from "./store/InventoryStore";
import { useInventory } from "./useInventory";
import { extractCommonInventoryAttributes, formatAttributeName } from "./utils";

// Column IDs for inventory
const COLUMN_ID_NO = "no";
const COLUMN_ID_PRODUCT_NAME = "productName";
const COLUMN_ID_INTERNAL_CODE = "internalCode";
const COLUMN_ID_STORE = "store";
const COLUMN_ID_CATEGORY = "category";
const COLUMN_ID_AMOUNT = "amount";
const COLUMN_ID_AGING = "aging";
const COLUMN_ID_ACTION = "action";

const Inventory = () => {
  const { t } = useTranslation("inventory");
  const { inventoryData, isLoadingInventoryData } = useInventory();
  const { tokenPayload } = useUser();

  // Use Zustand store - get primitive values to avoid re-render loops
  const currentPage = useInventoryStore((state) => state.currentPage);
  const itemsPerPage = useInventoryStore((state) => state.itemLimit);
  const selectedStoreId = useInventoryStore((state) => state.selectedStoreId);

  // Extract common attributes for dynamic columns
  const commonAttributes = useMemo(
    () => extractCommonInventoryAttributes(inventoryData, tokenPayload?.organization_id),
    [inventoryData, tokenPayload?.organization_id]
  );

  // Define all columns for column visibility
  const allColumns = useMemo(() => {
    const staticColumns = [
      { id: COLUMN_ID_NO, label: t("table.header.no") },
      { id: COLUMN_ID_PRODUCT_NAME, label: t("table.header.productName") },
      { id: COLUMN_ID_INTERNAL_CODE, label: t("table.header.internalCode") },
      { id: COLUMN_ID_STORE, label: t("table.header.store") },
      { id: COLUMN_ID_CATEGORY, label: t("table.header.category") },
      { id: COLUMN_ID_AMOUNT, label: t("table.header.amount") },
      { id: COLUMN_ID_AGING, label: t("table.header.aging") },
      { id: COLUMN_ID_ACTION, label: t("table.header.action") },
    ];

    const dynamicColumns = commonAttributes.map((attr) => ({
      id: `attr-${attr.id}`,
      label: formatAttributeName(attr.name),
    }));

    return [...staticColumns, ...dynamicColumns];
  }, [t, commonAttributes]);

  // Use column visibility hook
  const {
    isColumnVisible,
    isInitialized,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    visibleColumns,
  } = useColumnVisibility("inventory", allColumns);

  return (
    <div
      className={`flex w-full gap-4 flex-col ${inventoryData.length === 0 ? "h-[calc(100vh-120px)]" : ""}`}
    >
      <div className="mt-4 flex-shrink-0">
        <InventoryHeader
          allColumns={allColumns}
          visibleColumnIds={visibleColumns}
          onHideAll={hideAllColumns}
          onShowAll={showAllColumns}
          onToggleColumn={toggleColumn}
        />
      </div>

      <div
        className={`w-full max-w-[91vw] lg:max-w-full flex-1 ${inventoryData.length === 0 ? "overflow-visible" : "overflow-x-auto"}`}
      >
        {isInitialized && (
          <Table className="border shadow-md rounded-md">
            <TableHeader>
              <TableRow>
                {isColumnVisible(COLUMN_ID_NO) && (
                  <TableHead key={COLUMN_ID_NO}>{t("table.header.no")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_PRODUCT_NAME) && (
                  <TableHead key={COLUMN_ID_PRODUCT_NAME}>{t("table.header.productName")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_INTERNAL_CODE) && (
                  <TableHead key={COLUMN_ID_INTERNAL_CODE}>{t("table.header.internalCode")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_STORE) && (
                  <TableHead key={COLUMN_ID_STORE}>{t("table.header.store")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_CATEGORY) && (
                  <TableHead key={COLUMN_ID_CATEGORY}>{t("table.header.category")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_AMOUNT) && (
                  <TableHead key={COLUMN_ID_AMOUNT}>{t("table.header.amount")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_AGING) && (
                  <TableHead key={COLUMN_ID_AGING}>
                    <div className="flex items-center gap-1">
                      {t("table.header.aging")}
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              aria-label={t("table.header.agingTooltip")}
                              className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                              type="button"
                            >
                              <Info aria-hidden className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{t("table.header.agingTooltip")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableHead>
                )}
                {isColumnVisible(COLUMN_ID_ACTION) && (
                  <TableHead key={COLUMN_ID_ACTION}>{t("table.header.action")}</TableHead>
                )}
                {/* Dynamic attribute columns */}
                {commonAttributes.map((attribute) => {
                  const columnId = `attr-${attribute.id}`;
                  return isColumnVisible(columnId) ? (
                    <TableHead key={attribute.id} className="w-fit whitespace-nowrap">
                      {formatAttributeName(attribute.name)}
                    </TableHead>
                  ) : null;
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {!isLoadingInventoryData &&
                inventoryData.length > 0 &&
                inventoryData.map((item: InventoryItemType, index: number) => (
                  <InventoryItem
                    key={item.id}
                    commonAttributes={commonAttributes}
                    isColumnVisible={isColumnVisible}
                    item={item}
                    num={currentPage * itemsPerPage + index + 1 - itemsPerPage}
                    selectedStoreId={selectedStoreId}
                  />
                ))}
            </TableBody>
          </Table>
        )}

        {isLoadingInventoryData ? (
          <SkeletonTable columns={8} />
        ) : (
          inventoryData.length === 0 && (
            <EmptyState
              className="mt-4"
              description={t("empty.description")}
              title={t("empty.title")}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Inventory;
