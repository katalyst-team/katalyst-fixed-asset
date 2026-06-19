import React from "react";

import ButtonDetail from "@/components/shared/ButtonDetail";
import VerificationStatusBadge from "@/components/shared/VerificationStatusBadge";
import { TableCell, TableRow } from "@/components/ui/table";
import { StockMovementItem } from "@/services/stockMovement/getStockMovementDataService";
import { convertToTitleCase, formatDateTime } from "@/utils/text";

interface InboundPackingItemProps {
  item: StockMovementItem;
  index: number;
}

const InboundPackingItem: React.FC<InboundPackingItemProps> = ({ item, index }) => {
  const no = (index + 1).toString().padStart(4, "0");
  const inboundPackingDate = formatDateTime(item.created_at);
  const inboundPackingQty = item.new_item_status_histories?.length || 0;
  const inboundPackingType = item.stock_movement_type.name;
  const operator = item.editor.name;
  const warehouse = item.store_name || "-";

  const statusCounts: Record<string, number> = {};

  item.new_item_status_histories?.forEach((history) => {
    const statusName = history.item.status.name;
    statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
  });

  return (
    <TableRow>
      <TableCell className="font-medium">{no}</TableCell>
      <TableCell>
        <VerificationStatusBadge
          namespace="inbound-packing"
          statusCounts={statusCounts}
          verificationStatus={item.verification_status}
        />
      </TableCell>
      <TableCell>{convertToTitleCase(inboundPackingType)}</TableCell>
      <TableCell>{inboundPackingDate}</TableCell>
      <TableCell>{inboundPackingQty}</TableCell>
      <TableCell>{warehouse}</TableCell>
      <TableCell>{operator}</TableCell>
      <TableCell>
        <div className="flex h-full gap-2">
          <ButtonDetail href={`/dashboard/inbound-packing/${item.id}`} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default InboundPackingItem;