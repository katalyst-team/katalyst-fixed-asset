"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import { useGetSkuDataQuery } from "@/hooks/api/sku/useGetSKUDataQuery";
import { SkuItemType, SkuType } from "@/types/sku";

import { useProductStore } from "./store";

interface UseProductReturn {
  skuData: SkuItemType[];
  isLoadingProductData: boolean;
}

export const useProduct = (): UseProductReturn => {
  const { tokenPayload } = useUser();

  const itemLimit = useProductStore((state) => state.itemLimit);
  const filters = useProductStore(useShallow((state) => state.filters));

  const organizationId = tokenPayload?.organization_id || "";

  const requestFilters = useMemo(
    () => ({
      ...filters,
      item_status_ids: undefined,
      limit: itemLimit,
      type: SkuType.UNIQUE,
    }),
    [filters, itemLimit],
  );

  const { data, isLoading, isFetching } = useGetSkuDataQuery({
    enabled: Boolean(organizationId),
    filters: requestFilters,
    organizationId,
  });

  return {
    isLoadingProductData: isLoading || isFetching,
    skuData: data?.data?.skus || [],
  };
};
