import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import { useGetGateLogListQuery } from "@/hooks/api/gate-log";
import { GateLog, GateLogFilterOptions } from "@/types/gate-log";

import { useGateLogStore } from "../store";

interface GateLogContextType {
  loading: boolean;
  gateLogList: GateLog[];
  count: number;
  filters: GateLogFilterOptions;
  setFilters: (filters: GateLogFilterOptions) => void;
  itemsPerPage: number;
  setItemsPerPage: (limit: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToNextPage: () => void;
  goToPrevPage: () => void;
}

const GateLogContext = createContext<GateLogContextType>({
  count: 0,
  filters: {},
  gateLogList: [],
  goToNextPage: () => {},
  goToPrevPage: () => {},
  hasNextPage: false,
  hasPrevPage: false,
  itemsPerPage: 20,
  loading: false,
  setFilters: () => {},
  setItemsPerPage: () => {},
});

export const GateLogProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { tokenPayload } = useUser();

  const {
    currentPage,
    hasNextPage,
    hasPrevPage,
    filters,
    totalItems,
    localItemsPerPage,
    gateLogData,
    setHasNextPage,
    setHasPrevPage,
    setTotalItems,
    setTotalPages,
    setLocalItemsPerPage,
    setGateLogData,
    setFilters,
    goToNextPage,
    goToPrevPage,
    resetPagination,
  } = useGateLogStore(
    useShallow((state) => ({
      currentPage: state.currentPage,
      filters: state.filters,
      gateLogData: state.gateLogData,
      goToNextPage: state.goToNextPage,
      goToPrevPage: state.goToPrevPage,
      hasNextPage: state.hasNextPage,
      hasPrevPage: state.hasPrevPage,
      localItemsPerPage: state.localItemsPerPage,
      resetPagination: state.resetPagination,
      setFilters: state.setFilters,
      setGateLogData: state.setGateLogData,
      setHasNextPage: state.setHasNextPage,
      setHasPrevPage: state.setHasPrevPage,
      setLocalItemsPerPage: state.setLocalItemsPerPage,
      setTotalItems: state.setTotalItems,
      setTotalPages: state.setTotalPages,
      totalItems: state.totalItems,
    }))
  );

  useEffect(() => {
    if (localItemsPerPage === 20) {
      setLocalItemsPerPage(20);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const queryFilters = {
    ...filters,
    limit: localItemsPerPage,
    page: currentPage,
  };

  const { data, isLoading, isSuccess, isFetching } = useGetGateLogListQuery({
    enabled: !!tokenPayload?.organization_id,
    filters: queryFilters,
    organizationId: tokenPayload?.organization_id || "",
  });

  useEffect(() => {
    if (isSuccess && data) {
      setGateLogData(data.data?.gate_log || []);
      setHasNextPage(currentPage < (data.pagination?.total_pages ?? 1));
      setHasPrevPage(currentPage > 1);
      setTotalItems(data.pagination?.count || 0);
      setTotalPages(data.pagination?.total_pages ?? 1);
    }
  }, [
    currentPage,
    data,
    isSuccess,
    setGateLogData,
    setHasNextPage,
    setHasPrevPage,
    setTotalItems,
    setTotalPages,
  ]);

  const handleSetFilters = useCallback(
    (newFilters: GateLogFilterOptions) => {
      resetPagination();
      setFilters(newFilters);
    },
    [resetPagination, setFilters]
  );

  const handleSetItemsPerPage = useCallback(
    (limit: number) => {
      resetPagination();
      setLocalItemsPerPage(limit);
    },
    [resetPagination, setLocalItemsPerPage]
  );

  const value: GateLogContextType = {
    count: totalItems,
    filters,
    gateLogList: gateLogData,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,
    itemsPerPage: localItemsPerPage,
    loading: isLoading || isFetching,
    setFilters: handleSetFilters,
    setItemsPerPage: handleSetItemsPerPage,
  };

  return (
    <GateLogContext.Provider value={value}>{children}</GateLogContext.Provider>
  );
};

export const useGateLog = () => {
  const context = useContext(GateLogContext);
  if (!context) {
    throw new Error("useGateLog must be used within a GateLogProvider");
  }
  return context;
};
