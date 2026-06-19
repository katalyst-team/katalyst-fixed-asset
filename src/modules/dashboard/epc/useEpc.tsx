"use client";

import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import useGetRfidDataQuery from "@/hooks/api/rfid/useGetRfidDataQuery";
import { RfidItemType } from "@/types/rfid";

import { useEpcStore } from "./store";

interface UseEpcReturn {
  epcData: RfidItemType[];
  isLoadingEpcData: boolean;
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
}

export const useEpc = (): UseEpcReturn => {
  const { hasMultipleStores, selectedTeam, stores, tokenPayload } = useUser();

  const itemsPerPage = useEpcStore((state) => state.itemLimit);
  const filters = useEpcStore(useShallow((state) => state.filters));
  const setFilters = useEpcStore((state) => state.setFilters);

  // Auto-select single store — also sync the Zustand store so StoreSelector shows correct value
  useEffect(() => {
    if (!hasMultipleStores && selectedTeam && selectedTeam !== "0" && !filters.assigned_store_id) {
      setFilters({ ...filters, assigned_store_id: selectedTeam });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam, stores]);

  // Derive effective store ID on first render without waiting for the effect
  const effectiveStoreId =
    filters.assigned_store_id && filters.assigned_store_id !== "0"
      ? filters.assigned_store_id
      : !hasMultipleStores && selectedTeam && selectedTeam !== "0"
        ? selectedTeam
        : undefined;

  const requestFilters = useMemo(
    () => ({
      ...filters,
      assigned_store_id: effectiveStoreId,
      limit: itemsPerPage,
    }),
    [filters, effectiveStoreId, itemsPerPage]
  );

  const organizationId = tokenPayload?.organization_id || "";
  const { data, isLoading, isFetching } = useGetRfidDataQuery({
    filters: requestFilters,
    organizationId,
  });

  return {
    epcData: data?.data?.rfids || [],
    isLoadingEpcData: isLoading || isFetching,
    nextCursor: data?.pagination?.next_cursor || undefined,
    prevCursor: data?.pagination?.prev_cursor || undefined,
    totalCount: data?.pagination?.total_count ?? undefined,
  };
};
