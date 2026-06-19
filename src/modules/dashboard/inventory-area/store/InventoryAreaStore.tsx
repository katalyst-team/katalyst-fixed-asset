import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createStoreSelectionSlice, StoreSelectionSlice } from "./storeSelectionSlice";

type InventoryAreaStore = FilterSlice & StoreSelectionSlice;

export const useInventoryAreaStore = create<InventoryAreaStore>()(
  devtools(
    (set) => ({
      ...createFilterSlice(set),
      ...createStoreSelectionSlice(set),
    }),
    { name: "inventory-area-store" }
  )
);
