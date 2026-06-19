import { ProductFilterOptions } from "@/services/product/getProductService";

type FilterState = Omit<ProductFilterOptions, "limit">;

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
  filters: {
    assign_status: "ASSIGNED",
    item_status_ids: [],
  },

  setFilters: (filters) =>
    set({
      filters: typeof filters === "function" ? filters(get().filters) : filters,
    }),
});
