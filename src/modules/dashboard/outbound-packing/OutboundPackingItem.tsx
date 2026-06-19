import React from "react";

import ButtonDetail from "@/components/shared/ButtonDetail";
import VerificationStatusBadge from "@/components/shared/VerificationStatusBadge";
import { TableCell, TableRow } from "@/components/ui/table";
import { StockMovementItem } from "@/services/stockMovement/getStockMovementDataService";
import { convertToTitleCase, formatDateTime } from "@/utils/text";

interface OutboundPackingItemProps {
  item: StockMovementItem;
  index: number;
}

const OutboundPackingItem: React.FC<OutboundPackingItemProps> = ({ item, index }) => {
  const no = (index + 1).toString().padStart(4, "0");
  const outboundPackingDate = formatDateTime(item.created_at);
  const outboundPackingQty = item.new_item_status_histories?.length;
  const outboundPackingType = item.stock_movement_type.name;
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
          namespace="outbound-packing"
          statusCounts={statusCounts}
          verificationStatus={item.verification_status}
        />
      </TableCell>
      <TableCell>{convertToTitleCase(outboundPackingType)}</TableCell>
      <TableCell>{outboundPackingDate}</TableCell>
      <TableCell>{outboundPackingQty}</TableCell>
      <TableCell>{warehouse}</TableCell>
      <TableCell>{operator}</TableCell>
      <TableCell>
        <ButtonDetail href={`/dashboard/outbound-packing/${item.id}`} />
      </TableCell>
    </TableRow>
  );
};

export default OutboundPackingItem;