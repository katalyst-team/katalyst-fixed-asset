import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createDataSlice, DataSlice } from "./dataSlice";
import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createPaginationSlice, PaginationSlice } from "./paginationSlice";

type StockMovementTypesStore = PaginationSlice & FilterSlice & DataSlice;

export const useStockMovementTypesStore = create<StockMovementTypesStore>()(
  devtools(
    (set, get) => ({
      ...createPaginationSlice(set, get),
      ...createFilterSlice(set),
      ...createDataSlice(set),
    }),
    { name: "stock-movement-types-store" }
  )
);
