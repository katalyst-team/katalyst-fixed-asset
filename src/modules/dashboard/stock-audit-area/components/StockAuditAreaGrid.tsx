import React from "react";

import { StockAuditAreaItem } from "@/types/stock-audit-area";

import StockAuditAreaCard from "./StockAuditAreaCard";

interface StockAuditAreaGridProps {
  basePath?: string;
  data: StockAuditAreaItem[];
  storeId: string;
}

const StockAuditAreaGrid: React.FC<StockAuditAreaGridProps> = ({
  basePath,
  data,
  storeId,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((item) => (
        <StockAuditAreaCard key={item.id} basePath={basePath} item={item} storeId={storeId} />
      ))}
    </div>
  );
};

export default StockAuditAreaGrid;
