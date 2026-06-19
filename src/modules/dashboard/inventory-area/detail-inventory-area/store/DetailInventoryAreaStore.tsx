import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createFilterSlice, FilterSlice } from "./filterSlice";

export interface PaginationSlice {
  currentOffset: number;
  setCurrentOffset: (offset: number) => void;
  resetOffset: () => void;
}

export const createPaginationSlice = (
  set: (partial: Partial<PaginationSlice>) => void
): PaginationSlice => ({
  currentOffset: 0,
  resetOffset: () => set({ currentOffset: 0 }),
  setCurrentOffset: (offset) => set({ currentOffset: offset }),
});

type DetailInventoryAreaStore = FilterSlice & PaginationSlice;

export const useDetailInventoryAreaStore = create<DetailInventoryAreaStore>()(
  devtools(
    (set) => ({
      ...createFilterSlice(set),
      ...createPaginationSlice(set),
    }),
    { name: "detail-inventory-area-store" }
  )
);
