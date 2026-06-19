import { AuditHistoryFilterOptions } from "@/types/stock-audit-area";

export interface FilterSlice {
  filters: AuditHistoryFilterOptions;

  // Actions
  setFilters: (filters: AuditHistoryFilterOptions) => void;
}

export const createFilterSlice = (
  set: (partial: Partial<FilterSlice>) => void
): FilterSlice => ({
  // Initial state
  filters: {
    sort_order: "DESC",
  },

  // Actions
  setFilters: (filters) => set({ filters }),
});
