export interface StoreSelectionSlice {
  selectedStoreId: string;
  setSelectedStoreId: (storeId: string) => void;
}

export const createStoreSelectionSlice = (
  set: (partial: Partial<StoreSelectionSlice>) => void
): StoreSelectionSlice => ({
  // Always start with "" to avoid SSR/CSR hydration mismatch
  selectedStoreId: "",

  setSelectedStoreId: (storeId) => {
    set({ selectedStoreId: storeId });
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedStoreId_inventoryArea", storeId);
    }
  },
});
