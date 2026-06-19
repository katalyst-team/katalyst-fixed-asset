import { StockMovementTypesFilters } from "@/services/stock-movement-types/getStockMovementTypesService";

export interface FilterSlice {
  filters: StockMovementTypesFilters;

  // Actions
  setFilters: (filters: StockMovementTypesFilters) => void;
}

export const createFilterSlice = (
  set: (partial: Partial<FilterSlice>) => void
): FilterSlice => ({
  // Initial state
  filters: {},

  // Actions
  setFilters: (filters) => set({ filters }),
});
