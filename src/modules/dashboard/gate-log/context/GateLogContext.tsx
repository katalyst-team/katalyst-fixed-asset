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
    currentCursor,
    hasNextPage,
    hasPrevPage,
    filters,
    totalItems,
    localItemsPerPage,
    gateLogData,
    setNextCursor,
    setPrevCursor,
    setHasNextPage,
    setHasPrevPage,
    setTotalItems,
    setLocalItemsPerPage,
    setGateLogData,
    setFilters,
    goToNextPage,
    goToPrevPage,
    resetPagination,
  } = useGateLogStore(
    useShallow((state) => ({
      currentCursor: state.currentCursor,
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
      setNextCursor: state.setNextCursor,
      setPrevCursor: state.setPrevCursor,
      setTotalItems: state.setTotalItems,
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
    cursor: currentCursor,
    limit: localItemsPerPage,
  };

  const { data, isLoading, isSuccess, isFetching } = useGetGateLogListQuery({
    enabled: !!tokenPayload?.organization_id,
    filters: queryFilters,
    organizationId: tokenPayload?.organization_id || "",
  });

  useEffect(() => {
    if (isSuccess && data) {
      setGateLogData(data.data?.gate_log || []);
      setNextCursor(data.pagination?.next_cursor || null);
      setPrevCursor(data.pagination?.prev_cursor || null);
      setHasNextPage(!!data.pagination?.next_cursor);
      setHasPrevPage(!!data.pagination?.prev_cursor);
      setTotalItems(data.pagination?.count || 0);
    }
  }, [
    data,
    isSuccess,
    setGateLogData,
    setNextCursor,
    setPrevCursor,
    setHasNextPage,
    setHasPrevPage,
    setTotalItems,
  ]);

  const handleGoToPrevPage = useCallback(() => {
    goToPrevPage(data?.pagination?.prev_cursor);
  }, [data?.pagination?.prev_cursor, goToPrevPage]);

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
    goToPrevPage: handleGoToPrevPage,
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
