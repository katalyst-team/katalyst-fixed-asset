import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { StockMovementHistoryItemType } from "@/types/stockMovementDetail";
import { convertToTitleCase } from "@/utils/text";
interface DetailInboundOutboundHistoryItemProps {
  item: StockMovementHistoryItemType;
}

const DetailInboundOutboundHistoryItem: React.FC<
  DetailInboundOutboundHistoryItemProps
> = ({ item }) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{item.no}</TableCell>
      <TableCell>
        <Badge>{convertToTitleCase(item.status)}</Badge>
      </TableCell>
      <TableCell>{item.lastUpdate}</TableCell>
      <TableCell>{item.operator}</TableCell>
    </TableRow>
  );
};

export default DetailInboundOutboundHistoryItem;
