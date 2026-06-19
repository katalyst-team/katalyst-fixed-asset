import { StockAuditFilterOptions } from "@/types/stock-audit";

export interface FilterSlice {
  filters: StockAuditFilterOptions;

  // Actions
  setFilters: (filters: StockAuditFilterOptions) => void;
}

export const createFilterSlice = (
  set: (partial: Partial<FilterSlice>) => void
): FilterSlice => ({
  // Initial state
  filters: { order_direction: "DESC" },

  // Actions
  setFilters: (filters) => set({ filters }),
});