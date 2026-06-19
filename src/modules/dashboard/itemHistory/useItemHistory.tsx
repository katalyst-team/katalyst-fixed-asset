"use client";

import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import { useUser } from "@/context/user-context";
import useGetDetailLedgerItemQuery from "@/hooks/api/ledger/useGetDetailLedgerItemQuery";
import {
  DetailLedgerItemType,
  ItemStatusHistoryType,
} from "@/types/detailLedger";
import { SkuItemType, SkuStatus, SkuType as SkuTypeEnum } from "@/types/sku";
import { formatDateTime } from "@/utils/text";

export interface ItemHistoryEntry {
  no: string;
  status: string;
  lastUpdate: string;
  operator: string;
  stockMovementId: string | null;
  section: string;
  store: string;
  movementType: string;
  note: string;
  images: string[];
  quantity: string;
}

interface ItemHistoryContextType {
  itemData: DetailLedgerItemType | null;
  historyData: ItemHistoryEntry[];
  skuData: SkuItemType | null;
  isLoading: boolean;
  isError: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
}

const ItemHistoryContext = createContext<ItemHistoryContextType | undefined>(
  undefined
);

interface ItemHistoryProviderProps {
  children: ReactNode;
  itemsPerPage?: number;
}

// Transform SKU data from item response to SkuItemType
const transformSkuData = (
  sku: DetailLedgerItemType["sku"]
): SkuItemType | null => {
  if (!sku) return null;

  return {
    attributes: sku.attributes || [],
    brand: sku.brand,
    brand_id: sku.brand.id,
    categories: sku.categories?.map((cat) => ({
      id: cat.id,
      name: cat.name,
      subcategory: cat.subcategories || [],
    })) || [],
    color: sku.color,
    color_id: sku.color.id,
    created_at: "",
    deleted_at: null,
    description: "",
    id: sku.id,
    image_urls: sku.image_urls || [],
    internal_code: sku.internal_code || "",
    name: sku.name,
    organization_id: "",
    size: sku.size,
    size_id: sku.size.id,
    sku: sku.sku,
    status: sku.status as SkuStatus,
    type: sku.type as SkuTypeEnum,
    updated_at: "",
  };
};

export const ItemHistoryProvider: React.FC<ItemHistoryProviderProps> = ({
  children,
  itemsPerPage = 10,
}) => {
  const { t } = useTranslation("detail-inventory");
  const { tokenPayload } = useUser();
  const { query } = useRouter();
  const organizationId = tokenPayload?.organization_id ?? "";
  const storeIdParam = query.storeId;
  const itemIdParam = query.itemId;
  const storeId = typeof storeIdParam === "string" ? storeIdParam : "";
  const itemId = typeof itemIdParam === "string" ? itemIdParam : "";

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

  // Process history data
  const processedData = useMemo(() => {
    if (!detailLedgerItem) {
      return {
        historyData: [],
        totalItems: 0,
      };
    }

    const histories = detailLedgerItem.item_status_histories || [];

    // Transform history data
    const transformedData: ItemHistoryEntry[] = histories.map(
      (history: ItemStatusHistoryType, index: number) => {
        const operatorName = history.editor
          ? `${history.editor.first_name || ""} ${history.editor.last_name || ""}`.trim()
          : notAvailableLabel;

        const stockMovement = history.new_stock_movement;

        return {
          images: stockMovement?.image_urls || [],
          lastUpdate: history.changed_at
            ? formatDateTime(history.changed_at)
            : notAvailableLabel,
          movementType: stockMovement?.stock_movement_type?.name || "-",
          no: (index + 1).toString(),
          note: stockMovement?.note || "-",
          operator: operatorName || notAvailableLabel,
          quantity: stockMovement?.quantity ? stockMovement.quantity.toString() : "-",
          section: history.item?.section?.name || stockMovement?.section?.name || notAvailableLabel,
          status: history.new_status?.name || "UNKNOWN",
          stockMovementId: stockMovement?.id || null,
          store: stockMovement?.store_name || notAvailableLabel,
        };
      }
    );

    const totalItems = transformedData.length;

    // Apply pagination
    const startIndex = (currentPage - 1) * localItemsPerPage;
    const endIndex = startIndex + localItemsPerPage;
    const paginatedData = transformedData.slice(startIndex, endIndex);

    return {
      historyData: paginatedData,
      totalItems,
    };
  }, [detailLedgerItem, currentPage, localItemsPerPage, notAvailableLabel]);

  const value: ItemHistoryContextType = {
    currentPage,
    historyData: processedData.historyData,
    isError,
    isLoading,
    itemData: detailLedgerItem || null,
    itemsPerPage: localItemsPerPage,
    setCurrentPage,
    skuData: detailLedgerItem ? transformSkuData(detailLedgerItem.sku) : null,
    totalItems: processedData.totalItems,
  };

  return (
    <ItemHistoryContext.Provider value={value}>
      {children}
    </ItemHistoryContext.Provider>
  );
};

export const useItemHistory = (): ItemHistoryContextType => {
  const context = useContext(ItemHistoryContext);
  if (!context) {
    throw new Error(
      "useItemHistory must be used within an ItemHistoryProvider"
    );
  }
  return context;
};
