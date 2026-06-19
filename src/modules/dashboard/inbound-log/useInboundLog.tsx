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

import { useInboundLogStore } from "./store";

interface UseInboundLogReturn {
  inboundLogData: StockMovementItem[];
  isLoadingInboundLogData: boolean;
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
}

export const useInboundLog = (): UseInboundLogReturn => {
  const { tokenPayload } = useUser();

  const itemLimit = useInboundLogStore((state) => state.itemLimit);
  const filters = useInboundLogStore(useShallow((state) => state.filters));
  const selectedStoreId = useInboundLogStore((state) => state.selectedStoreId);

  const organizationId = tokenPayload?.organization_id || "";

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoryDataQuery({ organizationId });

  const stKeringCategoryIds = useMemo(() => {
    const categories = categoryData?.data?.categories ?? [];
    return categories
      .filter(
        (c) =>
          c.name.startsWith("KBM Kategori ST KERING") ||
          c.name.startsWith("SAWN TIMBER"),
      )
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
        ?.filter((type: StockMovementType) => type.name === StockMovementTypeNameEnum.ST_KERING_STORED)
        .map((type: StockMovementType) => type.id) || []
    );
  }, [stockMovementTypesData]);

  const requestFilters = useMemo(
    () => ({
      ...filters,
      limit: itemLimit,
      parent_category_ids: stKeringCategoryIds.length > 0 ? stKeringCategoryIds : undefined,
      stock_movement_type_ids:
        filters.stock_movement_type_ids &&
        filters.stock_movement_type_ids.length > 0
          ? filters.stock_movement_type_ids
          : inboundLogTypeIds.length > 0
            ? inboundLogTypeIds
            : undefined,
    }),
    [filters, inboundLogTypeIds, itemLimit, stKeringCategoryIds],
  );

  const { data, isFetching, isLoading } = useGetStockMovementDataQuery({
    enabled:
      !isLoadingStockMovementTypes &&
      inboundLogTypeIds.length > 0 &&
      stKeringCategoryIds.length > 0,
    filters: requestFilters,
    organizationId,
    storeId: effectiveStoreId,
  });

  return {
    inboundLogData: data?.data?.stock_movements || [],
    isLoadingInboundLogData:
      isCategoryLoading || isLoading || isFetching || isLoadingStockMovementTypes,
    nextCursor: data?.pagination?.next_cursor ?? undefined,
    prevCursor: data?.pagination?.prev_cursor ?? undefined,
    totalCount: data?.pagination?.total_count ?? undefined,
  };
};
