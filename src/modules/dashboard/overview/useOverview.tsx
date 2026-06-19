"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useUser } from "@/context/user-context";
import useGetDashboardMetricConfigsValuesQuery from "@/hooks/api/dashboard/useGetDashboardMetricConfigsValuesQuery";
import useGetDashboardOverviewQuery from "@/hooks/api/dashboard/useGetDashboardOverviewQuery";
import useGetInventoryTrendQuery from "@/hooks/api/dashboard/useGetInventoryTrendQuery";
import useGetStockMovementTrendQuery from "@/hooks/api/dashboard/useGetStockMovementTrendQuery";
import { IntervalType } from "@/services/dashboard/getInventoryTrendService";

interface OverviewFilters {
  store_ids?: string;
  sku_ids?: string;
  interval?: IntervalType;
  start_date?: string;
  end_date?: string;
}

interface OverviewContextType {
  // Filter state
  filters: OverviewFilters;
  setFilters: (filters: OverviewFilters) => void;
  updateFilter: (key: keyof OverviewFilters, value: string | undefined) => void;

  // Data queries
  inventoryTrendData: ReturnType<typeof useGetInventoryTrendQuery>;
  metricConfigsValuesData: ReturnType<typeof useGetDashboardMetricConfigsValuesQuery>;
  overviewData: ReturnType<typeof useGetDashboardOverviewQuery>;
  stockMovementTrendData: ReturnType<typeof useGetStockMovementTrendQuery>;

  // Store state
  stores: { id: string; name: string }[];
  hasMultipleStores: boolean;

  // Loading states
  isLoading: boolean;

  // Computed values
  inventoryAccuracy: number;
}

const OverviewContext = createContext<OverviewContextType | null>(null);

export const useOverview = () => {
  const context = useContext(OverviewContext);
  if (!context) {
    throw new Error("useOverview must be used within an OverviewProvider");
  }
  return context;
};

interface OverviewProviderProps {
  children: React.ReactNode;
}

export const OverviewProvider: React.FC<OverviewProviderProps> = ({
  children,
}) => {
  const { tokenPayload, stores, hasMultipleStores, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  // Filter state — store_ids synced from selectedTeam once it resolves
  const [filters, setFilters] = useState<OverviewFilters>({ interval: "1M" });
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !selectedTeam) return;
    initializedRef.current = true;
    setFilters((prev) => ({
      ...prev,
      store_ids: !hasMultipleStores && selectedTeam !== "0" ? selectedTeam : undefined,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam]);

  const updateFilter = (
    key: keyof OverviewFilters,
    value: string | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Data queries
  const overviewData = useGetDashboardOverviewQuery({
    filters: {
      sku_ids: filters.sku_ids,
      store_ids: filters.store_ids,
    },
    organizationId,
  });

  const inventoryTrendData = useGetInventoryTrendQuery({
    filters: {
      end_date: filters.end_date,
      interval: filters.interval,
      sku_ids: filters.sku_ids,
      start_date: filters.start_date,
      store_ids: filters.store_ids,
    },
    organizationId,
  });

  const stockMovementTrendData = useGetStockMovementTrendQuery({
    filters: {
      end_date: filters.end_date,
      interval: filters.interval,
      sku_ids: filters.sku_ids,
      start_date: filters.start_date,
      store_ids: filters.store_ids,
    },
    organizationId,
  });

  const metricConfigsValuesData = useGetDashboardMetricConfigsValuesQuery({
    organizationId,
    store_ids: filters.store_ids,
  });

  // Loading states
  const isLoading = useMemo(() => {
    return (
      overviewData.isLoading ||
      inventoryTrendData.isLoading ||
      stockMovementTrendData.isLoading
    );
  }, [
    overviewData.isLoading,
    inventoryTrendData.isLoading,
    stockMovementTrendData.isLoading,
  ]);

  // Computed values
  const inventoryAccuracy = useMemo(() => {
    const totalItems = overviewData.data?.data?.metrics?.total_items || 0;
    const totalInbound = overviewData.data?.data?.metrics?.total_inbound || 0;
    const totalOutbound = overviewData.data?.data?.metrics?.total_outbound || 0;

    if (totalItems === 0) return 0;

    // Simple calculation - can be adjusted based on actual business logic
    const expectedItems = totalInbound - totalOutbound;
    if (expectedItems === 0) return 100;

    return Math.min(100, Math.max(0, (totalItems / expectedItems) * 100));
  }, [overviewData.data?.data?.metrics]);

  const value = useMemo<OverviewContextType>(
    () => ({
      filters,
      hasMultipleStores,
      inventoryAccuracy,
      inventoryTrendData,
      isLoading,
      metricConfigsValuesData,
      overviewData,
      setFilters,
      stockMovementTrendData,
      stores,
      updateFilter,
    }),
    [
      filters,
      hasMultipleStores,
      inventoryAccuracy,
      inventoryTrendData,
      isLoading,
      metricConfigsValuesData,
      overviewData,
      stockMovementTrendData,
      stores,
    ]
  );

  return (
    <OverviewContext.Provider value={value}>
      {children}
    </OverviewContext.Provider>
  );
};
