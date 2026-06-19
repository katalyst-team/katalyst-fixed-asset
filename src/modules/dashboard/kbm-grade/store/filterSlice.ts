import { SkuFilterOptions } from "@/types/sku";

// Filter state with cursor support
type FilterState = Omit<SkuFilterOptions, "limit"> & { cursor?: string | null };

// Keep type alias for backwards compatibility
export type KbmGradeFilterOptions = SkuFilterOptions;

export interface FilterSlice {
  filters: FilterState;
  setFilters: (
    filters: FilterState | ((prev: FilterState) => FilterState)
  ) => void;
}

export const createFilterSlice = (
  set: (partial: Partial<FilterSlice>) => void,
  get: () => FilterSlice
): FilterSlice => ({
  filters: {},
  setFilters: (filters) =>
    set({
      filters: typeof filters === "function" ? filters(get().filters) : filters,
    }),
});
