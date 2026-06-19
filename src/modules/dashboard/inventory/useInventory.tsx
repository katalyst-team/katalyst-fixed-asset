"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import useGetInventoryQuery from "@/hooks/api/inventory/useGetInventoryQuery";
import { InventoryItem } from "@/types/inventory";

import { useInventoryStore } from "./store/InventoryStore";

interface UseInventoryReturn {
  inventoryData: InventoryItem[];
  isLoadingInventoryData: boolean;
}

export const useInventory = (): UseInventoryReturn => {
  const { tokenPayload } = useUser();
  const itemsPerPage = useInventoryStore((state) => state.itemLimit);
  const filters = useInventoryStore(useShallow((state) => state.filters));

  const requestFilters = useMemo(
    () => ({
      ...filters,
      cursor: filters.cursor ?? undefined,
      limit: itemsPerPage,
    }),
    [filters, itemsPerPage]
  );

  const organizationId = tokenPayload?.organization_id || "";
  const { data, isLoading, isFetching } = useGetInventoryQuery({
    filters: requestFilters,
    organizationId,
  });

  return {
    inventoryData: data?.data?.inventories || [],
    isLoadingInventoryData: isLoading || isFetching,
  };
};
