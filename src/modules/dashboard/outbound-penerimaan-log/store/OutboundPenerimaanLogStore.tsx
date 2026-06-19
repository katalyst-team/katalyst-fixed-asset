import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createPaginationSlice, PaginationSlice } from "./paginationSlice";
import { createStoreSlice, StoreSlice } from "./storeSlice";

type OutboundPenerimaanLogStore = PaginationSlice & FilterSlice & StoreSlice;

export const useOutboundPenerimaanLogStore = create<OutboundPenerimaanLogStore>()(
  devtools(
    (set, get) => ({
      ...createPaginationSlice(set, get),
      ...createFilterSlice(set, get),
      ...createStoreSlice(set),
    }),
    { name: "outbound-penerimaan-log-store" }
  )
);
