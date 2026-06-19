import React from "react";

import { SectionInventorySummary } from "@/types/inventory-area";

import InventoryAreaCard from "./InventoryAreaCard";

interface InventoryAreaGridProps {
  data: SectionInventorySummary[];
  storeId: string;
}

const InventoryAreaGrid: React.FC<InventoryAreaGridProps> = ({
  data,
  storeId,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((item) => (
        <InventoryAreaCard
          key={item.id}
          item={item}
          storeId={storeId}
        />
      ))}
    </div>
  );
};

export default InventoryAreaGrid;
