"use client";

import { useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import { useGetProductDataQuery } from "@/hooks/api/product/useGetProductDataQuery";
import useGetStatusDataQuery from "@/hooks/api/status/useGetStatusDataQuery";
import { SkuItemType } from "@/types/sku";
import { isNagatechSyncOrganization } from "@/utils/nagatechSync";

import { useLedgerProductStore } from "./store";

interface UseLedgerProductReturn {
  isLoadingLedgerProductData: boolean;
  ledgerProductData: SkuItemType[];
  paginationData: { next_cursor?: string | null; prev_cursor?: string | null; total_count?: number | null } | undefined;
}

export const useLedgerProduct = (): UseLedgerProductReturn => {
  const { tokenPayload, selectedTeam } = useUser();

  const itemLimit = useLedgerProductStore((state) => state.itemLimit);
  const filters = useLedgerProductStore(useShallow((state) => state.filters));
  const setFilters = useLedgerProductStore((state) => state.setFilters);

  const organizationId = tokenPayload?.organization_id || "";

  // Check if organization is Nagatech sync enabled - only they get WAITING_PRINT as default filter
  const isNagatechSyncEnabled = isNagatechSyncOrganization(organizationId);

  // Fetch status data to get default WAITING_PRINT status ID (only for Nagatech sync org)
  const { data: statusData } = useGetStatusDataQuery({
    organizationId,
  });

  const hasAppliedDefaults = useRef(false);
  // Initialize WAITING_PRINT status ID when status data is available (only for Nagatech sync org)
  useEffect(() => {
    if (!isNagatechSyncEnabled) {
      return;
    }

    // If we've already applied defaults (or decided not to), don't do it again
    // This allows the user to uncheck the filter without it coming back
    if (hasAppliedDefaults.current) {
      return;
    }

    if (!statusData?.data?.statuses) {
      return;
    }

    // If there are already filters, we consider defaults "handled" (don't override user choice)
    // But we strictly want to set the default only if it's the *initial* empty state
    if (filters.item_status_ids && filters.item_status_ids.length > 0) {
      hasAppliedDefaults.current = true;
      return;
    }

    const waitingPrintStatus = statusData.data.statuses.find(
      (status) => status.name === "WAITING_PRINT",
    );

    if (waitingPrintStatus) {
      setFilters((prev) => ({
        ...prev,
        item_status_ids: [waitingPrintStatus.id],
      }));
      hasAppliedDefaults.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(filters.item_status_ids),
    isNagatechSyncEnabled,
    setFilters,
    statusData,
  ]);

  const requestFilters = useMemo(
    () => ({
      ...filters,
      assigned_store_id:
        filters.assigned_store_id && filters.assigned_store_id !== "0"
          ? filters.assigned_store_id
          : selectedTeam !== "0"
            ? selectedTeam
            : undefined,
      limit: itemLimit,
    }),
    [filters, selectedTeam, itemLimit],
  );

  const { data, isLoading, isFetching } = useGetProductDataQuery({
    filters: requestFilters,
    organizationId,
  });

  return {
    isLoadingLedgerProductData: isLoading || isFetching,
    ledgerProductData: data?.data?.skus || [],
    paginationData: data?.pagination,
  };
};
