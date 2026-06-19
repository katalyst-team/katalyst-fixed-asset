"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import useGetStockMovementDataQuery from "@/hooks/api/stockMovement/useGetStockMovementDataQuery";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import {
  StockMovementItem,
  StockMovementType,
} from "@/services/stockMovement/getStockMovementDataService";

import { useLaminaOutboundLogStore } from "./store";

interface UseLaminaOutboundLogReturn {
  outboundLogData: StockMovementItem[];
  isLoadingOutboundLogData: boolean;
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
}

export const useLaminaOutboundLog = (): UseLaminaOutboundLogReturn => {
  const { tokenPayload } = useUser();

  const itemLimit = useLaminaOutboundLogStore((state) => state.itemLimit);
  const filters = useLaminaOutboundLogStore(useShallow((state) => state.filters));
  const selectedStoreId = useLaminaOutboundLogStore((state) => state.selectedStoreId);

  const organizationId = tokenPayload?.organization_id || "";

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoryDataQuery({ organizationId });

  const laminaCategoryIds = useMemo(() => {
    const categories = categoryData?.data?.categories ?? [];
    return categories
      .filter((c) => c.name.startsWith("LAMINA"))
      .map((c) => c.id);
  }, [categoryData]);

  const effectiveStoreId = selectedStoreId;

  const {
    data: stockMovementTypesData,
    isLoading: isLoadingStockMovementTypes,
  } = useGetStockMovementTypesQuery({
    organizationId,
  });

  const outboundLogTypeIds = useMemo(() => {
    return (
      stockMovementTypesData
        ?.filter((type: StockMovementType) => type.name === "LAMINA_OUTBOUND")
        .map((type: StockMovementType) => type.id) || []
    );
  }, [stockMovementTypesData]);

  const requestFilters = useMemo(
    () => ({
      ...filters,
      limit: itemLimit,
      parent_category_ids:
        filters.parent_category_ids && filters.parent_category_ids.length > 0
          ? filters.parent_category_ids
          : laminaCategoryIds.length > 0
            ? laminaCategoryIds
            : undefined,
      stock_movement_type_ids:
        filters.stock_movement_type_ids &&
        filters.stock_movement_type_ids.length > 0
          ? filters.stock_movement_type_ids
          : outboundLogTypeIds.length > 0
            ? outboundLogTypeIds
            : undefined,
    }),
    [filters, laminaCategoryIds, outboundLogTypeIds, itemLimit],
  );

  const { data, isFetching, isLoading } = useGetStockMovementDataQuery({
    enabled:
      !isLoadingStockMovementTypes &&
      outboundLogTypeIds.length > 0 &&
      laminaCategoryIds.length > 0,
    filters: requestFilters,
    organizationId,
    storeId: effectiveStoreId,
  });

  return {
    isLoadingOutboundLogData:
      isCategoryLoading || isLoading || isFetching || isLoadingStockMovementTypes,
    nextCursor: data?.pagination?.next_cursor ?? undefined,
    outboundLogData: data?.data?.stock_movements || [],
    prevCursor: data?.pagination?.prev_cursor ?? undefined,
    totalCount: data?.pagination?.total_count ?? undefined,
  };
};
