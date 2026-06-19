/* eslint-disable simple-import-sort/imports */
"use client";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import { useUser } from "@/context/user-context";
import { formatDateTime } from "@/utils/text";
import useGetDetailLedgerItemQuery from "@/hooks/api/ledger/useGetDetailLedgerItemQuery";
import { DetailLedgerSkuType, ItemStatusHistoryType } from "@/types/detailLedger";
import {
  DetailSkuProductHistoryFilterOptions,
  DetailSkuProductHistoryItemType,
} from "@/types/detailSkuProductHistory";
import { SkuItemType, SkuStatus, SkuType as SkuTypeEnum } from "@/types/sku";

interface DetailProductHistoryContextType {
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

const DetailProductHistoryContext = createContext<
  DetailProductHistoryContextType | undefined
>(undefined);

interface DetailProductHistoryProviderProps {
  children: ReactNode;
  itemsPerPage?: number;
}

// Transform DetailLedgerSkuType from detailLedger to SkuItemType
const transformSkuData = (skuData: DetailLedgerSkuType): SkuItemType => {
  return {
    attributes: skuData.attributes || [],

    brand: skuData.brand,

    // Not available in SkuType
    brand_id: skuData.brand.id,

    categories: (skuData.categories || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      subcategory: [],
    })),

    color: skuData.color,

    color_id: skuData.color.id,

    created_at: "",

    // Not available in SkuType
    deleted_at: null,

    description: "",

    id: skuData.id,

    image_urls: skuData.image_urls,

    internal_code: "",

    name: skuData.name,

    // Not available in SkuType
    organization_id: "",

    size: skuData.size,

    size_id: skuData.size.id,

    // Not available in SkuType
    sku: skuData.sku,

    // Not available in SkuType
    status: skuData.status as SkuStatus,
    // Default to COMMON type since it's not available in the original SkuType
    type: SkuTypeEnum.COMMON,
    // Not available in SkuType
    updated_at: "",
  };
};

export const DetailProductHistoryProvider: React.FC<
  DetailProductHistoryProviderProps
> = ({ children, itemsPerPage = 10 }) => {
  const { t } = useTranslation("detail-inventory");
  const { tokenPayload, selectedTeam } = useUser();
  const { query } = useRouter();
  const organizationId = tokenPayload?.organization_id ?? "";
  const storeId = selectedTeam;
  const itemId = query.product_id as string;

  const [filters, setFilters] = useState<DetailSkuProductHistoryFilterOptions>(
    {}
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localItemsPerPage] = useState<number>(itemsPerPage);
  const notAvailableLabel = t("notAvailable");

  const { data, isLoading, isError } = useGetDetailLedgerItemQuery({
    enabled: !!organizationId && !!storeId && !!itemId,
    itemId,
    organizationId,
    storeId,
  });

  const detailLedgerItem = data?.data ?? null;

  // Process data using useMemo instead of useEffect
  const processedData = useMemo(() => {
    if (!detailLedgerItem?.item_status_histories) {
      return {
        historyData: [],
        totalItems: 0,
      };
    }

    // Transform the ledger history data to match DetailSkuProductHistoryItemType
    const transformedData = detailLedgerItem.item_status_histories.map(
      (history: ItemStatusHistoryType, index: number) => {
        const editorName = history.editor
          ? `${history.editor.first_name ?? ""} ${history.editor.last_name ?? ""}`.trim() ||
            notAvailableLabel
          : notAvailableLabel;

        const sectionName =
          history.item?.section?.name?.trim() || notAvailableLabel;

        const noteValue = ""; // No explicit note field; default to N/A

        const statusName = history.new_status?.name?.trim() || "UNKNOWN";

        return {
          lastUpdate: history.changed_at
            ? formatDateTime(history.changed_at)
            : notAvailableLabel,
          no: (index + 1).toString(),
          note: noteValue || notAvailableLabel,
          operator: editorName,
          quantity: "-", // Ledger history does not provide quantity information
          section: sectionName,
          status: statusName,
        };
      }
    );

    // Apply any filters
    let filteredData = transformedData;
    if (filters.status) {
      filteredData = filteredData.filter((item) =>
        item.status.toLowerCase().includes(filters.status?.toLowerCase() || "")
      );
    }

    // Total count
    const totalItems = filteredData.length;

    // Apply pagination
    const startIndex = (currentPage - 1) * localItemsPerPage;
    const endIndex = startIndex + localItemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      historyData: paginatedData,
      totalItems,
    };
  }, [
    detailLedgerItem,
    currentPage,
    localItemsPerPage,
    filters,
    notAvailableLabel,
  ]);

  const value: DetailProductHistoryContextType = {
    currentPage,
    detailSkuProductHistoryData: processedData.historyData,
    filters,
    isError,
    isLoading,
    itemsPerPage: localItemsPerPage,
    setCurrentPage,
    setFilters,
    skuData: detailLedgerItem?.sku
      ? transformSkuData(detailLedgerItem.sku)
      : null,
    totalItems: processedData.totalItems,
  };

  return (
    <DetailProductHistoryContext.Provider value={value}>
      {children}
    </DetailProductHistoryContext.Provider>
  );
};

export const useDetailProductHistory =
  (): DetailProductHistoryContextType => {
    const context = useContext(DetailProductHistoryContext);
    if (!context) {
      throw new Error(
        "useDetailProductHistory must be used within a DetailProductHistoryProvider"
      );
    }
    return context;
  };
