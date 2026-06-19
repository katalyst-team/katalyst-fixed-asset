import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createPaginationSlice, PaginationSlice } from "./paginationSlice";

type OutboundStore = PaginationSlice & FilterSlice;

export const useOutboundStore = create<OutboundStore>()(
  devtools(
    (set, get) => ({
      ...createPaginationSlice(set, get),
      ...createFilterSlice(set, get),
    }),
    { name: "outbound-store" }
  )
);
