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
} from "@/hooks/api/stock-audit";
import {
  KEY_USE_GET_STOCK_AUDIT_AREA_LIST,
  useGetStockAuditAreaListQuery,
} from "@/hooks/api/stock-audit-area";
import {
  StockAuditAreaCreatePayload,
  StockAuditAreaFilterOptions,
  StockAuditAreaItem,
  StockAuditAreaSummary,
} from "@/types/stock-audit-area";

import { useStockAuditAreaStore } from "../store";

interface StockAuditAreaContextType {
  loading: boolean;
  stockAuditAreaList: StockAuditAreaItem[];
  summary: StockAuditAreaSummary | null;
  createStockAuditArea: (payload: StockAuditAreaCreatePayload) => void;
  deleteStockAuditArea: (auditId: string, storeId: string) => void;
  createLoading: boolean;
  deleteLoading: boolean;
  filters: StockAuditAreaFilterOptions;
  setFilters: (filters: StockAuditAreaFilterOptions) => void;
}

const StockAuditAreaContext = createContext<StockAuditAreaContextType>({
  createLoading: false,
  createStockAuditArea: () => {},
  deleteLoading: false,
  deleteStockAuditArea: () => {},
  filters: {},
  loading: false,
  setFilters: () => {},
  stockAuditAreaList: [],
  summary: null,
});

export const StockAuditAreaProvider: React.FC<{
  children: React.ReactNode;
  storeId?: string;
}> = ({ children, storeId }) => {
  const { tokenPayload, selectedTeam } = useUser();
  const effectiveStoreId = storeId || selectedTeam;
  const queryClient = useQueryClient();
  // Use Zustand store instead of local state
  const {
    filters,
    stockAuditAreaData,
    stockAuditAreaSummary,
    setStockAuditAreaData,
    setStockAuditAreaSummary,
    setFilters,
  } = useStockAuditAreaStore(
    useShallow((state) => ({
      filters: state.filters,
      setFilters: state.setFilters,
      setStockAuditAreaData: state.setStockAuditAreaData,
      setStockAuditAreaSummary: state.setStockAuditAreaSummary,
      stockAuditAreaData: state.stockAuditAreaData,
      stockAuditAreaSummary: state.stockAuditAreaSummary,
    }))
  );

  const queryFilters = {
    ...filters,
  };

  const { data, isLoading, isSuccess, isFetching } =
    useGetStockAuditAreaListQuery({
      enabled: !!tokenPayload?.organization_id && !!effectiveStoreId,
      filters: queryFilters,
      organizationId: tokenPayload?.organization_id || "",
      storeId: effectiveStoreId,
    });

  useEffect(() => {
    if (isSuccess && data) {
      setStockAuditAreaData(data.data?.audit_sections || []);
      if (data.data) {
        const { average_accuracy, overdue, section_with_discrepancy, total } =
          data.data;
        setStockAuditAreaSummary({
          average_accuracy,
          overdue,
          section_with_discrepancy,
          total,
        });
      } else {
        setStockAuditAreaSummary(null);
      }
    }
  }, [
    data,
    isSuccess,
    setStockAuditAreaSummary,
    setStockAuditAreaData,
  ]);

  const handleSetFilters = useCallback(
    (newFilters: StockAuditAreaFilterOptions) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const { mutateAsync: createMutateAsync, isPending: createLoading } =
    useCreateStockAuditMutation({
      organizationId: tokenPayload?.organization_id || "",
      storeId: effectiveStoreId,
    });

  // We'll pass the storeId in the deleteStockAuditArea function call
  const { mutateAsync: deleteMutateAsync, isPending: deleteLoading } =
    useDeleteStockAuditMutation({
      organizationId: tokenPayload?.organization_id || "",
    });

  const createStockAuditArea = (payload: StockAuditAreaCreatePayload) => {
    createMutateAsync({
      store_id: payload.store_id,
      type: "ALL",
    }).then(() =>
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_STOCK_AUDIT_AREA_LIST(
          tokenPayload?.organization_id || "",
          effectiveStoreId,
          queryFilters
        ),
      })
    );
  };

  const deleteStockAuditArea = (auditId: string, storeId: string) => {
    deleteMutateAsync({ auditId, storeId }).then(() =>
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_STOCK_AUDIT_AREA_LIST(
          tokenPayload?.organization_id || "",
          effectiveStoreId,
          queryFilters
        ),
      })
    );
  };

  const value: StockAuditAreaContextType = {
    createLoading,
    createStockAuditArea,
    deleteLoading,
    deleteStockAuditArea,
    filters,
    loading: isLoading || isFetching,
    setFilters: handleSetFilters,
    stockAuditAreaList: stockAuditAreaData,
    summary: stockAuditAreaSummary,
  };

  return (
    <StockAuditAreaContext.Provider value={value}>
      {children}
    </StockAuditAreaContext.Provider>
  );
};

export const useStockAuditArea = () => {
  const context = useContext(StockAuditAreaContext);
  if (!context) {
    throw new Error(
      "useStockAuditArea must be used within a StockAuditAreaProvider"
    );
  }
  return context;
};
