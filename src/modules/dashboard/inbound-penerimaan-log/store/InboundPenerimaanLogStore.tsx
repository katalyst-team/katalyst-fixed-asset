import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createPaginationSlice, PaginationSlice } from "./paginationSlice";
import { createStoreSlice, StoreSlice } from "./storeSlice";

type InboundPenerimaanLogStore = PaginationSlice & FilterSlice & StoreSlice;

export const useInboundPenerimaanLogStore = create<InboundPenerimaanLogStore>()(
  devtools(
    (set, get) => ({
      ...createPaginationSlice(set, get),
      ...createFilterSlice(set, get),
      ...createStoreSlice(set),
    }),
    { name: "inbound-penerimaan-log-store" }
  )
);
