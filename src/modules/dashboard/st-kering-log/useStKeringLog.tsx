"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { useGetProductDataQuery } from "@/hooks/api/product/useGetProductDataQuery";
import useGetStatusDataQuery from "@/hooks/api/status/useGetStatusDataQuery";
import { SkuItemType } from "@/types/sku";

import { useStKeringLogStore } from "./store";

const ATTR_NAME_TANGGAL_POTONG = "Tanggal Potong";

interface UseStKeringLogReturn {
  stKeringLogData: SkuItemType[];
  isLoadingStKeringLogData: boolean;
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
  tanggalPotongAttrId: string | null;
  isCut: (sku: SkuItemType) => boolean;
}

export const useStKeringLog = (): UseStKeringLogReturn => {
  const { tokenPayload } = useUser();

  const itemLimit = useStKeringLogStore((state) => state.itemLimit);
  const filters = useStKeringLogStore(useShallow((state) => state.filters));
  const setFilters = useStKeringLogStore((state) => state.setFilters);

  const organizationId = tokenPayload?.organization_id || "";

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoryDataQuery({ organizationId });

  const stKeringCategories = useMemo(() => {
    const categories = categoryData?.data?.categories ?? [];
    return categories
      .filter(
        (c) =>
          c.name.startsWith("KBM Kategori ST KERING") ||
          c.name.startsWith("SAWN TIMBER"),
      );
  }, [categoryData]);

  const tanggalPotongAttrId = useMemo(() => {
    for (const cat of stKeringCategories) {
      const attrItem = cat.attribute_items?.find(
        (ai: { attribute: { name: string } }) => ai.attribute.name === ATTR_NAME_TANGGAL_POTONG,
      );
      if (attrItem) return attrItem.attribute.id;
    }
    return null;
  }, [stKeringCategories]);

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

    const waitingInbound = statusData.data.statuses.find(
      (status) => status.name === "WAITING_INBOUND",
    );

    const ids: string[] = [];
    if (waitingInbound) ids.push(waitingInbound.id);

    if (ids.length > 0) {
      setFilters((prev) => ({
        ...prev,
        item_status_ids: ids,
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

  const stKeringCategoryIds = useMemo(
    () => stKeringCategories.map((c) => c.id),
    [stKeringCategories],
  );

  const requestFilters = useMemo(
    () => ({
      ...filters,
      limit: itemLimit,
      parent_category_ids: stKeringCategoryIds.length > 0 ? stKeringCategoryIds : undefined,
    }),
    [filters, itemLimit, stKeringCategoryIds],
  );

  const { data, isLoading, isFetching } = useGetProductDataQuery({
    enabled: stKeringCategoryIds.length > 0 && defaultsReady,
    filters: requestFilters,
    organizationId,
  });

  const isCut = useMemo(() => {
    if (!tanggalPotongAttrId) return () => false;
    return (sku: SkuItemType) => {
      const attr = sku.attributes?.find(
        (a) => a.attribute_id === tanggalPotongAttrId,
      );
      const values = attr?.values ?? attr?.Values ?? [];
      return values.length > 0 && values.some((v) => v !== "");
    };
  }, [tanggalPotongAttrId]);

  const stKeringLogData = useMemo(() => {
    return data?.data?.skus || [];
  }, [data?.data?.skus]);

  return {
    isCut,
    isLoadingStKeringLogData: isCategoryLoading || isLoading || isFetching,
    nextCursor: data?.pagination?.next_cursor ?? undefined,
    prevCursor: data?.pagination?.prev_cursor ?? undefined,
    stKeringLogData,
    tanggalPotongAttrId,
    totalCount: data?.pagination?.total_count ?? undefined,
  };
};
