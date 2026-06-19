export interface StoreSelectionSlice {
  selectedStoreId: string;

  // Actions
  setSelectedStoreId: (storeId: string) => void;
}

export const createStoreSelectionSlice = (
  set: (partial: Partial<StoreSelectionSlice>) => void
): StoreSelectionSlice => ({
  // Initial state
  selectedStoreId: (() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedStoreId_gateLog") || "";
    }
    return "";
  })(),

  // Actions
  setSelectedStoreId: (storeId) => {
    set({ selectedStoreId: storeId });
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedStoreId_gateLog", storeId);
    }
  },
});
