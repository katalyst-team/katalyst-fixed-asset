import { useMemo } from "react";

import { StockMovementResponse } from "@/services/stockMovement/getStockMovementDataService";

interface Store {
  id: string;
  name: string;
}

interface StoreData {
  data?: {
    stores?: Store[];
  };
}

interface Section {
  id: string;
  name: string;
}

interface StoreAreaData {
  data?: {
    sections?: Section[];
  };
}

interface UseOptionProcessingParams {
  stockMovementData: { data?: StockMovementResponse } | undefined;
  storeData: StoreData | undefined;
  storeAreaData: StoreAreaData | undefined;
  stockMovementTypes:
    | Array<{
        id: string;
        name: string;
        direction: string;
      }>
    | undefined;
  stockMovementTypeFilter?: "INBOUND" | "OUTBOUND";
}

export function useOptionProcessing({
  stockMovementData,
  storeData,
  storeAreaData,
  stockMovementTypes,
  stockMovementTypeFilter = "INBOUND",
}: UseOptionProcessingParams) {
  const stockMovementOptions = useMemo(() => {
    if (!stockMovementData?.data?.stock_movements) return [];
    return stockMovementData.data.stock_movements.map((movement) => {
      const skuCounts: Record<string, number> = {};

      movement.new_item_status_histories?.forEach((history) => {
        const skuName = history.item.sku.name;
        skuCounts[skuName] = (skuCounts[skuName] || 0) + 1;
      });

      const skuDisplay = Object.entries(skuCounts)
        .map(([sku, count]) => `${sku} (${count})`)
        .join(", ");

      return {
        label: `${movement.id.substring(0, 4)} - ${skuDisplay}`,
        value: movement.id,
      };
    });
  }, [stockMovementData]);

  const storeOptions = useMemo(() => {
    if (!storeData?.data?.stores) return [];
    return storeData.data.stores.map((store) => ({
      label: store.name,
      value: store.id,
    }));
  }, [storeData]);

  const storeAreaOptions = useMemo(() => {
    if (!storeAreaData?.data?.sections) return [];
    return storeAreaData.data.sections.map((area) => ({
      label: area.name,
      value: area.id,
    }));
  }, [storeAreaData]);

  const stockMovementTypeOptions = useMemo(() => {
    if (!stockMovementTypes) return [];
    return stockMovementTypes
      .filter((type) => type.direction === stockMovementTypeFilter)
      .map((type) => ({
        label: type.name,
        value: type.id,
      }));
  }, [stockMovementTypes, stockMovementTypeFilter]);

  return {
    stockMovementOptions,
    stockMovementTypeOptions,
    storeAreaOptions,
    storeOptions,
  };
}
