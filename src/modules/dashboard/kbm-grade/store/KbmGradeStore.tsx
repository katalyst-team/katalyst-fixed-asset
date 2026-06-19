import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createPaginationSlice, PaginationSlice } from "./paginationSlice";

interface ResetSlice {
  resetStore: () => void;
}

type KbmGradeStore = PaginationSlice & FilterSlice & ResetSlice;

export const useKbmGradeStore = create<KbmGradeStore>()(
  devtools(
    (set, get) => ({
      ...createPaginationSlice(set, get),
      ...createFilterSlice(set, get),
      resetStore: () => {
        set({
          currentPage: 1,
          filters: {},
          itemLimit: 10,
        });
      },
    }),
    { name: "kbm-grade-store" }
  )
);
