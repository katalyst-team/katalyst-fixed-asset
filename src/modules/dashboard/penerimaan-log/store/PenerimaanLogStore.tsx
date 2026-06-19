import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createPaginationSlice, PaginationSlice } from "./paginationSlice";

type PenerimaanLogStore = PaginationSlice & FilterSlice;

export const usePenerimaanLogStore = create<PenerimaanLogStore>()(
  devtools(
    (set, get) => ({
      ...createPaginationSlice(set, get),
      ...createFilterSlice(set, get),
    }),
    { name: "penerimaan-log-store" }
  )
);
