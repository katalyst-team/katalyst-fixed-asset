import { TableCell, TableRow } from "@/components/ui/table";
import { useBadgeStatus } from "@/hooks/useBadgeStatus";
import { DetailLedgerHistoryItemType } from "@/types/detailLedger";

interface DetailLedgerHistoryItemProps {
  item: DetailLedgerHistoryItemType;
}

const DetailLedgerHistoryItem: React.FC<DetailLedgerHistoryItemProps> = ({
  item,
}) => {
  const { BadgeComponent } = useBadgeStatus(item.status, {
    translationNamespace: "ledger",
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

export default DetailLedgerHistoryItem;
