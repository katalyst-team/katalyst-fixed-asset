import { ProductFilterOptions } from "@/services/product/getProductService";

type FilterState = Omit<ProductFilterOptions, "limit" | "cursor">;

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
  // Initial state with hardcoded filters
  // assign_status is hardcoded to "ASSIGNED"
  // item_status_ids will be set by the hook after fetching WAITING_INBOUND status ID
  filters: {
    assign_status: "ASSIGNED",
    item_status_ids: [], // Will be populated by useStPenerimaanLogLog hook
  },

  // Actions
  setFilters: (filters) =>
    set({
      filters: typeof filters === "function" ? filters(get().filters) : filters,
    }),
});
