"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useUser } from "@/context/user-context";
import {
  useGetAgingStockAlertsQuery,
  useGetCriticalStockAlertsQuery,
  useGetEpcMismatchesQuery,
  useGetPendingAuditsQuery,
} from "@/hooks/api/alert/useAlertsQuery";
import useGetLowStockAlertsQuery from "@/hooks/api/alert/useLowStockAlertsQuery";
import useGetStockHealthQuery from "@/hooks/api/dashboard/useStockHealthQuery";

interface StockAlertConfigFilters {
  store_ids?: string;
  severity?: "critical" | "warning" | "all";
}

interface StockAlertConfigContextType {
  filters: StockAlertConfigFilters;
  setFilters: (filters: StockAlertConfigFilters) => void;
  updateFilter: (key: keyof StockAlertConfigFilters, value: string | undefined) => void;

  criticalStockQuery: ReturnType<typeof useGetCriticalStockAlertsQuery>;
  agingStockQuery: ReturnType<typeof useGetAgingStockAlertsQuery>;
  epcMismatchesQuery: ReturnType<typeof useGetEpcMismatchesQuery>;
  pendingAuditsQuery: ReturnType<typeof useGetPendingAuditsQuery>;
  lowStockQuery: ReturnType<typeof useGetLowStockAlertsQuery>;
  stockHealthQuery: ReturnType<typeof useGetStockHealthQuery>;

  stores: { id: string; name: string }[];
  hasMultipleStores: boolean;
  isLoading: boolean;
}

const StockAlertConfigContext = createContext<StockAlertConfigContextType | null>(null);

export const useStockAlertConfig = () => {
  const context = useContext(StockAlertConfigContext);
  if (!context) {
    throw new Error("useStockAlertConfig must be used within a StockAlertConfigProvider");
  }
  return context;
};

interface StockAlertConfigProviderProps {
  children: React.ReactNode;
}

export const StockAlertConfigProvider: React.FC<StockAlertConfigProviderProps> = ({
  children,
}) => {
  const { tokenPayload, stores, hasMultipleStores, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [filters, setFilters] = useState<StockAlertConfigFilters>({ severity: "all" });
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !selectedTeam) return;
    initializedRef.current = true;
    setFilters((prev) => ({
      ...prev,
      store_ids: !hasMultipleStores && selectedTeam !== "0" ? selectedTeam : undefined,
    }));
  }, [selectedTeam, hasMultipleStores]);

  const updateFilter = (
    key: keyof StockAlertConfigFilters,
    value: string | undefined,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const storeId = filters.store_ids;

  const criticalStockQuery = useGetCriticalStockAlertsQuery({ organizationId });
  const agingStockQuery = useGetAgingStockAlertsQuery({ organizationId });
  const epcMismatchesQuery = useGetEpcMismatchesQuery({ organizationId });
  const pendingAuditsQuery = useGetPendingAuditsQuery({ organizationId });

  const lowStockQuery = useGetLowStockAlertsQuery({
    limit: 10,
    organization_id: organizationId,
    severity: filters.severity,
    store_id: storeId,
  });

  const stockHealthQuery = useGetStockHealthQuery({
    organization_id: organizationId,
    store_id: storeId,
  });

  const isLoading = useMemo(() => {
    return (
      criticalStockQuery.isLoading ||
      agingStockQuery.isLoading ||
      epcMismatchesQuery.isLoading ||
      pendingAuditsQuery.isLoading ||
      lowStockQuery.isLoading ||
      stockHealthQuery.isLoading
    );
  }, [
    criticalStockQuery.isLoading,
    agingStockQuery.isLoading,
    epcMismatchesQuery.isLoading,
    pendingAuditsQuery.isLoading,
    lowStockQuery.isLoading,
    stockHealthQuery.isLoading,
  ]);

  const value = useMemo<StockAlertConfigContextType>(
    () => ({
      agingStockQuery,
      criticalStockQuery,
      epcMismatchesQuery,
      filters,
      hasMultipleStores,
      isLoading,
      lowStockQuery,
      pendingAuditsQuery,
      setFilters,
      stockHealthQuery,
      stores,
      updateFilter,
    }),
    [
      agingStockQuery,
      criticalStockQuery,
      epcMismatchesQuery,
      filters,
      hasMultipleStores,
      isLoading,
      lowStockQuery,
      pendingAuditsQuery,
      stockHealthQuery,
      stores,
    ],
  );

  return (
    <StockAlertConfigContext.Provider value={value}>
      {children}
    </StockAlertConfigContext.Provider>
  );
};
