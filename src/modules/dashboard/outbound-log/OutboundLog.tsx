"use client";

import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import EmptyState from "@/components/shared/EmptyState";
import SkeletonTable from "@/components/shared/SkeletonTable";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import { useColumnVisibility } from "@/hooks/useColumnVisibility";
import {
  extractCommonAttributes,
  formatAttributeName,
} from "@/modules/dashboard/stock-movement-log/utils";
import { StockMovementItem } from "@/services/stockMovement/getStockMovementDataService";

import OutboundLogHeader from "./OutboundLogHeader";
import OutboundLogItem from "./OutboundLogItem";
import { useOutboundLogStore } from "./store";
import { useOutboundLog } from "./useOutboundLog";

// Column IDs for outbound-log
const COLUMN_ID_ACTION = "action";
const COLUMN_ID_NO = "no";
const COLUMN_ID_STATUS = "status";
const COLUMN_ID_OUTBOUND_TYPE = "outboundType";
const COLUMN_ID_OUTBOUND_DATE = "outboundDate";
const COLUMN_ID_SKU_NAME = "skuName";
const COLUMN_ID_INTERNAL_CODE = "internalCode";
const COLUMN_ID_OUTBOUND_QTY = "outboundQty";
const COLUMN_ID_STORE = "store";
const COLUMN_ID_WAREHOUSE = "warehouse";
const COLUMN_ID_OPERATOR = "operator";
const COLUMN_ID_NOTE = "note";
const COLUMN_ID_IMAGES = "images";
const COLUMN_ID_RFID_NAME = "rfidName";
const COLUMN_ID_RFID_EPC = "rfidEpc";
const COLUMN_ID_CATEGORIES = "categories";
const COLUMN_ID_SKU_IMAGES = "skuImages";

const OutboundLog = () => {
  const { t } = useTranslation("outbound");
  const {
    outboundLogData,
    isLoadingOutboundLogData,
    nextCursor,
    prevCursor,
    totalCount,
  } = useOutboundLog();
  const { tokenPayload } = useUser();

  const currentPage = useOutboundLogStore((state) => state.currentPage);
  const itemLimit = useOutboundLogStore((state) => state.itemLimit);

  const commonAttributes = useMemo(
    () => extractCommonAttributes(outboundLogData, tokenPayload?.organization_id),
    [outboundLogData, tokenPayload?.organization_id]
  );

  // Define all columns for column visibility
  const allColumns = useMemo(() => {
    const staticColumns = [
      { id: COLUMN_ID_ACTION, label: t("table.header.action") },
      { id: COLUMN_ID_NO, label: t("table.header.no") },
      { id: COLUMN_ID_STATUS, label: t("table.header.status") },
      { id: COLUMN_ID_OUTBOUND_TYPE, label: t("table.header.outboundType") },
      { id: COLUMN_ID_OUTBOUND_DATE, label: t("table.header.outboundDate") },
      { id: COLUMN_ID_SKU_NAME, label: t("table.header.skuName") },
      { id: COLUMN_ID_INTERNAL_CODE, label: t("table.header.internalCode") },
      { id: COLUMN_ID_OUTBOUND_QTY, label: t("table.header.outboundQty") },
      { id: COLUMN_ID_STORE, label: t("table.header.store") },
      { id: COLUMN_ID_WAREHOUSE, label: t("table.header.warehouse") },
      { id: COLUMN_ID_OPERATOR, label: t("table.header.operator") },
      { id: COLUMN_ID_NOTE, label: t("table.header.note") },
      { id: COLUMN_ID_IMAGES, label: t("table.header.images") },
      { id: COLUMN_ID_RFID_NAME, label: t("table.header.rfidName") },
      { id: COLUMN_ID_RFID_EPC, label: t("table.header.rfidEpc") },
      { id: COLUMN_ID_CATEGORIES, label: t("table.header.categories") },
      { id: COLUMN_ID_SKU_IMAGES, label: t("table.header.skuImages") },
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
  } = useColumnVisibility("outbound-log", allColumns);

  return (
    <div
      className={`flex w-full gap-4 flex-col ${
        outboundLogData.length === 0 ? "h-[calc(100vh-120px)]" : ""
      }`}
    >
      <div className="mt-4 flex-shrink-0">
        <OutboundLogHeader
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
          outboundLogData.length === 0 ? "overflow-visible" : "overflow-x-auto"
        }`}
      >
        {isInitialized && (
          <Table className="border shadow-md rounded-md">
            <TableHeader>
              <TableRow>
                {isColumnVisible(COLUMN_ID_ACTION) && (
                  <TableHead key={COLUMN_ID_ACTION}>{t("table.header.action")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_NO) && (
                  <TableHead key={COLUMN_ID_NO}>{t("table.header.no")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_STATUS) && (
                  <TableHead key={COLUMN_ID_STATUS}>{t("table.header.status")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_OUTBOUND_TYPE) && (
                  <TableHead key={COLUMN_ID_OUTBOUND_TYPE}>{t("table.header.outboundType")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_OUTBOUND_DATE) && (
                  <TableHead key={COLUMN_ID_OUTBOUND_DATE}>{t("table.header.outboundDate")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_SKU_NAME) && (
                  <TableHead key={COLUMN_ID_SKU_NAME}>{t("table.header.skuName")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_INTERNAL_CODE) && (
                  <TableHead key={COLUMN_ID_INTERNAL_CODE}>{t("table.header.internalCode")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_OUTBOUND_QTY) && (
                  <TableHead key={COLUMN_ID_OUTBOUND_QTY}>{t("table.header.outboundQty")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_STORE) && (
                  <TableHead key={COLUMN_ID_STORE}>{t("table.header.store")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_WAREHOUSE) && (
                  <TableHead key={COLUMN_ID_WAREHOUSE}>{t("table.header.warehouse")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_OPERATOR) && (
                  <TableHead key={COLUMN_ID_OPERATOR}>{t("table.header.operator")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_NOTE) && (
                  <TableHead key={COLUMN_ID_NOTE}>{t("table.header.note")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_IMAGES) && (
                  <TableHead key={COLUMN_ID_IMAGES}>{t("table.header.images")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_RFID_NAME) && (
                  <TableHead key={COLUMN_ID_RFID_NAME}>{t("table.header.rfidName")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_RFID_EPC) && (
                  <TableHead key={COLUMN_ID_RFID_EPC}>{t("table.header.rfidEpc")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_CATEGORIES) && (
                  <TableHead key={COLUMN_ID_CATEGORIES}>{t("table.header.categories")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_SKU_IMAGES) && (
                  <TableHead key={COLUMN_ID_SKU_IMAGES}>{t("table.header.skuImages")}</TableHead>
                )}
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
              {!isLoadingOutboundLogData &&
                outboundLogData.length > 0 &&
                outboundLogData.map((item: StockMovementItem, index: number) => (
                  <OutboundLogItem
                    key={item.id}
                    commonAttributes={commonAttributes}
                    isColumnVisible={isColumnVisible}
                    item={item}
                    num={currentPage * itemLimit + index + 1 - itemLimit}
                  />
                ))}
            </TableBody>
          </Table>
        )}

        {isLoadingOutboundLogData ? (
          <SkeletonTable columns={17} rows={5} />
        ) : (
          outboundLogData.length === 0 && (
            <EmptyState
              description={t("empty.description")}
              title={t("empty.title")}
            />
          )
        )}
      </div>
    </div>
  );
};

export default OutboundLog;
