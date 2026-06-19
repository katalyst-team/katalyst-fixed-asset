import { useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import {
  useCreateStockAuditMutation,
  useDeleteStockAuditMutation,
  useGetStockAuditListQuery,
} from "@/hooks/api/stock-audit";
import { KEY_USE_GET_STOCK_AUDIT_LIST } from "@/hooks/api/stock-audit/useGetStockAuditListQuery";
import {
  StockAuditCreatePayload,
  StockAuditFilterOptions,
  StockAuditItem,
} from "@/types/stock-audit";

import { useStockAuditStore } from "../store";

interface StockAuditContextType {
  loading: boolean;
  stockAuditList: StockAuditItem[];
  count: number;
  createStockAudit: (payload: StockAuditCreatePayload) => void;
  deleteStockAudit: (auditId: string, storeId: string) => void;
  createLoading: boolean;
  deleteLoading: boolean;
  filters: StockAuditFilterOptions;
  setFilters: (filters: StockAuditFilterOptions) => void;
  itemsPerPage: number;
  setItemsPerPage: (limit: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToNextPage: () => void;
  goToPrevPage: () => void;
}

const StockAuditContext = createContext<StockAuditContextType>({
  count: 0,
  createLoading: false,
  createStockAudit: () => {},
  deleteLoading: false,
  deleteStockAudit: () => {},
  filters: { order_direction: "DESC" },
  goToNextPage: () => {},
  goToPrevPage: () => {},
  hasNextPage: false,
  hasPrevPage: false,
  itemsPerPage: 20,
  loading: false,
  setFilters: () => {},
  setItemsPerPage: () => {},
  stockAuditList: [],
});

export const StockAuditProvider: React.FC<{
  children: React.ReactNode;
  storeId?: string;
}> = ({ children, storeId }) => {
  const { tokenPayload, selectedTeam } = useUser();
  const effectiveStoreId = storeId || selectedTeam;
  const queryClient = useQueryClient();
  // Use Zustand store instead of local state
  const {
    currentCursor,
    hasNextPage,
    hasPrevPage,
    filters,
    totalItems,
    localItemsPerPage,
    stockAuditData,
    setNextCursor,
    setPrevCursor,
    setHasNextPage,
    setHasPrevPage,
    setTotalItems,
    setLocalItemsPerPage,
    setStockAuditData,
    setFilters,
    goToNextPage,
    goToPrevPage,
    resetPagination,
  } = useStockAuditStore(
    useShallow((state) => ({
      currentCursor: state.currentCursor,
      filters: state.filters,
      goToNextPage: state.goToNextPage,
      goToPrevPage: state.goToPrevPage,
      hasNextPage: state.hasNextPage,
      hasPrevPage: state.hasPrevPage,
      localItemsPerPage: state.localItemsPerPage,
      resetPagination: state.resetPagination,
      setFilters: state.setFilters,
      setHasNextPage: state.setHasNextPage,
      setHasPrevPage: state.setHasPrevPage,
      setLocalItemsPerPage: state.setLocalItemsPerPage,
      setNextCursor: state.setNextCursor,
      setPrevCursor: state.setPrevCursor,
      setStockAuditData: state.setStockAuditData,
      setTotalItems: state.setTotalItems,
      stockAuditData: state.stockAuditData,
      totalItems: state.totalItems,
    }))
  );

  // Initialize items per page from default only on first mount
  useEffect(() => {
    // Only set if the store still has the default value
    if (localItemsPerPage === 20) {
      setLocalItemsPerPage(20);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const queryFilters = {
    ...filters,
    cursor: currentCursor,
    limit: localItemsPerPage,
  };

  const { data, isLoading, isSuccess, isFetching } = useGetStockAuditListQuery({
    enabled: !!tokenPayload?.organization_id && !!effectiveStoreId,
    filters: queryFilters,
    organizationId: tokenPayload?.organization_id || "",
    storeId: effectiveStoreId,
  });

  useEffect(() => {
    if (isSuccess && data) {
      setStockAuditData(data.data?.items || []);
      setNextCursor(data.pagination?.next_cursor || null);
      setPrevCursor(data.pagination?.prev_cursor || null);
      setHasNextPage(!!data.pagination?.next_cursor);
      setHasPrevPage(!!data.pagination?.prev_cursor);
      setTotalItems(data.pagination?.count || 0);
    }
  }, [
    data,
    isSuccess,
    setStockAuditData,
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
    (newFilters: StockAuditFilterOptions) => {
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

  const { mutateAsync: createMutateAsync, isPending: createLoading } =
    useCreateStockAuditMutation({
      organizationId: tokenPayload?.organization_id || "",
      storeId: effectiveStoreId,
    });

  // We'll pass the storeId in the deleteStockAudit function call
  const { mutateAsync: deleteMutateAsync, isPending: deleteLoading } =
    useDeleteStockAuditMutation({
      organizationId: tokenPayload?.organization_id || "",
    });

  const createStockAudit = (payload: StockAuditCreatePayload) => {
    createMutateAsync(payload).then(() =>
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_STOCK_AUDIT_LIST(
          tokenPayload?.organization_id || "",
          effectiveStoreId,
          queryFilters
        ),
      })
    );
  };

  const deleteStockAudit = (auditId: string, storeId: string) => {
    deleteMutateAsync({ auditId, storeId }).then(() =>
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_STOCK_AUDIT_LIST(
          tokenPayload?.organization_id || "",
          effectiveStoreId,
          queryFilters
        ),
      })
    );
  };

  const value: StockAuditContextType = {
    count: totalItems,
    createLoading,
    createStockAudit,
    deleteLoading,
    deleteStockAudit,
    filters,
    goToNextPage,
    goToPrevPage: handleGoToPrevPage,
    hasNextPage,
    hasPrevPage,
    itemsPerPage: localItemsPerPage,
    loading: isLoading || isFetching,
    setFilters: handleSetFilters,
    setItemsPerPage: handleSetItemsPerPage,
    stockAuditList: stockAuditData,
  };

  return (
    <StockAuditContext.Provider value={value}>
      {children}
    </StockAuditContext.Provider>
  );
};

export const useStockAudit = () => {
  const context = useContext(StockAuditContext);
  if (!context) {
    throw new Error("useStockAudit must be used within a StockAuditProvider");
  }
  return context;
};
