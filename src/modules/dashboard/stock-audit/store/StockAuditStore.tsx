import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createDataSlice, DataSlice } from "./dataSlice";
import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createPaginationSlice, PaginationSlice } from "./paginationSlice";
import { createStoreSelectionSlice, StoreSelectionSlice } from "./storeSelectionSlice";

type StockAuditStore = PaginationSlice & FilterSlice & DataSlice & StoreSelectionSlice;

export const useStockAuditStore = create<StockAuditStore>()(
  devtools(
    (set, get) => ({
      ...createPaginationSlice(set, get),
      ...createFilterSlice(set),
      ...createDataSlice(set),
      ...createStoreSelectionSlice(set),
    }),
    { name: "stock-audit-store" }
  )
);