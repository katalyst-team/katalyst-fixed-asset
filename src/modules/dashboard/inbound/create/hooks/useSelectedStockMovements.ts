import { useMemo } from "react";

import { StockMovementResponse } from "@/services/stockMovement/getStockMovementDataService";

interface StockMovementData {
  data?: StockMovementResponse;
}

interface UseSelectedStockMovementsParams {
  stockMovementData: StockMovementData | undefined;
  selectedStockMovementIds: string[];
}

export function useSelectedStockMovements({
  stockMovementData,
  selectedStockMovementIds,
}: UseSelectedStockMovementsParams) {
  const selectedStockMovements = useMemo(() => {
    if (!stockMovementData?.data?.stock_movements) return [];
    return stockMovementData.data.stock_movements.filter((movement) =>
      selectedStockMovementIds.includes(movement.id),
    );
  }, [stockMovementData, selectedStockMovementIds]);

  return {
    selectedStockMovements,
  };
}
