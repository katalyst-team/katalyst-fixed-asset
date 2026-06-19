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

import { useInboundPenerimaanLogStore } from "./store";

interface UseInboundPenerimaanLogReturn {
  inboundPenerimaanLogData: StockMovementItem[];
  isLoadingInboundPenerimaanLogData: boolean;
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
}

export const useInboundPenerimaanLog = (): UseInboundPenerimaanLogReturn => {
  const { tokenPayload } = useUser();

  const itemLimit = useInboundPenerimaanLogStore((state) => state.itemLimit);
  const filters = useInboundPenerimaanLogStore(useShallow((state) => state.filters));
  const selectedStoreId = useInboundPenerimaanLogStore((state) => state.selectedStoreId);

  const organizationId = tokenPayload?.organization_id || "";

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoryDataQuery({ organizationId });

  const kayuBulatCategoryIds = useMemo(() => {
    const categories = categoryData?.data?.categories ?? [];
    return categories
      .filter((c) => c.name.toUpperCase().startsWith("KAYU BULAT"))
      .map((c) => c.id);
  }, [categoryData]);

  const effectiveStoreId = selectedStoreId;

  const {
    data: stockMovementTypesData,
    isLoading: isLoadingStockMovementTypes,
  } = useGetStockMovementTypesQuery({
    organizationId,
  });

  const inboundPenerimaanLogTypeIds = useMemo(() => {
    return (
      stockMovementTypesData
        ?.filter((type: StockMovementType) => type.name === StockMovementTypeNameEnum.PENERIMAAN_LOG_INBOUND)
        .map((type: StockMovementType) => type.id) || []
    );
  }, [stockMovementTypesData]);

  const requestFilters = useMemo(
    () => ({
      ...filters,
      limit: itemLimit,
      parent_category_ids: kayuBulatCategoryIds.length > 0 ? kayuBulatCategoryIds : undefined,
      stock_movement_type_ids:
        filters.stock_movement_type_ids &&
        filters.stock_movement_type_ids.length > 0
          ? filters.stock_movement_type_ids
          : inboundPenerimaanLogTypeIds.length > 0
            ? inboundPenerimaanLogTypeIds
            : undefined,
    }),
    [filters, inboundPenerimaanLogTypeIds, itemLimit, kayuBulatCategoryIds],
  );

  const { data, isFetching, isLoading } = useGetStockMovementDataQuery({
    enabled:
      !isLoadingStockMovementTypes &&
      inboundPenerimaanLogTypeIds.length > 0 &&
      kayuBulatCategoryIds.length > 0,
    filters: requestFilters,
    organizationId,
    storeId: effectiveStoreId,
  });

  return {
    inboundPenerimaanLogData: data?.data?.stock_movements || [],
    isLoadingInboundPenerimaanLogData:
      isCategoryLoading || isLoading || isFetching || isLoadingStockMovementTypes,
    nextCursor: data?.pagination?.next_cursor ?? undefined,
    prevCursor: data?.pagination?.prev_cursor ?? undefined,
    totalCount: data?.pagination?.total_count ?? undefined,
  };
};
