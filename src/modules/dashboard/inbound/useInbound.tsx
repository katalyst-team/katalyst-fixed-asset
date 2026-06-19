"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import useGetStockMovementDataQuery from "@/hooks/api/stockMovement/useGetStockMovementDataQuery";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import {
  StockMovementItem,
  StockMovementType,
} from "@/services/stockMovement/getStockMovementDataService";

import { useInboundStore } from "./store";

interface UseInboundReturn {
  inboundData: StockMovementItem[];
  isLoadingInboundData: boolean;
}

export const useInbound = (): UseInboundReturn => {
  const { tokenPayload, selectedTeam } = useUser();

  const itemLimit = useInboundStore((state) => state.itemLimit);
  const filters = useInboundStore(useShallow((state) => state.filters));

  const organizationId = tokenPayload?.organization_id || "";

  const {
    data: stockMovementTypesData,
    isLoading: isLoadingStockMovementTypes,
  } = useGetStockMovementTypesQuery({
    organizationId,
  });

  const inboundTypeIds = useMemo(
    () =>
      stockMovementTypesData
        ?.filter((type: StockMovementType) => type.direction === "INBOUND")
        .map((type: StockMovementType) => type.id) || [],
    [stockMovementTypesData]
  );

  // Determine which store ID to use for the API query
  const queryStoreId = useMemo(() => {
    if (filters.selected_store_for_section) {
      return filters.selected_store_for_section;
    }
    if (selectedTeam && selectedTeam !== "0") {
      return selectedTeam;
    }
    return selectedTeam;
  }, [filters.selected_store_for_section, selectedTeam]);

  const requestFilters = useMemo(
    () => ({
      ...filters,
      limit: itemLimit,
      stock_movement_type_ids:
        filters.stock_movement_type_ids &&
        filters.stock_movement_type_ids.length > 0
          ? filters.stock_movement_type_ids
          : inboundTypeIds.length > 0
            ? inboundTypeIds
            : undefined,
    }),
    [filters, inboundTypeIds, itemLimit]
  );

  const { data, isLoading, isFetching } = useGetStockMovementDataQuery({
    filters: requestFilters,
    organizationId,
    storeId: queryStoreId,
  });

  return {
    inboundData: data?.data?.stock_movements || [],
    isLoadingInboundData:
      isLoading || isFetching || isLoadingStockMovementTypes,
  };
};
