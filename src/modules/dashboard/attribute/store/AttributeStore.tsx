import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createPaginationSlice, PaginationSlice } from "./paginationSlice";

type AttributeStore = FilterSlice & PaginationSlice;

export const useAttributeStore = create<AttributeStore>()(
  devtools(
    (set, get) => ({
      ...createFilterSlice(set, get),
      ...createPaginationSlice(set, get),
    }),
    { name: "attribute-v2-store" }
  )
);
