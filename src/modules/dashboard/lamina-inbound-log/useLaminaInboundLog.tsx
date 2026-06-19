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
  StockMovementTypeNameEnum,
} from "@/services/stockMovement/getStockMovementDataService";

import { useLaminaInboundLogStore } from "./store";

interface UseLaminaInboundLogReturn {
  laminaInboundLogData: StockMovementItem[];
  isLoadingLaminaInboundLogData: boolean;
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
}

export const useLaminaInboundLog = (): UseLaminaInboundLogReturn => {
  const { tokenPayload } = useUser();

  const itemLimit = useLaminaInboundLogStore((state) => state.itemLimit);
  const filters = useLaminaInboundLogStore(useShallow((state) => state.filters));
  const selectedStoreId = useLaminaInboundLogStore((state) => state.selectedStoreId);

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

  const inboundLogTypeIds = useMemo(() => {
    return (
      stockMovementTypesData
        ?.filter((type: StockMovementType) => type.name === StockMovementTypeNameEnum.LAMINA_INBOUND)
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
          : inboundLogTypeIds.length > 0
            ? inboundLogTypeIds
            : undefined,
    }),
    [filters, inboundLogTypeIds, itemLimit, laminaCategoryIds],
  );

  const { data, isFetching, isLoading } = useGetStockMovementDataQuery({
    enabled:
      !isLoadingStockMovementTypes &&
      inboundLogTypeIds.length > 0 &&
      laminaCategoryIds.length > 0,
    filters: requestFilters,
    organizationId,
    storeId: effectiveStoreId,
  });

  return {
    isLoadingLaminaInboundLogData:
      isCategoryLoading || isLoading || isFetching || isLoadingStockMovementTypes,
    laminaInboundLogData: data?.data?.stock_movements || [],
    nextCursor: data?.pagination?.next_cursor ?? undefined,
    prevCursor: data?.pagination?.prev_cursor ?? undefined,
    totalCount: data?.pagination?.total_count ?? undefined,
  };
};
