import {
  StockAuditAreaItem,
  StockAuditAreaSummary,
} from "@/types/stock-audit-area";

export interface DataSlice {
  stockAuditAreaData: StockAuditAreaItem[];
  stockAuditAreaSummary: StockAuditAreaSummary | null;

  // Actions
  setStockAuditAreaData: (data: StockAuditAreaItem[]) => void;
  setStockAuditAreaSummary: (
    summary: StockAuditAreaSummary | null
  ) => void;
}

export const createDataSlice = (
  set: (partial: Partial<DataSlice>) => void
): DataSlice => ({
  // Actions
  setStockAuditAreaData: (data) => set({ stockAuditAreaData: data }),
  setStockAuditAreaSummary: (summary) =>
    set({ stockAuditAreaSummary: summary }),

  // Initial state
  stockAuditAreaData: [],
  stockAuditAreaSummary: null,
});
