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
import { useColumnVisibility } from "@/hooks/useColumnVisibility";
import { StockMovementItem } from "@/services/stockMovement/getStockMovementDataService";

import OutboundHeader from "./OutboundHeader";
import OutboundItem from "./OutboundItem";
import { useOutboundStore } from "./store";
import { useOutbound } from "./useOutbound";

const COLUMN_ID_NO = "no";
const COLUMN_ID_STATUS = "status";
const COLUMN_ID_OUTBOUND_TYPE = "outboundType";
const COLUMN_ID_OUTBOUND_DATE = "outboundDate";
const COLUMN_ID_OUTBOUND_QTY = "outboundQty";
const COLUMN_ID_STORE = "store";
const COLUMN_ID_WAREHOUSE = "warehouse";
const COLUMN_ID_OPERATOR = "operator";
const COLUMN_ID_NOTE = "note";
const COLUMN_ID_IMAGES = "images";
const COLUMN_ID_ACTION = "action";

const Outbound = () => {
  const { t } = useTranslation("outbound");
  const { outboundData, isLoadingOutboundData } = useOutbound();

  const currentPage = useOutboundStore((state) => state.currentPage);
  const itemLimit = useOutboundStore((state) => state.itemLimit);

  const allColumns = useMemo(
    () => [
      { id: COLUMN_ID_NO, label: t("table.header.no") },
      { id: COLUMN_ID_STATUS, label: t("table.header.status") },
      { id: COLUMN_ID_OUTBOUND_TYPE, label: t("table.header.outboundType") },
      { id: COLUMN_ID_OUTBOUND_DATE, label: t("table.header.outboundDate") },
      { id: COLUMN_ID_OUTBOUND_QTY, label: t("table.header.outboundQty") },
      { id: COLUMN_ID_STORE, label: t("table.header.store") },
      { id: COLUMN_ID_WAREHOUSE, label: t("table.header.warehouse") },
      { id: COLUMN_ID_OPERATOR, label: t("table.header.operator") },
      { id: COLUMN_ID_NOTE, label: t("table.header.note") },
      { id: COLUMN_ID_IMAGES, label: t("table.header.images") },
      { id: COLUMN_ID_ACTION, label: t("table.header.action") },
    ],
    [t]
  );

  const {
    hideAllColumns,
    isColumnVisible,
    isInitialized,
    showAllColumns,
    toggleColumn,
    visibleColumns,
  } = useColumnVisibility("outbound", allColumns);

  return (
    <div
      className={`flex w-full gap-4 flex-col ${
        outboundData.length === 0 ? "h-[calc(100vh-120px)]" : ""
      }`}
    >
      <div className="mt-4 flex-shrink-0">
        <OutboundHeader
          allColumns={allColumns}
          visibleColumnIds={visibleColumns}
          onHideAll={hideAllColumns}
          onShowAll={showAllColumns}
          onToggleColumn={toggleColumn}
        />
      </div>

      <div
        className={`w-full max-w-[91vw] lg:max-w-full flex-1 ${
          outboundData.length === 0 ? "overflow-visible" : "overflow-x-auto"
        }`}
      >
        {isInitialized && (
          <Table className="border shadow-md rounded-md">
            <TableHeader>
              <TableRow>
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
                {isColumnVisible(COLUMN_ID_ACTION) && (
                  <TableHead key={COLUMN_ID_ACTION}>{t("table.header.action")}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoadingOutboundData &&
                outboundData.length > 0 &&
                outboundData.map((item: StockMovementItem, index: number) => (
                  <OutboundItem
                    key={item.id}
                    isColumnVisible={isColumnVisible}
                    item={item}
                    num={currentPage * itemLimit + index + 1 - itemLimit}
                  />
                ))}
            </TableBody>
          </Table>
        )}

        {isLoadingOutboundData ? (
          <SkeletonTable columns={11} rows={5} />
        ) : (
          outboundData.length === 0 && (
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

export default Outbound;
