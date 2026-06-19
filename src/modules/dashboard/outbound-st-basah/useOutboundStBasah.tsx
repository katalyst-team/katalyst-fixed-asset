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

import { useOutboundStBasahStore } from "./store";

interface UseOutboundStBasahReturn {
  outboundStBasahData: StockMovementItem[];
  isLoadingOutboundStBasahData: boolean;
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
}

export const useOutboundStBasah = (): UseOutboundStBasahReturn => {
  const { tokenPayload, selectedTeam } = useUser();

  const itemLimit = useOutboundStBasahStore((state) => state.itemLimit);
  const filters = useOutboundStBasahStore(useShallow((state) => state.filters));
  const selectedStoreId = useOutboundStBasahStore((state) => state.selectedStoreId);
  const setSelectedStoreId = useOutboundStBasahStore(
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
          c.name.startsWith("SAWN TIMBER BASAH"),
      )
      .map((c) => c.id);
  }, [categoryData]);

  useEffect(() => {
    if (selectedTeam && selectedTeam !== "0" && selectedStoreId === "0") {
      setSelectedStoreId(selectedTeam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam]);

  const effectiveStoreId =
    selectedStoreId !== "0" ? selectedStoreId : selectedTeam;

  const {
    data: stockMovementTypesData,
    isLoading: isLoadingStockMovementTypes,
  } = useGetStockMovementTypesQuery({
    organizationId,
  });

  const outboundStBasahTypeIds = useMemo(() => {
    return (
      stockMovementTypesData
        ?.filter((type: StockMovementType) => type.name === StockMovementTypeNameEnum.ST_BASAH_OUTBOUND)
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
          : outboundStBasahTypeIds.length > 0
            ? outboundStBasahTypeIds
            : undefined,
    }),
    [filters, outboundStBasahTypeIds, itemLimit, stBasahCategoryIds],
  );

  const { data, isFetching, isLoading } = useGetStockMovementDataQuery({
    enabled:
      !isLoadingStockMovementTypes &&
      outboundStBasahTypeIds.length > 0 &&
      stBasahCategoryIds.length > 0,
    filters: requestFilters,
    organizationId,
    storeId: effectiveStoreId,
  });

  return {
    isLoadingOutboundStBasahData:
      isCategoryLoading || isLoading || isFetching || isLoadingStockMovementTypes,
    nextCursor: data?.pagination?.next_cursor ?? undefined,
    outboundStBasahData: data?.data?.stock_movements || [],
    prevCursor: data?.pagination?.prev_cursor ?? undefined,
    totalCount: data?.pagination?.total_count ?? undefined,
  };
};
