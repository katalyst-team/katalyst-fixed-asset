"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import useGetAttributeDataQuery from "@/hooks/api/attribute/useGetAttributeDataQuery";
import { AttributeItemType } from "@/types/attribute";

import { useAttributeStore } from "./store/AttributeStore";

interface UseAttributeV2Return {
  attributeData: AttributeItemType[];
  isLoadingAttributeData: boolean;
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
}

export const useAttribute = (): UseAttributeV2Return => {
  const { tokenPayload } = useUser();

  const itemsPerPage = useAttributeStore((state) => state.itemLimit);
  const filters = useAttributeStore(useShallow((state) => state.filters));

  const requestFilters = useMemo(
    () => ({
      ...filters,
      cursor: filters.cursor ?? undefined,
      limit: itemsPerPage,
      query: filters.query || undefined,
    }),
    [filters, itemsPerPage]
  );

  const organizationId = tokenPayload?.organization_id || "";
  const { data, isFetching, isLoading } = useGetAttributeDataQuery({
    ...requestFilters,
    organizationId,
  });

  return {
    attributeData: data?.data?.attributes || [],
    isLoadingAttributeData: isLoading || isFetching,
    nextCursor: data?.pagination?.next_cursor || undefined,
    prevCursor: data?.pagination?.prev_cursor || undefined,
    totalCount: data?.pagination?.total_count ?? undefined,
  };
};
