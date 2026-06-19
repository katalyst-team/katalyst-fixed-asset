import { StockMovementTypeDirectionEnum } from "@/services/stockMovement/getStockMovementDataService";
import {
  StockMovementDirection as SelectableStockMovementDirectionEnum,
} from "@/types/rfid";

export const SELECTABLE_STOCK_MOVEMENT_DIRECTIONS = [
  SelectableStockMovementDirectionEnum.INBOUND,
  SelectableStockMovementDirectionEnum.OUTBOUND,
] as const;

export type SelectableStockMovementDirection =
  (typeof SELECTABLE_STOCK_MOVEMENT_DIRECTIONS)[number];

export const LEDGER_STOCK_MOVEMENT_DIRECTION =
  StockMovementTypeDirectionEnum.LEDGER;
