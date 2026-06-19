"use client";

import Link from "next/link";
import { useTranslation } from "next-i18next";

import ButtonDetail from "@/components/shared/ButtonDetail";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import { useBadgeStatus } from "@/hooks/useBadgeStatus";
import { LedgerItemType } from "@/types/ledger";
import { RfidCategory } from "@/types/rfid";
import { formatDisplayTimestamp } from "@/utils/dateTime";

interface DetailInventoryItemProps {
  item: LedgerItemType;
  index: number;
  qty?: number;
}

const DetailInventoryItem: React.FC<DetailInventoryItemProps> = ({
  item,
  index,
  qty = 1,
}) => {
  const { t } = useTranslation("detail-inventory");
  const { selectedTeam } = useUser();

  // Custom fallback logic for this component
  const customFallbackLogic = (
    status: string
  ): "destructive" | "secondary" | "default" | "outline" => {
    const statusKey = status.toLowerCase().replace(/\s+/g, "");

    switch (statusKey) {
      case "failed":
      case "inboundfailed":
      case "outboundfailed":
        return "destructive";
      case "success":
      case "inboundsuccess":
      case "outboundsuccess":
        return "default";
      case "waiting":
      case "waitinginbound":
      case "waitingoutbound":
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const { BadgeComponent } = useBadgeStatus(item.status.name, {
    customFallbackLogic,
    translationNamespace: "detail-inventory",
  });

  // Format date for display
  const formattedDate = item.updated_at
    ? formatDisplayTimestamp(item.updated_at)
    : t("notAvailable");

  // EPC detail page link (for EPC column)
  const epcDetailHref = item.rfid_detail?.id
    ? `/dashboard/epc/${item.rfid_detail.id}`
    : null;

  // Item history page link (for eye button)
  const storeId = selectedTeam || "0";
  const itemHistoryHref = item.id
    ? `/dashboard/store/${storeId}/items/${item.id}`
    : null;

  return (
    <TableRow>
      <TableCell>{index + 1}</TableCell>
      <TableCell className="font-mono">
        {epcDetailHref ? (
          <Link
            className="text-primary hover:text-primary/80 hover:underline"
            href={epcDetailHref}
          >
            {item.epc}
          </Link>
        ) : (
          item.epc
        )}
      </TableCell>
      <TableCell>{item.rfid_detail?.name || t("notAvailable")}</TableCell>
      <TableCell>
        {item.rfid_detail?.category || RfidCategory.SINGLE}
      </TableCell>
      <TableCell>
        {item.rfid_detail?.category === RfidCategory.PACKAGE ? qty : 1}
      </TableCell>
      <TableCell>{item.aging ?? t("notAvailable")}</TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell>{BadgeComponent}</TableCell>
      <TableCell>
        {itemHistoryHref ? <ButtonDetail href={itemHistoryHref} /> : "-"}
      </TableCell>
    </TableRow>
  );
};

export default DetailInventoryItem;
