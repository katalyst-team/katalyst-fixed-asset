import { GateLogFilterOptions } from "@/types/gate-log";

export interface FilterSlice {
  filters: GateLogFilterOptions;

  // Actions
  setFilters: (filters: GateLogFilterOptions) => void;
}

export const createFilterSlice = (
  set: (partial: Partial<FilterSlice>) => void
): FilterSlice => ({
  // Initial state
  filters: {},

  // Actions
  setFilters: (filters) => set({ filters }),
});
