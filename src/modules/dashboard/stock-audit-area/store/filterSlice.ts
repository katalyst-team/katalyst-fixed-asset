import { StockAuditAreaFilterOptions } from "@/types/stock-audit-area";

export interface FilterSlice {
  filters: StockAuditAreaFilterOptions;

  // Actions
  setFilters: (filters: StockAuditAreaFilterOptions) => void;
}

export const createFilterSlice = (
  set: (partial: Partial<FilterSlice>) => void
): FilterSlice => ({
  // Initial state
  filters: {},

  // Actions
  setFilters: (filters) => set({ filters }),
});

