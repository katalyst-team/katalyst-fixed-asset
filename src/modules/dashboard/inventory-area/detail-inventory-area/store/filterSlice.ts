import { InventoryAreaDetailFilterOptions } from "@/types/inventory-area";

export interface FilterSlice {
  filters: InventoryAreaDetailFilterOptions;
  setFilters: (filters: InventoryAreaDetailFilterOptions) => void;
}

export const createFilterSlice = (
  set: (partial: Partial<FilterSlice>) => void
): FilterSlice => ({
  filters: { limit: 20 },
  setFilters: (filters) => set({ filters }),
});
