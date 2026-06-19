"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { useGetProductDataQuery } from "@/hooks/api/product/useGetProductDataQuery";
import useGetStatusDataQuery from "@/hooks/api/status/useGetStatusDataQuery";
import { SkuItemType } from "@/types/sku";

import { useLaminaLogStore } from "./store";

interface UseLaminaLogReturn {
  laminaLogData: SkuItemType[];
  isLoadingLaminaLogData: boolean;
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
}

export const useLaminaLog = (): UseLaminaLogReturn => {
  const { tokenPayload } = useUser();

  const itemLimit = useLaminaLogStore((state) => state.itemLimit);
  const filters = useLaminaLogStore(useShallow((state) => state.filters));
  const setFilters = useLaminaLogStore((state) => state.setFilters);

  const organizationId = tokenPayload?.organization_id || "";

  // Fetch category data to find all categories with "LAMINA" prefix (no limit = fetch all)
  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoryDataQuery({ organizationId });

  const laminaCategoryIds = useMemo(() => {
    const categories = categoryData?.data?.categories ?? [];
    return categories
      .filter((c) => c.name.startsWith("LAMINA"))
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
      parent_category_ids:
        filters.parent_category_ids && filters.parent_category_ids.length > 0
          ? filters.parent_category_ids
          : laminaCategoryIds.length > 0
            ? laminaCategoryIds
            : undefined,
    }),
    [filters, itemLimit, laminaCategoryIds],
  );

  const { data, isLoading, isFetching } = useGetProductDataQuery({
    enabled: laminaCategoryIds.length > 0 && defaultsReady,
    filters: requestFilters,
    organizationId,
  });

  return {
    isLoadingLaminaLogData: isCategoryLoading || isLoading || isFetching,
    laminaLogData: data?.data?.skus || [],
    nextCursor: data?.pagination?.next_cursor ?? undefined,
    prevCursor: data?.pagination?.prev_cursor ?? undefined,
    totalCount: data?.pagination?.total_count ?? undefined,
  };
};
