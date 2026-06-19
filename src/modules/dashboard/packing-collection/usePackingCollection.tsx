"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import useGetPackingCollectionDataQuery from "@/hooks/api/packing-collection/useGetPackingCollectionDataQuery";
import { PackingCollectionItemType } from "@/types/packing-collection";

import { usePackingCollectionStore } from "./store/PackingCollectionStore";

interface UsePackingCollectionReturn {
  packingCollectionData: PackingCollectionItemType[];
  isLoadingPackingCollectionData: boolean;
}

export const usePackingCollection = (): UsePackingCollectionReturn => {
  const { tokenPayload } = useUser();
  const itemsPerPage = usePackingCollectionStore((state) => state.itemLimit);
  const filters = usePackingCollectionStore(
    useShallow((state) => state.filters)
  );

  const requestFilters = useMemo(
    () => ({
      ...filters,
      cursor: filters.cursor ?? undefined,
      limit: itemsPerPage,
    }),
    [filters, itemsPerPage]
  );

  const organizationId = tokenPayload?.organization_id || "";
  const { data, isLoading, isFetching } = useGetPackingCollectionDataQuery({
    filters: requestFilters,
    organizationId,
  });

  return {
    isLoadingPackingCollectionData: isLoading || isFetching,
    packingCollectionData: data?.data?.packing_collections || [],
  };
};
