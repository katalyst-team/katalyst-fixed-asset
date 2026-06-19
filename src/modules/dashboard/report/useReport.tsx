"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import useGetReportDataQuery from "@/hooks/api/report/useGetReportDataQuery";
import { ReportFilterOptions, ReportItem } from "@/types/report";

import { useReportStore } from "./store";

interface ReportContextType {
  reportData: ReportItem[];
  setFilters: (filters: Omit<ReportFilterOptions, "limit" | "cursor">) => void;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  filters: Omit<ReportFilterOptions, "limit" | "cursor">;
  setItemsPerPage: (limit: number) => void;
  storeInfo: {
    id: string;
    name: string;
    address: string;
  } | null;
  dateRange: {
    start_date: string;
    end_date: string;
  } | null;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

interface ReportProviderProps {
  children: ReactNode;
  itemsPerPage?: number;
}

export const ReportProvider: React.FC<ReportProviderProps> = ({
  children,
  itemsPerPage = 20,
}) => {
  const { tokenPayload, selectedTeam } = useUser();

  // Use Zustand store instead of local state
  const {
    currentCursor,
    hasNextPage,
    hasPrevPage,
    currentPage,
    filters,
    totalItems,
    localItemsPerPage,
    reportData,
    storeInfo,
    dateRange,
    setNextCursor,
    setPrevCursor,
    setHasNextPage,
    setHasPrevPage,
    setTotalItems,
    setLocalItemsPerPage,
    setReportData,
    setStoreInfo,
    setDateRange,
    setFilters,
    goToNextPage,
    goToPrevPage,
    resetPagination,
  } = useReportStore(
    useShallow((state) => ({
      currentCursor: state.currentCursor,
      currentPage: state.currentPage,
      dateRange: state.dateRange,
      filters: state.filters,
      goToNextPage: state.goToNextPage,
      goToPrevPage: state.goToPrevPage,
      hasNextPage: state.hasNextPage,
      hasPrevPage: state.hasPrevPage,
      localItemsPerPage: state.localItemsPerPage,
      reportData: state.reportData,
      resetPagination: state.resetPagination,
      setDateRange: state.setDateRange,
      setFilters: state.setFilters,
      setHasNextPage: state.setHasNextPage,
      setHasPrevPage: state.setHasPrevPage,
      setLocalItemsPerPage: state.setLocalItemsPerPage,
      setNextCursor: state.setNextCursor,
      setPrevCursor: state.setPrevCursor,
      setReportData: state.setReportData,
      setStoreInfo: state.setStoreInfo,
      setTotalItems: state.setTotalItems,
      storeInfo: state.storeInfo,
      totalItems: state.totalItems,
    }))
  );

  // Initialize items per page from prop only on first mount
  useEffect(() => {
    // Only set if the store still has the default value
    if (localItemsPerPage === 20) {
      setLocalItemsPerPage(itemsPerPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Determine which store ID to use for the API query
  const queryStoreId = useMemo(() => {
    if (selectedTeam && selectedTeam !== "0") {
      return selectedTeam;
    }
    return "";
  }, [selectedTeam]);

  const requestFilters = {
    ...filters,
    cursor: currentCursor,
    limit: localItemsPerPage,
  };

  const { data, isLoading, isSuccess } = useGetReportDataQuery({
    filters: requestFilters,
    organizationId: tokenPayload?.organization_id || "",
    storeId: queryStoreId,
  });

  useEffect(() => {
    if (isSuccess && data) {
      setReportData(data.data.items || []);
      setStoreInfo(data.data.store || null);
      setDateRange({
        end_date: data.data.end_date || "",
        start_date: data.data.start_date || "",
      });

      // Access pagination directly from the ApiResponse structure
      const nextCursor = data.pagination?.next_cursor;
      const prevCursor = data.pagination?.prev_cursor;

      setNextCursor(nextCursor || null);
      setPrevCursor(prevCursor || null);
      setHasNextPage(!!nextCursor);
      setHasPrevPage(!!prevCursor);
      setTotalItems(data.pagination?.count || 0);
    }
  }, [
    data,
    isSuccess,
    setReportData,
    setStoreInfo,
    setDateRange,
    setNextCursor,
    setPrevCursor,
    setHasNextPage,
    setHasPrevPage,
    setTotalItems,
  ]);

  const handleGoToPrevPage = useCallback(() => {
    goToPrevPage(data?.pagination?.prev_cursor || undefined);
  }, [data?.pagination?.prev_cursor, goToPrevPage]);

  const handleSetFilters = useCallback(
    (newFilters: Omit<ReportFilterOptions, "limit" | "cursor">) => {
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

  const value: ReportContextType = {
    currentPage,
    dateRange,
    filters,
    goToNextPage,
    goToPrevPage: handleGoToPrevPage,
    hasNextPage,
    hasPrevPage,
    isLoading,
    itemsPerPage: localItemsPerPage,
    reportData,
    setFilters: handleSetFilters,
    setItemsPerPage: handleSetItemsPerPage,
    storeInfo,
    totalItems,
  };

  return (
    <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
  );
};

export const useReport = (): ReportContextType => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error("useReport must be used within a ReportProvider");
  }
  return context;
};
