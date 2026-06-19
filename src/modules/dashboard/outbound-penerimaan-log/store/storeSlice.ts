export interface StoreSlice {
  selectedStoreId: string;
  setSelectedStoreId: (storeId: string) => void;
}

export const createStoreSlice = (
  set: (partial: Partial<StoreSlice>) => void,
): StoreSlice => ({
  selectedStoreId: "0",
  setSelectedStoreId: (storeId) => set({ selectedStoreId: storeId }),
});
