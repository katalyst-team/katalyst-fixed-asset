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

import InboundStBasahHeader from "./InboundStBasahHeader";
import InboundStBasahItem from "./InboundStBasahItem";
import { useInboundStBasahStore } from "./store";
import { useInboundStBasah } from "./useInboundStBasah";

const COLUMN_ID_ACTION = "action";
const COLUMN_ID_NO = "no";
const COLUMN_ID_STATUS = "status";
const COLUMN_ID_VERIFICATION_ACTIONS = "verificationActions";
const COLUMN_ID_INBOUND_TYPE = "inboundType";
const COLUMN_ID_INBOUND_DATE = "inboundDate";
const COLUMN_ID_SKU_NAME = "skuName";
const COLUMN_ID_INTERNAL_CODE = "internalCode";
const COLUMN_ID_INBOUND_QTY = "inboundQty";
const COLUMN_ID_STORE = "store";
const COLUMN_ID_STORE_AREA = "storeArea";
const COLUMN_ID_OPERATOR = "operator";
const COLUMN_ID_NOTE = "note";
const COLUMN_ID_IMAGES = "images";
const COLUMN_ID_RFID_NAME = "rfidName";
const COLUMN_ID_RFID_EPC = "rfidEpc";
const COLUMN_ID_CATEGORIES = "categories";
const COLUMN_ID_SKU_IMAGES = "skuImages";

const InboundStBasah = () => {
  const { t } = useTranslation("inbound");
  const {
    inboundStBasahData,
    isLoadingInboundStBasahData,
    nextCursor,
    prevCursor,
    totalCount,
  } = useInboundStBasah();
  const { tokenPayload } = useUser();

  const currentPage = useInboundStBasahStore((state) => state.currentPage);
  const itemLimit = useInboundStBasahStore((state) => state.itemLimit);

  const commonAttributes = useMemo(
    () =>
      extractCommonAttributes(inboundStBasahData, tokenPayload?.organization_id),
    [inboundStBasahData, tokenPayload?.organization_id],
  );

  const allColumns = useMemo(() => {
    const staticColumns = [
      { id: COLUMN_ID_ACTION, label: t("table.header.action") },
      { id: COLUMN_ID_NO, label: t("table.header.no") },
      { id: COLUMN_ID_STATUS, label: t("table.header.status") },
      { id: COLUMN_ID_VERIFICATION_ACTIONS, label: t("table.header.verificationActions") },
      { id: COLUMN_ID_INBOUND_TYPE, label: t("table.header.inboundType") },
      { id: COLUMN_ID_INBOUND_DATE, label: t("table.header.inboundDate") },
      { id: COLUMN_ID_SKU_NAME, label: t("table.header.skuName") },
      { id: COLUMN_ID_INTERNAL_CODE, label: t("table.header.internalCode") },
      { id: COLUMN_ID_INBOUND_QTY, label: t("table.header.inboundQty") },
      { id: COLUMN_ID_STORE, label: t("table.header.store") },
      { id: COLUMN_ID_STORE_AREA, label: t("table.header.storeArea") },
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

  const {
    isColumnVisible,
    isInitialized,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    visibleColumns,
  } = useColumnVisibility("inbound-st-basah", allColumns);

  return (
    <div
      className={`flex w-full gap-4 flex-col ${
        inboundStBasahData.length === 0 ? "h-[calc(100vh-120px)]" : ""
      }`}
    >
      <div className="mt-4 flex-shrink-0">
        <InboundStBasahHeader
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
          inboundStBasahData.length === 0 ? "overflow-visible" : "overflow-x-auto"
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
                {isColumnVisible(COLUMN_ID_SKU_NAME) && (
                  <TableHead key={COLUMN_ID_SKU_NAME}>{t("table.header.skuName")}</TableHead>
                )}
                {isColumnVisible(COLUMN_ID_INTERNAL_CODE) && (
                  <TableHead key={COLUMN_ID_INTERNAL_CODE}>{t("table.header.internalCode")}</TableHead>
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
                    <TableHead
                      key={attribute.id}
                      className="w-fit whitespace-nowrap"
                    >
                      {formatAttributeName(attribute.name)}
                    </TableHead>
                  ) : null;
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoadingInboundStBasahData &&
                inboundStBasahData.length > 0 &&
                inboundStBasahData.map((item: StockMovementItem, index: number) => (
                  <InboundStBasahItem
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

        {isLoadingInboundStBasahData ? (
          <SkeletonTable columns={18} rows={5} />
        ) : (
          inboundStBasahData.length === 0 && (
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

export default InboundStBasah;
