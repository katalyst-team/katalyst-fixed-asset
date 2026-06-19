import { InboundFilterOptions } from "@/types/inbound";

type FilterState = Omit<InboundFilterOptions, "limit" | "cursor">;

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
