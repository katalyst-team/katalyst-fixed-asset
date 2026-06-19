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
import { AttributeItemType } from "@/types/attribute";
import { SkuItemType } from "@/types/sku";
import { isNagatechSyncOrganization } from "@/utils/nagatechSync";

import AttributeColumnHeader from "./AttributeColumnHeader";
import LedgerProductHeader from "./LedgerProductHeader";
import LedgerProductItem from "./LedgerProductItem";
import LedgerProductSyncInfo from "./LedgerProductSyncInfo";
import { useLedgerProductStore } from "./store";
import { useLedgerProduct } from "./useLedgerProduct";
import { extractUniqueAttributes } from "./utils/attributeUtils";

const LedgerProduct = () => {
  const { t } = useTranslation(["common", "ledger-product"]);
  const { ledgerProductData, isLoadingLedgerProductData } = useLedgerProduct();
  const { tokenPayload } = useUser();

  // Use Zustand store - get primitive values to avoid re-render loops
  const currentPage = useLedgerProductStore((state) => state.currentPage);
  const itemLimit = useLedgerProductStore((state) => state.itemLimit);
  const filters = useLedgerProductStore(useShallow((state) => state.filters));
  const setFilters = useLedgerProductStore((state) => state.setFilters);

  const organizationId = tokenPayload?.organization_id ?? "";
  const isKerbauUser = isNagatechSyncOrganization(organizationId);

  const { data: attributeData } = useGetAttributeDataQuery({
    limit: 1000,
    organizationId,
  });

  // Extract unique attributes for dynamic columns
  const uniqueAttributes = useMemo(() => {
    return extractUniqueAttributes(ledgerProductData);
  }, [ledgerProductData]);

  // Compute which optional columns have at least one value across current page data
  const activeColumns = useMemo(() => ({
    agingDays: ledgerProductData.some((item) => item.item?.aging_days != null),
    areaTransferDate: ledgerProductData.some((item) => item.item?.area_transfer_date),
    inboundDate: ledgerProductData.some((item) => item.item?.inbound_date),
    internalCode: ledgerProductData.some((item) => item.internal_code),
    itemStatus: ledgerProductData.some((item) => item.item?.status?.name),
    movementType: ledgerProductData.some((item) => item.item?.last_item_status_history?.new_stock_movement?.stock_movement_type?.name),
    outboundDate: ledgerProductData.some((item) => item.item?.outbound_date),
    rfidEpc: ledgerProductData.some((item) => item.rfid?.epc),
    rfidName: ledgerProductData.some((item) => item.rfid?.name),
    section: ledgerProductData.some((item) => item.item?.section?.name),
  }), [ledgerProductData]);

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
    [currentAttributeFilters, filters, setFilters]
  );

  return (
    <div
      className={`flex w-full gap-4 flex-col ${
        ledgerProductData.length === 0 ? "h-[calc(100vh-120px)]" : ""
      }`}
    >
      <div className="mt-4 flex-shrink-0">
        <LedgerProductHeader />
      </div>

      {isKerbauUser ? <LedgerProductSyncInfo /> : null}

      <div
        className={`w-full max-w-[91vw] lg:max-w-full flex-1 ${
          ledgerProductData.length === 0 ? "overflow-visible" : "overflow-x-auto"
        }`}
      >
        <Table className="border shadow-md rounded-md">
          <TableHeader>
            <TableRow>
              <TableHead>{t("ledger-product:table.header.no", "No")}</TableHead>
              <TableHead>
                {t("ledger-product:table.header.action", "Action")}
              </TableHead>
              <TableHead>
                {t("ledger-product:table.header.image", "Image")}
              </TableHead>
              <TableHead>
                {t("ledger-product:table.header.name", "Name")}
              </TableHead>
              {activeColumns.internalCode && (
              <TableHead>
                {t("ledger-product:table.header.internalCode", "Internal Code")}
              </TableHead>
              )}
              {activeColumns.rfidEpc && (
              <TableHead>
                {t("ledger-product:table.header.rfidEpc", "RFID EPC")}
              </TableHead>
              )}
              {activeColumns.rfidName && (
              <TableHead>
                {t("ledger-product:table.header.rfidName", "RFID Name")}
              </TableHead>
              )}
              <TableHead>
                {t("ledger-product:table.header.category", "Category")}
              </TableHead>
              <TableHead>
                {t("ledger-product:table.header.status", "Status")}
              </TableHead>
              {activeColumns.itemStatus && (
              <TableHead>
                {t("ledger-product:table.header.itemStatus", "Item Status")}
              </TableHead>
              )}
              {activeColumns.section && (
              <TableHead>
                {t("ledger-product:table.header.section", "Section")}
              </TableHead>
              )}
              {activeColumns.movementType && (
              <TableHead>
                {t(
                  "ledger-product:table.header.stockMovementType",
                  "Stock Movement Type"
                )}
              </TableHead>
              )}
              {activeColumns.inboundDate && (
              <TableHead className="whitespace-nowrap">
                {t("ledger-product:table.header.inboundDate", "Inbound Date")}
              </TableHead>
              )}
              {activeColumns.outboundDate && (
              <TableHead className="whitespace-nowrap">
                {t("ledger-product:table.header.outboundDate", "Outbound Date")}
              </TableHead>
              )}
              {activeColumns.areaTransferDate && (
              <TableHead className="whitespace-nowrap">
                {t("ledger-product:table.header.areaTransferDate", "Area Transfer Date")}
              </TableHead>
              )}
              {activeColumns.agingDays && (
              <TableHead className="whitespace-nowrap text-center">
                {t("ledger-product:table.header.agingDays", "Aging (days)")}
              </TableHead>
              )}
              {/* Dynamic attribute columns */}
              {uniqueAttributes.map((attribute) => (
                <TableHead key={attribute.id} className="min-w-[180px]">
                  <AttributeColumnHeader
                    attribute={attribute}
                    attributeDefinition={attributeDefinitionMap.get(attribute.id)}
                    currentFilters={currentAttributeFilters}
                    onFilterChange={handleAttributeFilterChange}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {!isLoadingLedgerProductData &&
              ledgerProductData.length > 0 &&
              ledgerProductData.map((item: SkuItemType, index: number) => (
                <LedgerProductItem
                  key={item.id}
                  activeColumns={activeColumns}
                  item={item}
                  num={currentPage * itemLimit + index + 1 - itemLimit}
                  uniqueAttributes={uniqueAttributes}
                />
              ))}
          </TableBody>
        </Table>

        {isLoadingLedgerProductData ? (
          <Loading className="min-h-[50vh]" />
        ) : (
          ledgerProductData.length === 0 && (
            <EmptyState
              className="mt-4"
              description={t(
                "ledger-product:empty.description",
                "No ledger products found. Start by adding products to your ledger."
              )}
              title={t("ledger-product:empty.title", "No Ledger Products")}
            />
          )
        )}
      </div>
    </div>
  );
};

export default LedgerProduct;
