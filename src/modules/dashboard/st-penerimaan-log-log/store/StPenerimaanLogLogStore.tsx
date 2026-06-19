import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createPaginationSlice, PaginationSlice } from "./paginationSlice";

type StPenerimaanLogLogStore = PaginationSlice & FilterSlice;

export const useStPenerimaanLogLogStore = create<StPenerimaanLogLogStore>()(
  devtools(
    (set, get) => ({
      ...createPaginationSlice(set, get),
      ...createFilterSlice(set, get),
    }),
    { name: "st-penerimaan-log-log-store" }
  )
);
