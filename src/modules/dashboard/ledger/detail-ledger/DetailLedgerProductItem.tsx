import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { DetailLedgerProductItemType } from "@/types/detailLedger";
import { convertToTitleCase } from "@/utils/text";

interface DetailLedgerProductItemProps {
  item: DetailLedgerProductItemType;
}

const DetailLedgerProductItem: React.FC<DetailLedgerProductItemProps> = ({
  item,
}) => {
  const { t } = useTranslation("ledger");
  const { push } = useRouter();
  const hasHistory = Boolean(item.id);

  const handleRowClick = () => {
    if (!hasHistory) {
      return;
    }
    void push(`/dashboard/sku/history/${item.id}`);
  };

  return (
    <TableRow
      className={
        hasHistory
          ? "cursor-pointer hover:brightness-90 active:brightness-75"
          : "cursor-not-allowed"
      }
      onClick={handleRowClick}
    >
      <TableCell className="font-medium">{item.no}</TableCell>
      <TableCell>{item.productName}</TableCell>
      <TableCell>{item.quantity}</TableCell>
      <TableCell>
        <Badge>{t(`status.${item.lastStatus.toLowerCase()}`, convertToTitleCase(item.lastStatus))}</Badge>
      </TableCell>
    </TableRow>
  );
};

export default DetailLedgerProductItem;
