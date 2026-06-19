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

import InboundHeader from "./InboundHeader";
import InboundItem from "./InboundItem";
import { useInboundStore } from "./store";
import { useInbound } from "./useInbound";

const COLUMN_ID_NO = "no";
const COLUMN_ID_STATUS = "status";
const COLUMN_ID_VERIFICATION_ACTIONS = "verificationActions";
const COLUMN_ID_INBOUND_TYPE = "inboundType";
const COLUMN_ID_INBOUND_DATE = "inboundDate";
const COLUMN_ID_INBOUND_QTY = "inboundQty";
const COLUMN_ID_STORE = "store";
const COLUMN_ID_STORE_AREA = "storeArea";
const COLUMN_ID_OPERATOR = "operator";
const COLUMN_ID_NOTE = "note";
const COLUMN_ID_IMAGES = "images";
const COLUMN_ID_ACTION = "action";

const Inbound = () => {
  const { t } = useTranslation("inbound");
  const { inboundData, isLoadingInboundData } = useInbound();

  const currentPage = useInboundStore((state) => state.currentPage);
  const itemLimit = useInboundStore((state) => state.itemLimit);

  const allColumns = useMemo(
    () => [
      { id: COLUMN_ID_NO, label: t("table.header.no") },
      { id: COLUMN_ID_STATUS, label: t("table.header.status") },
      { id: COLUMN_ID_VERIFICATION_ACTIONS, label: t("table.header.verificationActions") },
      { id: COLUMN_ID_INBOUND_TYPE, label: t("table.header.inboundType") },
      { id: COLUMN_ID_INBOUND_DATE, label: t("table.header.inboundDate") },
      { id: COLUMN_ID_INBOUND_QTY, label: t("table.header.inboundQty") },
      { id: COLUMN_ID_STORE, label: t("table.header.store") },
      { id: COLUMN_ID_STORE_AREA, label: t("table.header.storeArea") },
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
  } = useColumnVisibility("inbound", allColumns);

  return (
    <div
      className={`flex w-full gap-4 flex-col ${
        inboundData.length === 0 ? "h-[calc(100vh-120px)]" : ""
      }`}
    >
      <div className="mt-4 flex-shrink-0">
        <InboundHeader
          allColumns={allColumns}
          visibleColumnIds={visibleColumns}
          onHideAll={hideAllColumns}
          onShowAll={showAllColumns}
          onToggleColumn={toggleColumn}
        />
      </div>

      <div
        className={`w-full max-w-[91vw] lg:max-w-full flex-1 ${
          inboundData.length === 0 ? "overflow-visible" : "overflow-x-auto"
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
                  <TableHead key={COLUMN_ID_STATUS} className="text-center">{t("table.header.status")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_VERIFICATION_ACTIONS) && (
                  <TableHead key={COLUMN_ID_VERIFICATION_ACTIONS} className="text-center">{t("table.header.verificationActions")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_INBOUND_TYPE) && (
                  <TableHead key={COLUMN_ID_INBOUND_TYPE}>{t("table.header.inboundType")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_INBOUND_DATE) && (
                  <TableHead key={COLUMN_ID_INBOUND_DATE}>{t("table.header.inboundDate")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_INBOUND_QTY) && (
                  <TableHead key={COLUMN_ID_INBOUND_QTY}>{t("table.header.inboundQty")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_STORE) && (
                  <TableHead key={COLUMN_ID_STORE}>{t("table.header.store")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_STORE_AREA) && (
                  <TableHead key={COLUMN_ID_STORE_AREA}>{t("table.header.storeArea")}</TableHead>
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
              {!isLoadingInboundData &&
                inboundData.length > 0 &&
                inboundData.map((item: StockMovementItem, index: number) => (
                  <InboundItem
                    key={item.id}
                    isColumnVisible={isColumnVisible}
                    item={item}
                    num={currentPage * itemLimit + index + 1 - itemLimit}
                  />
                ))}
            </TableBody>
          </Table>
        )}

        {isLoadingInboundData ? (
          <SkeletonTable columns={12} rows={5} />
        ) : (
          inboundData.length === 0 && (
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

export default Inbound;
