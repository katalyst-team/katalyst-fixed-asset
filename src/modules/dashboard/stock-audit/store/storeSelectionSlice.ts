export interface StoreSelectionSlice {
  selectedStoreId: string;

  // Actions
  setSelectedStoreId: (storeId: string) => void;
}

export const createStoreSelectionSlice = (
  set: (partial: Partial<StoreSelectionSlice>) => void,
): StoreSelectionSlice => ({
  // Initial state
  selectedStoreId: "",

  // Actions
  setSelectedStoreId: (storeId) => {
    set({ selectedStoreId: storeId });
    // Persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedStoreId_stockAudit", storeId);
    }
  },
});
