import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createDataSlice, DataSlice } from "./dataSlice";
import { createFilterSlice, FilterSlice } from "./filterSlice";
import { createPaginationSlice, PaginationSlice } from "./paginationSlice";

type ReportStore = PaginationSlice & FilterSlice & DataSlice;

export const useReportStore = create<ReportStore>()(
  devtools(
    (set, get) => ({
      ...createPaginationSlice(set, get),
      ...createFilterSlice(set),
      ...createDataSlice(set),
    }),
    { name: "report-store" }
  )
);
