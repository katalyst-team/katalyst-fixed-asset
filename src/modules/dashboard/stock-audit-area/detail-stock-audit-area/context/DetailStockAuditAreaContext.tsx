import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import {
  useGetAuditHistoryBySection,
  useGetSectionMetrics,
} from "@/hooks/api/stock-audit-area";
import {
  AuditHistoryFilterOptions,
  AuditHistoryItem,
  SectionMetrics,
} from "@/types/stock-audit-area";

import { useDetailStockAuditAreaStore } from "../store";

interface DetailStockAuditAreaContextType {
  loading: boolean;
  auditHistoryList: AuditHistoryItem[];
  sectionMetrics: SectionMetrics | null;
  filters: AuditHistoryFilterOptions;
  setFilters: (filters: AuditHistoryFilterOptions) => void;
  sectionName: string;
}

const DetailStockAuditAreaContext =
  createContext<DetailStockAuditAreaContextType>({
    auditHistoryList: [],
    filters: { sort_order: "DESC" },
    loading: false,
    sectionMetrics: null,
    sectionName: "",
    setFilters: () => {},
  });

interface DetailStockAuditAreaProviderProps {
  children: React.ReactNode;
  storeId: string;
  sectionId: string;
  stockMovementTypeName?: string;
}

export const DetailStockAuditAreaProvider: React.FC<
  DetailStockAuditAreaProviderProps
> = ({ children, stockMovementTypeName, storeId, sectionId }) => {
  const { tokenPayload } = useUser();

  // Use Zustand store
  const {
    filters,
    auditHistoryData,
    sectionMetrics,
    setAuditHistoryData,
    setSectionMetrics,
    setFilters,
  } = useDetailStockAuditAreaStore(
    useShallow((state) => ({
      auditHistoryData: state.auditHistoryData,
      filters: state.filters,
      sectionMetrics: state.sectionMetrics,
      setAuditHistoryData: state.setAuditHistoryData,
      setFilters: state.setFilters,
      setSectionMetrics: state.setSectionMetrics,
    }))
  );

  // Fetch audit history
  const mergedFilters = {
    ...filters,
    ...(stockMovementTypeName && {
      stock_movement_type_names: [stockMovementTypeName],
    }),
  };

  const {
    data: auditHistoryResponse,
    isLoading: isLoadingHistory,
    isSuccess: isSuccessHistory,
    isFetching: isFetchingHistory,
  } = useGetAuditHistoryBySection({
    enabled: !!tokenPayload?.organization_id && !!storeId && !!sectionId,
    filters: mergedFilters,
    organizationId: tokenPayload?.organization_id || "",
    sectionId,
    storeId,
  });

  // Fetch section metrics
  const {
    data: metricsResponse,
    isLoading: isLoadingMetrics,
    isSuccess: isSuccessMetrics,
  } = useGetSectionMetrics({
    enabled: !!tokenPayload?.organization_id && !!storeId && !!sectionId,
    organizationId: tokenPayload?.organization_id || "",
    sectionId,
    storeId,
  });

  // Update audit history data when fetched
  useEffect(() => {
    if (isSuccessHistory && auditHistoryResponse) {
      setAuditHistoryData(auditHistoryResponse.data?.items || []);
    }
  }, [auditHistoryResponse, isSuccessHistory, setAuditHistoryData]);

  // Update metrics when fetched
  useEffect(() => {
    if (isSuccessMetrics && metricsResponse) {
      setSectionMetrics(metricsResponse.data || null);
    }
  }, [metricsResponse, isSuccessMetrics, setSectionMetrics]);

  const handleSetFilters = useCallback(
    (newFilters: AuditHistoryFilterOptions) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const value: DetailStockAuditAreaContextType = {
    auditHistoryList: auditHistoryData,
    filters,
    loading:
      isLoadingHistory ||
      isFetchingHistory ||
      isLoadingMetrics,
    sectionMetrics,
    sectionName: sectionMetrics?.section?.name || "",
    setFilters: handleSetFilters,
  };

  return (
    <DetailStockAuditAreaContext.Provider value={value}>
      {children}
    </DetailStockAuditAreaContext.Provider>
  );
};

export const useDetailStockAuditArea = () => {
  const context = useContext(DetailStockAuditAreaContext);
  if (!context) {
    throw new Error(
      "useDetailStockAuditArea must be used within a DetailStockAuditAreaProvider"
    );
  }
  return context;
};
