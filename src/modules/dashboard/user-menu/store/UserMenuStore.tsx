import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createPaginationSlice, PaginationSlice } from "./paginationSlice";

type UserMenuStore = PaginationSlice & FilterSlice;

export const useUserMenuStore = create<UserMenuStore>()(
  devtools(
    (set, get) => ({
      ...createPaginationSlice(set, get),
      ...createFilterSlice(set, get),
    }),
    { name: "user-menu-store" }
  )
);
