import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createDataSlice, DataSlice } from "./dataSlice";
import { createFilterSlice, FilterSlice } from "./filterSlice";

type DetailStockAuditAreaStore = FilterSlice & DataSlice;

export const useDetailStockAuditAreaStore =
  create<DetailStockAuditAreaStore>()(
    devtools(
      (set) => ({
        ...createFilterSlice(set),
        ...createDataSlice(set),
      }),
      { name: "detail-stock-audit-area-store" }
    )
  );
