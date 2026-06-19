import { TableCell, TableRow } from "@/components/ui/table";
import { useBadgeStatus } from "@/hooks/useBadgeStatus";
import { DetailSkuProductHistoryItemType } from "@/types/detailSkuProductHistory";

interface DetailProductHistoryItemProps {
  item: DetailSkuProductHistoryItemType;
}

const DetailProductHistoryItem: React.FC<DetailProductHistoryItemProps> = ({
  item,
}) => {
  const { BadgeComponent } = useBadgeStatus(item.status, {
    translationNamespace: "detail-inventory",
  });

  return (
    <TableRow>
      <TableCell className="font-medium">{item.no}</TableCell>
      <TableCell>{BadgeComponent}</TableCell>
      <TableCell>{item.lastUpdate}</TableCell>
      <TableCell>{item.operator}</TableCell>
    </TableRow>
  );
};

export default DetailProductHistoryItem;
