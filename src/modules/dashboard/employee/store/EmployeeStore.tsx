import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createPaginationSlice, PaginationSlice } from "./paginationSlice";

type EmployeeStore = PaginationSlice & FilterSlice;

export const useEmployeeStore = create<EmployeeStore>()(
  devtools(
    (set, get) => ({
      ...createPaginationSlice(set, get),
      ...createFilterSlice(set, get),
    }),
    { name: "employee-store" }
  )
);
