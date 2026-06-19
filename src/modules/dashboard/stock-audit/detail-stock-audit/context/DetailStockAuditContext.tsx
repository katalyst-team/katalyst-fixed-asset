import React, { createContext, useContext } from "react";

import { useUser } from "@/context/user-context";
import {
  useGetStockAuditDetailQuery,
  useUpdateStockAuditMutation,
} from "@/hooks/api/stock-audit";
import {
  DiscrepancyItemUpdate,
  StockAuditDetail,
  StockAuditUpdatePayload,
} from "@/types/stock-audit";

import { flattenDiscrepancyItems } from "../utils";

interface DetailStockAuditContextType {
  loading: boolean;
  stockAuditDetail: StockAuditDetail | null;
  updateStockAudit: (payload: StockAuditUpdatePayload) => void;
  updateLoading: boolean;
  updateDiscrepancyItems: (items: DiscrepancyItemUpdate[]) => void;
  updateNote: (note: string) => void;
}

const DetailStockAuditContext = createContext<DetailStockAuditContextType>({
  loading: false,
  stockAuditDetail: null,
  updateDiscrepancyItems: () => {},
  updateLoading: false,
  updateNote: () => {},
  updateStockAudit: () => {},
});

interface DetailStockAuditProviderProps {
  children: React.ReactNode;
  auditId: string;
  storeId: string;
}

export const DetailStockAuditProvider: React.FC<
  DetailStockAuditProviderProps
> = ({ children, auditId, storeId }) => {
  const { tokenPayload } = useUser();

  const { data, isLoading } = useGetStockAuditDetailQuery({
    auditId,
    enabled: !!tokenPayload?.organization_id && !!storeId && !!auditId,
    organizationId: tokenPayload?.organization_id || "",
    storeId: storeId,
  });

  const { mutate: updateMutate, isPending: updateLoading } =
    useUpdateStockAuditMutation({
      auditId,
      organizationId: tokenPayload?.organization_id || "",
      storeId: storeId,
    });

  const updateStockAudit = (payload: StockAuditUpdatePayload) => {
    updateMutate({ payload });
  };

  const updateDiscrepancyItems = (items: DiscrepancyItemUpdate[]) => {
    updateMutate({
      payload: {
        discrepancy_items: items,
      },
    });
  };

  const updateNote = (note: string) => {
    if (!data?.data) return;

    const currentAudit = data.data;
    const discrepancyItems = flattenDiscrepancyItems(
      currentAudit.discrepancy_items
    );
    updateMutate({
      payload: {
        actual_quantity: currentAudit.actual_quantity,
        discrepancy_items: discrepancyItems.map((item) => ({
          item_id: item.item_id,
          status: item.discrepancy_status,
        })),
        expected_quantity: currentAudit.expected_quantity,
        note,
        result: currentAudit.result,
        status: currentAudit.status,
      },
    });
  };

  return (
    <DetailStockAuditContext.Provider
      value={{
        loading: isLoading,
        stockAuditDetail: data?.data || null,
        updateDiscrepancyItems,
        updateLoading,
        updateNote,
        updateStockAudit,
      }}
    >
      {children}
    </DetailStockAuditContext.Provider>
  );
};

export const useDetailStockAudit = () => {
  const context = useContext(DetailStockAuditContext);
  if (!context) {
    throw new Error(
      "useDetailStockAudit must be used within a DetailStockAuditProvider"
    );
  }
  return context;
};
