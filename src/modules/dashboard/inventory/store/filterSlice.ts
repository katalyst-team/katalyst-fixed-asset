import { InventoryFilterOptions } from "@/types/inventory";

type FilterState = Omit<InventoryFilterOptions, "limit"> & {
  cursor?: string | null;
};

export interface FilterSlice {
  filters: FilterState;
  selectedStoreId: string;
  setFilters: (
    filters: FilterState | ((prev: FilterState) => FilterState)
  ) => void;
  setSelectedStoreId: (storeId: string) => void;
}

export const createFilterSlice = (
  set: (partial: Partial<FilterSlice>) => void,
  get: () => FilterSlice
): FilterSlice => ({
  filters: {},
  selectedStoreId: "",
  setFilters: (filters) =>
    set({
      filters: typeof filters === "function" ? filters(get().filters) : filters,
    }),
  setSelectedStoreId: (storeId) => set({ selectedStoreId: storeId }),
});
