import { useMemo } from "react";

import { RfidMapData, RfidMapItem } from "@/types/rfid";

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

interface UseRfidsMapOptionProcessingParams {
  rfidsItems: RfidMapData[];
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

export function RfidsMapOptionProcessing({
  rfidsItems,
  storeData,
  storeAreaData,
  stockMovementTypes,
  stockMovementTypeFilter = "INBOUND",
}: UseRfidsMapOptionProcessingParams) {
  const rfidOptions = useMemo(() => {
    if (!rfidsItems) return [];
    return rfidsItems.map((rfid) => {
      const items = rfid.items || [];

      // Aggregate items by SKU name and count quantities
      const skuQuantities: Record<string, number> = {};
      items.forEach((item: RfidMapItem) => {
        const skuName = item.sku?.name || "Unknown";
        skuQuantities[skuName] = (skuQuantities[skuName] || 0) + 1;
      });

      // Build label: show max 3 products, then "..."
      const skuEntries = Object.entries(skuQuantities);
      const maxToShow = 3;
      const productsToShow = skuEntries.slice(0, maxToShow);
      const hasMore = skuEntries.length > maxToShow;

      const productsBreakdown = productsToShow
        .map(([name, qty]) => `${name} (${qty})`)
        .join(", ");

      const suffix = hasMore ? ", ..." : "";
      const label = rfid.name
        ? `${rfid.name} - ${productsBreakdown}${suffix}`
        : `${productsBreakdown}${suffix}`;

      return {
        label,
        value: rfid.id,
      };
    });
  }, [rfidsItems]);

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
    rfidOptions,
    stockMovementTypeOptions,
    storeAreaOptions,
    storeOptions,
  };
}
