import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { DetailSkuProductHistoryItemType } from "@/types/detailSkuProductHistory";

interface DetailSkuProductHistoryItemProps {
  item: DetailSkuProductHistoryItemType;
}

const DetailSkuProductHistoryItem: React.FC<DetailSkuProductHistoryItemProps> = ({
  item,
}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{item.no}</TableCell>
      <TableCell>
        <Badge variant="outline">{item.status}</Badge>
      </TableCell>
      <TableCell className="font-medium">{item.quantity}</TableCell>
      <TableCell>{item.section}</TableCell>
      <TableCell>{item.lastUpdate}</TableCell>
      <TableCell>{item.operator}</TableCell>
      <TableCell>{item.note}</TableCell>
    </TableRow>
  );
};

export default DetailSkuProductHistoryItem;
