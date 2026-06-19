export interface StoreSelectionSlice {
  selectedStoreId: string;

  // Actions
  setSelectedStoreId: (storeId: string) => void;
}

export const createStoreSelectionSlice = (
  set: (partial: Partial<StoreSelectionSlice>) => void
): StoreSelectionSlice => ({
  // Initial state - always start with "" to avoid SSR/CSR hydration mismatch
  selectedStoreId: "",

  // Actions
  setSelectedStoreId: (storeId) => {
    set({ selectedStoreId: storeId });
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedStoreId_stockAuditArea", storeId);
    }
  },
});

