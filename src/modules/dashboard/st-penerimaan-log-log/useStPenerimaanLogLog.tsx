"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { useGetProductDataQuery } from "@/hooks/api/product/useGetProductDataQuery";
import useGetStatusDataQuery from "@/hooks/api/status/useGetStatusDataQuery";
import { SkuItemType } from "@/types/sku";

import { useStPenerimaanLogLogStore } from "./store";

interface UseStPenerimaanLogLogReturn {
  stPenerimaanLogLogData: SkuItemType[];
  isLoadingStPenerimaanLogLogData: boolean;
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
}

export const useStPenerimaanLogLog = (): UseStPenerimaanLogLogReturn => {
  const { tokenPayload } = useUser();

  const itemLimit = useStPenerimaanLogLogStore((state) => state.itemLimit);
  const filters = useStPenerimaanLogLogStore(useShallow((state) => state.filters));
  const setFilters = useStPenerimaanLogLogStore((state) => state.setFilters);

  const organizationId = tokenPayload?.organization_id || "";

  // Fetch category data to find all categories with "KBM Kategori ST KERING" or "SAWN TIMBER" prefix (no limit = fetch all)
  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoryDataQuery({ organizationId });

  const stPenerimaanLogLogCategoryIds = useMemo(() => {
    const categories = categoryData?.data?.categories ?? [];
    return categories
      .filter(
        (c) =>
          c.name.startsWith("KBM Kategori ST KERING") ||
          c.name.startsWith("SAWN TIMBER"),
      )
      .map((c) => c.id);
  }, [categoryData]);

  // Fetch status data to get WAITING_INBOUND status ID
  const { data: statusData } = useGetStatusDataQuery({
    organizationId,
  });

  const hasAppliedDefaults = useRef(false);
  const [defaultsReady, setDefaultsReady] = useState(false);

  // Initialize WAITING_INBOUND status ID when status data is available
  useEffect(() => {
    // If we've already applied defaults, don't do it again
    if (hasAppliedDefaults.current) {
      return;
    }

    if (!statusData?.data?.statuses) {
      return;
    }

    // If there are already item_status_ids, we consider defaults "handled"
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
      parent_category_ids: stPenerimaanLogLogCategoryIds.length > 0 ? stPenerimaanLogLogCategoryIds : undefined,
    }),
    [filters, itemLimit, stPenerimaanLogLogCategoryIds],
  );

  const { data, isLoading, isFetching } = useGetProductDataQuery({
    enabled: stPenerimaanLogLogCategoryIds.length > 0 && defaultsReady,
    filters: requestFilters,
    organizationId,
  });

  return {
    isLoadingStPenerimaanLogLogData: isCategoryLoading || isLoading || isFetching,
    nextCursor: data?.pagination?.next_cursor ?? undefined,
    prevCursor: data?.pagination?.prev_cursor ?? undefined,
    stPenerimaanLogLogData: data?.data?.skus || [],
    totalCount: data?.pagination?.total_count ?? undefined,
  };
};
