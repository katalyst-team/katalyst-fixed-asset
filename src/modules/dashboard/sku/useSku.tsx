"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import { useGetSkuDataQuery } from "@/hooks/api/sku/useGetSKUDataQuery";
import { SkuItemType } from "@/types/sku";

import { useSkuStore } from "./store";

interface UseSkuReturn {
  skuData: SkuItemType[];
  isLoadingSkuData: boolean;
}

export const useSku = (): UseSkuReturn => {
  const { tokenPayload } = useUser();

  const itemLimit = useSkuStore((state) => state.itemLimit);
  // Use useShallow for filters object to prevent reference change re-renders
  const filters = useSkuStore(useShallow((state) => state.filters));

  const requestFilters = useMemo(
    () => ({
      ...filters,
      limit: itemLimit,
    }),
    [filters, itemLimit],
  );

  const organizationId = tokenPayload?.organization_id || "";
  const { data, isLoading, isFetching } = useGetSkuDataQuery({
    filters: requestFilters,
    organizationId,
  });

  return {
    isLoadingSkuData: isLoading || isFetching,
    skuData: data?.data?.skus || [],
  };
};
