import { StockMovementType } from "@/services/stock-movement-types/getStockMovementTypesService";

import { LEDGER_STOCK_MOVEMENT_DIRECTION } from "../constants";

export interface DataSlice {
  localItemsPerPage: number;
  stockMovementTypesData: StockMovementType[];

  // Actions
  setLocalItemsPerPage: (itemsPerPage: number) => void;
  setStockMovementTypesData: (data: StockMovementType[]) => void;
}

export const createDataSlice = (
  set: (partial: Partial<DataSlice>) => void
): DataSlice => ({
  // Initial state
  localItemsPerPage: 20,

  // Actions
  setLocalItemsPerPage: (itemsPerPage) => set({ localItemsPerPage: itemsPerPage }),
  setStockMovementTypesData: (data) =>
    set({
      stockMovementTypesData: data.filter(
        (item) => item.direction !== LEDGER_STOCK_MOVEMENT_DIRECTION
      ),
    }),
  stockMovementTypesData: [],
});
