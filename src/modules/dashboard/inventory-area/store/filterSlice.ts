import { InventoryAreaFilterOptions } from "@/types/inventory-area";

export interface FilterSlice {
  filters: InventoryAreaFilterOptions;
  setFilters: (filters: InventoryAreaFilterOptions) => void;
}

export const createFilterSlice = (
  set: (partial: Partial<FilterSlice>) => void
): FilterSlice => ({
  filters: {},
  setFilters: (filters) => set({ filters }),
});
