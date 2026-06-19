import { SkuDataFilters } from "@/services/sku/getSkuDataService";
import { SkuType } from "@/types/sku";

type FilterState = Omit<SkuDataFilters, "limit" | "cursor">;

export interface FilterSlice {
  filters: FilterState;

  // Actions
  setFilters: (
    filters: FilterState | ((prev: FilterState) => FilterState),
  ) => void;
}

export const createFilterSlice = (
  set: (partial: Partial<FilterSlice>) => void,
  get: () => FilterSlice,
): FilterSlice => ({
  // Initial state
  filters: {
    assign_status: "UNASSIGNED",
    type: SkuType.UNIQUE,
  },

  // Actions
  setFilters: (filters) => {
    const nextFilters =
      typeof filters === "function" ? filters(get().filters) : filters;
    set({
      filters: {
        ...nextFilters,
        assign_status: nextFilters.assign_status ?? "UNASSIGNED",
        type: SkuType.UNIQUE,
      },
    });
  },
});
