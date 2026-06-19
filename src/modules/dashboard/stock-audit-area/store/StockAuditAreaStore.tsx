import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createDataSlice, DataSlice } from "./dataSlice";
import { createFilterSlice, FilterSlice } from "./filterSlice";
import {
  createStoreSelectionSlice,
  StoreSelectionSlice,
} from "./storeSelectionSlice";

type StockAuditAreaStore = FilterSlice &
  DataSlice &
  StoreSelectionSlice;

export const useStockAuditAreaStore = create<StockAuditAreaStore>()(
  devtools(
    (set) => ({
      ...createFilterSlice(set),
      ...createDataSlice(set),
      ...createStoreSelectionSlice(set),
    }),
    { name: "stock-audit-area-store" }
  )
);

