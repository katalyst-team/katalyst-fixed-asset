import { EdgeConfigFilterOptions } from "@/types/edge-config";

type FilterState = Omit<EdgeConfigFilterOptions, "limit" | "page">;

export interface FilterSlice {
  filters: FilterState;

  // Actions
  setFilters: (
    filters: FilterState | ((prev: FilterState) => FilterState)
  ) => void;
}

export const createFilterSlice = (
  set: (partial: Partial<FilterSlice>) => void,
  get: () => FilterSlice
): FilterSlice => ({
  // Initial state
  filters: {},

  // Actions
  setFilters: (filters) =>
    set({
      filters: typeof filters === "function" ? filters(get().filters) : filters,
    }),
});
