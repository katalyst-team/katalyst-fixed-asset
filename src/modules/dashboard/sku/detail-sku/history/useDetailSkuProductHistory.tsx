/* eslint-disable simple-import-sort/imports */
"use client";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import { useUser } from "@/context/user-context";
import { formatDateTime } from "@/utils/text";
import useGetRfidDetailQuery from "@/hooks/api/rfid/useGetRfidDetailQuery";
import { SKUAtributeItemType } from "@/types/attribute";
import {
  DetailSkuProductHistoryFilterOptions,
  DetailSkuProductHistoryItemType,
} from "@/types/detailSkuProductHistory";
import { SkuDetail, StockMovement, StockMovementDirection } from "@/types/rfid";
import { SkuItemType, SkuStatus, SkuType as SkuTypeEnum } from "@/types/sku";

interface DetailSkuProductHistoryContextType {
  detailSkuProductHistoryData: DetailSkuProductHistoryItemType[];
  skuData: SkuItemType | null;
  filters: DetailSkuProductHistoryFilterOptions;
  setFilters: (filters: DetailSkuProductHistoryFilterOptions) => void;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
  isError: boolean;
}

const DetailSkuProductHistoryContext = createContext<
  DetailSkuProductHistoryContextType | undefined
>(undefined);

interface DetailSkuProductHistoryProviderProps {
  children: ReactNode;
  itemsPerPage?: number;
}

// Transform SkuDetail from RFID response to SkuItemType
const transformSkuData = (skuData: SkuDetail): SkuItemType => {
  const attributes = skuData.attributes || [];
  const categories = skuData.categories || [];

  return {
    attributes: attributes.map((attr) => ({
      Description: attr.description,
      Name: attr.name,
      Type: attr.type as SKUAtributeItemType["Type"],
      Values: attr.values,
      attribute_id: attr.attribute_id,
    })),

    brand: skuData.brand,

    brand_id: skuData.brand.id,

    categories: categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      subcategory: cat.subcategory,
    })),

    color: skuData.color,

    color_id: skuData.color.id,

    created_at: "",

    deleted_at: null,

    description: "",

    id: skuData.id,

    image_urls: skuData.image_urls || [],

    internal_code: skuData.internal_code,

    name: skuData.name,

    organization_id: "",

    size: skuData.size,

    size_id: skuData.size.id,

    sku: skuData.sku,

    status: skuData.status as SkuStatus,

    type: skuData.type as SkuTypeEnum,

    updated_at: "",
  };
};

export const DetailSkuProductHistoryProvider: React.FC<
  DetailSkuProductHistoryProviderProps
> = ({ children, itemsPerPage = 10 }) => {
  const { t } = useTranslation("detail-inventory");
  const { tokenPayload } = useUser();
  const { query } = useRouter();
  const organizationId = tokenPayload?.organization_id ?? "";
  const rfidIdParam = query.rfid_id;
  const rfidId = typeof rfidIdParam === "string" ? rfidIdParam : "";

  const [filters, setFilters] = useState<DetailSkuProductHistoryFilterOptions>(
    {},
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localItemsPerPage] = useState<number>(itemsPerPage);
  const notAvailableLabel = t("notAvailable");

  const {
    data: rfidDetailData,
    isLoading,
    isError,
  } = useGetRfidDetailQuery({
    enabled: !!organizationId && !!rfidId,
    organizationId,
    rfidId,
  });

  // Process data using useMemo instead of useEffect
  const processedData = useMemo(() => {
    const stockMovements = (rfidDetailData?.data?.stock_movements ?? []).filter(
      (movement): movement is StockMovement =>
        Boolean(movement && typeof movement === "object"),
    );

    if (!Array.isArray(stockMovements) || stockMovements.length === 0) {
      return {
        historyData: [],
        skuData: null,
        totalItems: 0,
      };
    }

    // Transform the stock movements data to match DetailSkuProductHistoryItemType
    const transformedData = stockMovements.map((movement, index: number) => {
      const direction = movement.stock_movement_type?.direction;
      const quantityValue =
        typeof movement.quantity === "number" ? movement.quantity : null;

      let quantityDisplay = "-";
      if (quantityValue !== null) {
        if (direction === StockMovementDirection.INBOUND) {
          quantityDisplay = `+${quantityValue}`;
        } else if (direction === StockMovementDirection.OUTBOUND) {
          quantityDisplay = `-${quantityValue}`;
        }
      }

      const noteValue = movement.note?.trim();

      return {
        lastUpdate: movement.created_at
          ? formatDateTime(movement.created_at)
          : notAvailableLabel,
        no: (index + 1).toString(),
        note: noteValue ? movement.note : notAvailableLabel,
        operator: movement.editor?.name || notAvailableLabel,
        quantity: quantityDisplay,
        section: movement.section?.name || notAvailableLabel,
        status: movement.stock_movement_type?.name || "UNKNOWN",
      };
    });

    // Apply any filters
    let filteredData = transformedData;
    if (filters.status) {
      filteredData = filteredData.filter((item) =>
        item.status.toLowerCase().includes(filters.status?.toLowerCase() || ""),
      );
    }

    // Total count
    const totalItems = filteredData.length;

    // Apply pagination
    const startIndex = (currentPage - 1) * localItemsPerPage;
    const endIndex = startIndex + localItemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Extract SKU data from first stock movement's item if available
    let extractedSkuData = null;
    if (stockMovements.length > 0) {
      const firstMovementWithItem = stockMovements.find(
        (movement) =>
          Array.isArray(movement.new_item_status_histories) &&
          movement.new_item_status_histories.length > 0,
      );

      const firstItem =
        firstMovementWithItem?.new_item_status_histories?.[0]?.item;
      if (firstItem?.sku) {
        extractedSkuData = firstItem.sku;
      }
    }

    return {
      historyData: paginatedData,
      skuData: extractedSkuData,
      totalItems,
    };
  }, [
    rfidDetailData,
    currentPage,
    localItemsPerPage,
    filters,
    notAvailableLabel,
  ]);

  const value: DetailSkuProductHistoryContextType = {
    currentPage,
    detailSkuProductHistoryData: processedData.historyData,
    filters,
    isError,
    isLoading,
    itemsPerPage: localItemsPerPage,
    setCurrentPage,
    setFilters,
    skuData: processedData.skuData
      ? transformSkuData(processedData.skuData)
      : null,
    totalItems: processedData.totalItems,
  };

  return (
    <DetailSkuProductHistoryContext.Provider value={value}>
      {children}
    </DetailSkuProductHistoryContext.Provider>
  );
};

export const useDetailSkuProductHistory =
  (): DetailSkuProductHistoryContextType => {
    const context = useContext(DetailSkuProductHistoryContext);
    if (!context) {
      throw new Error(
        "useDetailSkuProductHistory must be used within a DetailSkuProductHistoryProvider",
      );
    }
    return context;
  };
