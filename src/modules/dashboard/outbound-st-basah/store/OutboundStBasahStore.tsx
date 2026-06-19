import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createPaginationSlice, PaginationSlice } from "./paginationSlice";
import { createStoreSlice, StoreSlice } from "./storeSlice";

type OutboundStBasahStore = PaginationSlice & FilterSlice & StoreSlice;

export const useOutboundStBasahStore = create<OutboundStBasahStore>()(
  devtools(
    (set, get) => ({
      ...createPaginationSlice(set, get),
      ...createFilterSlice(set, get),
      ...createStoreSlice(set),
    }),
    { name: "outbound-st-basah-store" }
  )
);
