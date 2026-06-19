import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createPaginationSlice, PaginationSlice } from "./paginationSlice";
import { createStoreSlice, StoreSlice } from "./storeSlice";

type InboundLogStore = PaginationSlice & FilterSlice & StoreSlice;

export const useInboundLogStore = create<InboundLogStore>()(
  devtools(
    (set, get) => ({
      ...createPaginationSlice(set, get),
      ...createFilterSlice(set, get),
      ...createStoreSlice(set),
    }),
    { name: "inbound-log-store" }
  )
);
