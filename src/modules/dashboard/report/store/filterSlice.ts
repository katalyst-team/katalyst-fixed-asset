import { ReportFilterOptions } from "@/types/report";

export interface FilterSlice {
  filters: Omit<ReportFilterOptions, "limit" | "cursor">;

  // Actions
  setFilters: (filters: Omit<ReportFilterOptions, "limit" | "cursor">) => void;
}

export const createFilterSlice = (
  set: (partial: Partial<FilterSlice>) => void
): FilterSlice => ({
  // Initial state
  filters: {},

  // Actions
  setFilters: (filters) => set({ filters }),
});
