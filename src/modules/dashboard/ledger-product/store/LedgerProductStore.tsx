import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createPaginationSlice, PaginationSlice } from "./paginationSlice";

type LedgerProductStore = PaginationSlice & FilterSlice;

export const useLedgerProductStore = create<LedgerProductStore>()(
  devtools(
    (set, get) => ({
      ...createPaginationSlice(set, get),
      ...createFilterSlice(set, get),
    }),
    { name: "ledger-product-store" }
  )
);
