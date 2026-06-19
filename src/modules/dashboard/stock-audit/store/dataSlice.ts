import { StockAuditItem } from "@/types/stock-audit";

export interface DataSlice {
  localItemsPerPage: number;
  stockAuditData: StockAuditItem[];

  // Actions
  setLocalItemsPerPage: (itemsPerPage: number) => void;
  setStockAuditData: (data: StockAuditItem[]) => void;
}

export const createDataSlice = (
  set: (partial: Partial<DataSlice>) => void
): DataSlice => ({
  // Initial state
  localItemsPerPage: 20,
  
  // Actions  
  setLocalItemsPerPage: (itemsPerPage) => set({ localItemsPerPage: itemsPerPage }),
  setStockAuditData: (data) => set({ stockAuditData: data }),
  stockAuditData: [],
});