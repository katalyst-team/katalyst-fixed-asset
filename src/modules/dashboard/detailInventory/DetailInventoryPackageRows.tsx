"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "next-i18next";

import ButtonDetail from "@/components/shared/ButtonDetail";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import { useBadgeStatus } from "@/hooks/useBadgeStatus";
import { LedgerItemType } from "@/types/ledger";
import { formatDisplayTimestamp } from "@/utils/dateTime";

interface PackageGroupRowProps {
  commonT: (key: string) => string;
  firstItem: LedgerItemType;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  packageGroup: LedgerItemType[];
  rowNumber: number;
}

export const PackageGroupRow: React.FC<PackageGroupRowProps> = ({
  commonT,
  firstItem,
  isExpanded,
  onToggleExpansion,
  packageGroup,
  rowNumber,
}) => {
  const { t } = useTranslation("detail-inventory");
  const { BadgeComponent } = useBadgeStatus(firstItem.status.name, {
    translationNamespace: "detail-inventory",
  });

  const formattedDate = firstItem.updated_at
    ? formatDisplayTimestamp(firstItem.updated_at)
    : "N/A";

  // EPC detail page link (for EPC column)
  const epcDetailHref = firstItem.rfid_detail?.id
    ? `/dashboard/epc/${firstItem.rfid_detail.id}`
    : null;

  return (
    <TableRow>
      <TableCell className="font-medium">{rowNumber}</TableCell>
      <TableCell className="text-sm font-mono">
        {epcDetailHref ? (
          <Link
            className="text-primary hover:text-primary/80 hover:underline"
            href={epcDetailHref}
          >
            {firstItem.epc}
          </Link>
        ) : (
          <span className="text-primary">{firstItem.epc}</span>
        )}
      </TableCell>
      <TableCell>{firstItem.rfid_detail?.name || "N/A"}</TableCell>
      <TableCell>
        {commonT("package")} ({packageGroup.length} items)
      </TableCell>
      <TableCell>{packageGroup.length}</TableCell>
      <TableCell>{firstItem.aging ?? t("notAvailable")}</TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell>{BadgeComponent}</TableCell>
      <TableCell>
        <Button
          aria-expanded={isExpanded}
          className="h-8 w-8 p-0"
          size="sm"
          variant="ghost"
          onClick={onToggleExpansion}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
};

interface PackageItemRowProps {
  item: LedgerItemType;
  itemIndex: number;
  packageGroup: LedgerItemType[];
  parentUpdatedDate: string;
}

export const PackageItemRow: React.FC<PackageItemRowProps> = ({
  item,
  itemIndex,
  packageGroup,
  parentUpdatedDate,
}) => {
  const { t } = useTranslation("detail-inventory");
  const { selectedTeam } = useUser();
  const { BadgeComponent } = useBadgeStatus(item.status.name, {
    translationNamespace: "detail-inventory",
  });

  // Item history page link (for eye button)
  const storeId = selectedTeam || "0";
  const itemHistoryHref = item.id
    ? `/dashboard/store/${storeId}/items/${item.id}`
    : null;

  return (
    <TableRow className="bg-muted/50">
      <TableCell className="font-medium text-sm text-muted-foreground pl-8">
        {itemIndex + 1}
      </TableCell>
      <TableCell className="text-primary text-sm">{item.sku.name}</TableCell>
      <TableCell>{item.rfid_detail?.name || "N/A"}</TableCell>
      <TableCell>-</TableCell>
      <TableCell>{packageGroup.length}</TableCell>
      <TableCell>{item.aging ?? t("notAvailable")}</TableCell>
      <TableCell>{parentUpdatedDate}</TableCell>
      <TableCell>{BadgeComponent}</TableCell>
      <TableCell>
        {itemHistoryHref ? <ButtonDetail href={itemHistoryHref} /> : "-"}
      </TableCell>
    </TableRow>
  );
};
