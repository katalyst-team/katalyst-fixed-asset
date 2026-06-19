"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { useGetProductDataQuery } from "@/hooks/api/product/useGetProductDataQuery";
import useGetStatusDataQuery from "@/hooks/api/status/useGetStatusDataQuery";
import { SkuItemType } from "@/types/sku";

import { useStBasahLogStore } from "./store";

interface UseStBasahLogReturn {
  stBasahLogData: SkuItemType[];
  isLoadingStBasahLogData: boolean;
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
}

export const useStBasahLog = (): UseStBasahLogReturn => {
  const { tokenPayload } = useUser();

  const itemLimit = useStBasahLogStore((state) => state.itemLimit);
  const filters = useStBasahLogStore(useShallow((state) => state.filters));
  const setFilters = useStBasahLogStore((state) => state.setFilters);

  const organizationId = tokenPayload?.organization_id || "";

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoryDataQuery({ organizationId });

  const stBasahCategoryIds = useMemo(() => {
    const categories = categoryData?.data?.categories ?? [];
    return categories
      .filter(
        (c) =>
          c.name.startsWith("KBM Kategori ST BASAH") ||
          c.name.startsWith("SAWN TIMBER"),
      )
      .map((c) => c.id);
  }, [categoryData]);

  const { data: statusData } = useGetStatusDataQuery({
    organizationId,
  });

  const hasAppliedDefaults = useRef(false);
  const [defaultsReady, setDefaultsReady] = useState(false);

  const itemStatusIdsString = JSON.stringify(filters.item_status_ids);

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
    itemStatusIdsString,
    setFilters,
    statusData,
  ]);

  const requestFilters = useMemo(
    () => ({
      ...filters,
      limit: itemLimit,
      parent_category_ids: stBasahCategoryIds.length > 0 ? stBasahCategoryIds : undefined,
    }),
    [filters, itemLimit, stBasahCategoryIds],
  );

  const { data, isLoading, isFetching } = useGetProductDataQuery({
    enabled: stBasahCategoryIds.length > 0 && defaultsReady,
    filters: requestFilters,
    organizationId,
  });

  return {
    isLoadingStBasahLogData: isCategoryLoading || isLoading || isFetching,
    nextCursor: data?.pagination?.next_cursor ?? undefined,
    prevCursor: data?.pagination?.prev_cursor ?? undefined,
    stBasahLogData: data?.data?.skus || [],
    totalCount: data?.pagination?.total_count ?? undefined,
  };
};
