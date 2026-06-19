import { SkuFilterOptions, SkuType } from "@/types/sku";

type FilterState = Omit<SkuFilterOptions, "limit" | "cursor">;

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
  filters: {
    type: SkuType.COMMON,
  },

  // Actions
  setFilters: (filters) =>
    set({
      filters: typeof filters === "function" ? filters(get().filters) : filters,
    }),
});
