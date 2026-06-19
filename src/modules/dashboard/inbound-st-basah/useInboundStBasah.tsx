"use client";

import { useEffect, useMemo } from "react";
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

import { useInboundStBasahStore } from "./store";

interface UseInboundStBasahReturn {
  inboundStBasahData: StockMovementItem[];
  isLoadingInboundStBasahData: boolean;
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
}

export const useInboundStBasah = (): UseInboundStBasahReturn => {
  const { tokenPayload, selectedTeam } = useUser();

  const itemLimit = useInboundStBasahStore((state) => state.itemLimit);
  const filters = useInboundStBasahStore(useShallow((state) => state.filters));
  const selectedStoreId = useInboundStBasahStore((state) => state.selectedStoreId);
  const setSelectedStoreId = useInboundStBasahStore(
    (state) => state.setSelectedStoreId,
  );

  const organizationId = tokenPayload?.organization_id || "";

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoryDataQuery({ organizationId });

  const stBasahCategoryIds = useMemo(() => {
    const categories = categoryData?.data?.categories ?? [];
    return categories
      .filter(
        (c) =>
          c.name.startsWith("KBM Kategori ST BASAH") ||
          c.name.startsWith("SAWN TIMBER"),
      )
      .map((c) => c.id);
  }, [categoryData]);

  useEffect(() => {
    if (selectedTeam && selectedTeam !== "0" && selectedStoreId === "0") {
      setSelectedStoreId(selectedTeam);
    }
  }, [selectedTeam, selectedStoreId, setSelectedStoreId]);

  const effectiveStoreId =
    selectedStoreId !== "0" ? selectedStoreId : selectedTeam;

  const {
    data: stockMovementTypesData,
    isLoading: isLoadingStockMovementTypes,
  } = useGetStockMovementTypesQuery({
    organizationId,
  });

  const inboundStBasahTypeIds = useMemo(() => {
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
      parent_category_ids: stBasahCategoryIds.length > 0 ? stBasahCategoryIds : undefined,
      stock_movement_type_ids:
        filters.stock_movement_type_ids &&
        filters.stock_movement_type_ids.length > 0
          ? filters.stock_movement_type_ids
          : inboundStBasahTypeIds.length > 0
            ? inboundStBasahTypeIds
            : undefined,
    }),
    [filters, inboundStBasahTypeIds, itemLimit, stBasahCategoryIds],
  );

  const { data, isFetching, isLoading } = useGetStockMovementDataQuery({
    enabled:
      !isLoadingStockMovementTypes &&
      inboundStBasahTypeIds.length > 0 &&
      stBasahCategoryIds.length > 0,
    filters: requestFilters,
    organizationId,
    storeId: effectiveStoreId,
  });

  return {
    inboundStBasahData: data?.data?.stock_movements || [],
    isLoadingInboundStBasahData:
      isCategoryLoading || isLoading || isFetching || isLoadingStockMovementTypes,
    nextCursor: data?.pagination?.next_cursor ?? undefined,
    prevCursor: data?.pagination?.prev_cursor ?? undefined,
    totalCount: data?.pagination?.total_count ?? undefined,
  };
};
