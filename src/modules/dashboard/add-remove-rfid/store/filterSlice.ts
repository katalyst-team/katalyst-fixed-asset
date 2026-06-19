import { ActionType } from "@/types/addRemoveRfid";

type FilterState = {
  actionType: ActionType;
  cursor?: string;
  searchQuery: string;
  selectedStoreId: string;
};

export interface FilterSlice {
  filters: FilterState;

  // Actions
  setActionType: (actionType: ActionType) => void;
  setCursor: (cursor?: string) => void;
  setFilters: (filters: Partial<FilterState> | ((prev: FilterState) => Partial<FilterState>)) => void;
  setSearchQuery: (query: string) => void;
  setSelectedStoreId: (storeId: string) => void;
}

export const createFilterSlice = (
  set: (partial: Partial<FilterSlice>) => void,
  get: () => FilterSlice
): FilterSlice => ({
  // Initial state
  filters: {
    actionType: ActionType.ADD,
    searchQuery: "",
    selectedStoreId: "",
  },

  // Actions
  setActionType: (actionType) =>
    set({
      filters: { ...get().filters, actionType },
    }),

  setCursor: (cursor) =>
    set({
      filters: { ...get().filters, cursor },
    }),

  setFilters: (filters) =>
    set({
      filters:
        typeof filters === "function"
          ? { ...get().filters, ...filters(get().filters) }
          : { ...get().filters, ...filters },
    }),

  setSearchQuery: (searchQuery) =>
    set({
      filters: { ...get().filters, searchQuery },
    }),

  setSelectedStoreId: (selectedStoreId) =>
    set({
      filters: { ...get().filters, selectedStoreId },
    }),
});
