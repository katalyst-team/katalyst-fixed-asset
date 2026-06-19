"use client";

import { useTranslation } from "next-i18next";
import { useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useGetAttributeDataQuery from "@/hooks/api/attribute/useGetAttributeDataQuery";
import { useColumnVisibility } from "@/hooks/useColumnVisibility";
import { AttributeItemType } from "@/types/attribute";
import { SkuItemType } from "@/types/sku";

import AttributeColumnHeader from "../ledger-product/AttributeColumnHeader";
import { extractUniqueAttributes } from "../ledger-product/utils/attributeUtils";
import LaminaLogHeader from "./LaminaLogHeader";
import LaminaLogItem from "./LaminaLogItem";
import { useLaminaLogStore } from "./store";
import { useLaminaLog } from "./useLaminaLog";

// Column IDs for lamina-log
const COLUMN_ID_NO = "no";
const COLUMN_ID_IMAGE = "image";
const COLUMN_ID_NAME = "name";
const COLUMN_ID_INTERNAL_CODE = "internalCode";
const COLUMN_ID_RFID_EPC = "rfidEpc";
const COLUMN_ID_RFID_NAME = "rfidName";
const COLUMN_ID_CATEGORY = "category";
const COLUMN_ID_STATUS = "status";
const COLUMN_ID_ITEM_STATUS = "itemStatus";
const COLUMN_ID_STOCK_MOVEMENT_TYPE = "stockMovementType";

const LaminaLog = () => {
  const { t } = useTranslation(["common", "lamina-log"]);
  const {
    laminaLogData,
    isLoadingLaminaLogData,
    nextCursor,
    prevCursor,
    totalCount,
  } = useLaminaLog();
  const { tokenPayload } = useUser();

  // Use Zustand store - get primitive values to avoid re-render loops
  const currentPage = useLaminaLogStore((state) => state.currentPage);
  const itemLimit = useLaminaLogStore((state) => state.itemLimit);
  const filters = useLaminaLogStore(useShallow((state) => state.filters));
  const setFilters = useLaminaLogStore((state) => state.setFilters);

  const organizationId = tokenPayload?.organization_id ?? "";

  const { data: attributeData } = useGetAttributeDataQuery({
    organizationId,
  });

  // Extract unique attributes for dynamic columns
  const uniqueAttributes = useMemo(() => {
    return extractUniqueAttributes(laminaLogData, organizationId);
  }, [laminaLogData, organizationId]);

  const attributeDefinitions = useMemo<AttributeItemType[]>(() => {
    return attributeData?.data?.attributes || [];
  }, [attributeData]);

  const attributeDefinitionMap = useMemo(() => {
    const map = new Map<string, AttributeItemType>();
    attributeDefinitions.forEach((attribute) => {
      map.set(attribute.id, attribute);
    });
    return map;
  }, [attributeDefinitions]);

  // Get current attribute filters
  const currentAttributeFilters = useMemo(() => {
    if (!filters.query_attributes) return {};
    return filters.query_attributes as Record<string, string[]>;
  }, [filters.query_attributes]);

  // Handle attribute filter changes
  const handleAttributeFilterChange = useCallback(
    (attributeId: string, values: string[]) => {
      const newQueryAttributes = { ...currentAttributeFilters };

      if (values.length === 0) {
        delete newQueryAttributes[attributeId];
      } else {
        newQueryAttributes[attributeId] = values;
      }

      setFilters({
        ...filters,
        query_attributes:
          Object.keys(newQueryAttributes).length > 0
            ? newQueryAttributes
            : undefined,
      });
    },
    [currentAttributeFilters, filters, setFilters],
  );

  // Define all columns for column visibility
  const allColumns = useMemo(() => {
    const staticColumns = [
      { id: COLUMN_ID_NO, label: t("lamina-log:table.header.no", "No") },
      { id: COLUMN_ID_IMAGE, label: t("lamina-log:table.header.image", "Image") },
      { id: COLUMN_ID_NAME, label: t("lamina-log:table.header.name", "Name") },
      {
        id: COLUMN_ID_INTERNAL_CODE,
        label: t("lamina-log:table.header.internalCode", "Internal Code"),
      },
      { id: COLUMN_ID_RFID_EPC, label: t("lamina-log:table.header.rfidEpc", "RFID EPC") },
      { id: COLUMN_ID_RFID_NAME, label: t("lamina-log:table.header.rfidName", "RFID Name") },
      { id: COLUMN_ID_CATEGORY, label: t("lamina-log:table.header.category", "Category") },
      { id: COLUMN_ID_STATUS, label: t("lamina-log:table.header.status", "Status") },
      {
        id: COLUMN_ID_ITEM_STATUS,
        label: t("lamina-log:table.header.itemStatus", "Item Status"),
      },
      {
        id: COLUMN_ID_STOCK_MOVEMENT_TYPE,
        label: t("lamina-log:table.header.stockMovementType", "Stock Movement Type"),
      },
    ];

    const dynamicColumns = uniqueAttributes.map((attr) => ({
      id: `attr-${attr.id}`,
      label: attr.name,
    }));

    return [...staticColumns, ...dynamicColumns];
  }, [t, uniqueAttributes]);

  // Use column visibility hook
  const {
    isColumnVisible,
    isInitialized,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    visibleColumns,
  } = useColumnVisibility("lamina-log", allColumns);

  return (
    <div
      className={`flex w-full gap-4 flex-col ${
        laminaLogData.length === 0 ? "h-[calc(100vh-120px)]" : ""
      }`}
    >
      <div className="mt-4 flex-shrink-0">
        <LaminaLogHeader
          allColumns={allColumns}
          nextCursor={nextCursor}
          prevCursor={prevCursor}
          totalCount={totalCount}
          visibleColumnIds={visibleColumns}
          onHideAll={hideAllColumns}
          onShowAll={showAllColumns}
          onToggleColumn={toggleColumn}
        />
      </div>

      <div
        className={`w-full max-w-[91vw] lg:max-w-full flex-1 ${
          laminaLogData.length === 0 ? "overflow-visible" : "overflow-x-auto"
        }`}
      >
        {isInitialized && (
          <Table className="border shadow-md rounded-md">
            <TableHeader>
              <TableRow>
                {isColumnVisible(COLUMN_ID_NO) && (
                  <TableHead>{t("lamina-log:table.header.no", "No")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_IMAGE) && (
                  <TableHead>
                    {t("lamina-log:table.header.image", "Image")}
                  </TableHead>
                )}
                {isColumnVisible(COLUMN_ID_NAME) && (
                  <TableHead>
                    {t("lamina-log:table.header.name", "Name")}
                  </TableHead>
                )}
                {isColumnVisible(COLUMN_ID_INTERNAL_CODE) && (
                  <TableHead>
                    {t("lamina-log:table.header.internalCode", "Internal Code")}
                  </TableHead>
                )}
                {isColumnVisible(COLUMN_ID_RFID_EPC) && (
                  <TableHead>
                    {t("lamina-log:table.header.rfidEpc", "RFID EPC")}
                  </TableHead>
                )}
                {isColumnVisible(COLUMN_ID_RFID_NAME) && (
                  <TableHead>
                    {t("lamina-log:table.header.rfidName", "RFID Name")}
                  </TableHead>
                )}
                {isColumnVisible(COLUMN_ID_CATEGORY) && (
                  <TableHead>
                    {t("lamina-log:table.header.category", "Category")}
                  </TableHead>
                )}
                {isColumnVisible(COLUMN_ID_STATUS) && (
                  <TableHead>
                    {t("lamina-log:table.header.status", "Status")}
                  </TableHead>
                )}
                {isColumnVisible(COLUMN_ID_ITEM_STATUS) && (
                  <TableHead>
                    {t("lamina-log:table.header.itemStatus", "Item Status")}
                  </TableHead>
                )}
                {isColumnVisible(COLUMN_ID_STOCK_MOVEMENT_TYPE) && (
                  <TableHead>
                    {t(
                      "lamina-log:table.header.stockMovementType",
                      "Stock Movement Type",
                    )}
                  </TableHead>
                )}
                {/* Dynamic attribute columns */}
                {uniqueAttributes.map((attribute) => {
                  const columnId = `attr-${attribute.id}`;
                  return isColumnVisible(columnId) ? (
                    <TableHead key={attribute.id} className="min-w-[180px]">
                      <AttributeColumnHeader
                        attribute={attribute}
                        attributeDefinition={attributeDefinitionMap.get(
                          attribute.id,
                        )}
                        currentFilters={currentAttributeFilters}
                        onFilterChange={handleAttributeFilterChange}
                      />
                    </TableHead>
                  ) : null;
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {!isLoadingLaminaLogData &&
                laminaLogData.length > 0 &&
                laminaLogData.map((item: SkuItemType, index: number) => (
                  <LaminaLogItem
                    key={item.id}
                    isColumnVisible={isColumnVisible}
                    item={item}
                    num={currentPage * itemLimit + index + 1 - itemLimit}
                    uniqueAttributes={uniqueAttributes}
                  />
                ))}
            </TableBody>
          </Table>
        )}

        {isLoadingLaminaLogData ? (
          <Loading className="min-h-[50vh]" />
        ) : (
          laminaLogData.length === 0 && (
            <EmptyState
              className="mt-4"
              description={t(
                "lamina-log:empty.description",
                "No Lamina log entries found.",
              )}
              title={t("lamina-log:empty.title", "No Lamina Log Entries")}
            />
          )
        )}
      </div>
    </div>
  );
};

export default LaminaLog;
