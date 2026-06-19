"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { useGetProductDataQuery } from "@/hooks/api/product/useGetProductDataQuery";
import useGetStatusDataQuery from "@/hooks/api/status/useGetStatusDataQuery";
import { SkuItemType } from "@/types/sku";

import { usePenerimaanLogStore } from "./store";

interface UsePenerimaanLogReturn {
  penerimaanLogData: SkuItemType[];
  isLoadingPenerimaanLogData: boolean;
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
}

export const usePenerimaanLog = (): UsePenerimaanLogReturn => {
  const { tokenPayload } = useUser();

  const itemLimit = usePenerimaanLogStore((state) => state.itemLimit);
  const filters = usePenerimaanLogStore(useShallow((state) => state.filters));
  const setFilters = usePenerimaanLogStore((state) => state.setFilters);

  const organizationId = tokenPayload?.organization_id || "";

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoryDataQuery({ organizationId });

  const kayuBulatCategoryIds = useMemo(() => {
    const categories = categoryData?.data?.categories ?? [];
    return categories
      .filter((c) => c.name.startsWith("KAYU BULAT"))
      .map((c) => c.id);
  }, [categoryData]);

  const { data: statusData } = useGetStatusDataQuery({
    organizationId,
  });

  const hasAppliedDefaults = useRef(false);
  const [defaultsReady, setDefaultsReady] = useState(false);

  useEffect(() => {
    if (hasAppliedDefaults.current) {
      return;
    }

    if (!statusData?.data?.statuses) {
      return;
    }

    if (filters.item_status_ids && filters.item_status_ids.length > 0) {
      hasAppliedDefaults.current = true;
      setDefaultsReady(true);
      return;
    }

    const waitingInboundStatus = statusData.data.statuses.find(
      (status) => status.name === "WAITING_INBOUND",
    );

    if (waitingInboundStatus) {
      setFilters((prev) => ({
        ...prev,
        item_status_ids: [waitingInboundStatus.id],
      }));
      hasAppliedDefaults.current = true;
      setDefaultsReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(filters.item_status_ids),
    setFilters,
    statusData,
  ]);

  const requestFilters = useMemo(
    () => ({
      ...filters,
      limit: itemLimit,
      parent_category_ids: kayuBulatCategoryIds.length > 0 ? kayuBulatCategoryIds : undefined,
    }),
    [filters, itemLimit, kayuBulatCategoryIds],
  );

  const { data, isLoading, isFetching } = useGetProductDataQuery({
    enabled: kayuBulatCategoryIds.length > 0 && defaultsReady,
    filters: requestFilters,
    organizationId,
  });

  return {
    isLoadingPenerimaanLogData: isCategoryLoading || isLoading || isFetching,
    nextCursor: data?.pagination?.next_cursor ?? undefined,
    penerimaanLogData: data?.data?.skus || [],
    prevCursor: data?.pagination?.prev_cursor ?? undefined,
    totalCount: data?.pagination?.total_count ?? undefined,
  };
};
