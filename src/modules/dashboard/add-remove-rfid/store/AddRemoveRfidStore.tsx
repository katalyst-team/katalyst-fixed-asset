import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createPaginationSlice, PaginationSlice } from "./paginationSlice";

type AddRemoveRfidStore = PaginationSlice & FilterSlice;

export const useAddRemoveRfidStore = create<AddRemoveRfidStore>()(
  devtools(
    (set, get) => ({
      ...createFilterSlice(set, get),
      ...createPaginationSlice(set),
    }),
    { name: "add-remove-rfid-store" }
  )
);
