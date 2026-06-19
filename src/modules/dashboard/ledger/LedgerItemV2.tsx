import { useTranslation } from "next-i18next";
import React from "react";
import { v4 as uuidv4 } from "uuid";

import ButtonDelete from "@/components/shared/ButtonDelete";
import ButtonDetail from "@/components/shared/ButtonDetail";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useDeleteStockMovementMutation from "@/hooks/api/stockMovement/useDeleteStockMovementMutation";
import { useBadgeStatus } from "@/hooks/useBadgeStatus";
import {
  StockMovementItem,
  StockMovementTypeNameEnum,
} from "@/services/stockMovement/getStockMovementDataService";
import { formatDateTime } from "@/utils/text";

// Use uuidv4 for ID generation
export const generateRandomId = (): string => {
  return uuidv4();
};

// Format type display based on stock movement direction with i18n support
const formatTypeDisplay = (
  direction: StockMovementTypeNameEnum,
  t: (key: string) => string,
): string => {
  switch (direction) {
    case StockMovementTypeNameEnum.LEDGER:
      return t("types.ledger");
    case StockMovementTypeNameEnum.LEDGER_PACKING:
      return t("types.ledger_packing");
    default:
      // Capitalize each word and replace underscores with spaces
      return direction
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  }
};

interface StatusBadgeItemProps {
  status: string;
  count: number;
}

const StatusBadgeItem: React.FC<StatusBadgeItemProps> = ({ status, count }) => {
  const { BadgeComponent } = useBadgeStatus(status, {
    extText: count > 1 ? `(${count})` : "",
    translationNamespace: "ledger",
  });

  return <>{BadgeComponent}</>;
};

interface LedgerItemV2Props {
  item: StockMovementItem;
  isSelected?: boolean;
  onSelect?: (item: StockMovementItem, isSelected: boolean) => void;
  showCheckbox?: boolean;
}

const LedgerItemV2: React.FC<LedgerItemV2Props> = ({
  item,
  isSelected = false,
  onSelect,
  showCheckbox = true,
}) => {
  const { t } = useTranslation("ledger");
  const { tokenPayload, selectedTeam } = useUser();
  const { mutateAsync: deleteStockMovement, isPending: isDeleting } =
    useDeleteStockMovementMutation();

  const inboundDate = formatDateTime(item.created_at);
  const inboundQty = item.new_item_status_histories?.length;

  // Group items by status and count them
  const statusCounts: Record<string, number> = {};

  item.new_item_status_histories?.forEach((history) => {
    const statusName = history.item.status.name;
    statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
  });

  const isPackingType =
    item.stock_movement_type.name === StockMovementTypeNameEnum.LEDGER_PACKING;

  // Calculate unit print: 1 for packing type, otherwise use inboundQty
  const unitPrint = isPackingType ? 1 : inboundQty;

  const skuCounts: Record<string, number> = {};

  item.new_item_status_histories?.forEach((history) => {
    const skuName = history.item.sku.name;
    skuCounts[skuName] = (skuCounts[skuName] || 0) + 1;
  });

  // For packing type, show without quantity counts
  const skuDisplay = isPackingType
    ? Object.keys(skuCounts).join(", ")
    : Object.entries(skuCounts)
        .map(([sku, count]) => `${sku} (${count})`)
        .join(", ");

  // Handle delete stock movement
  const handleDeleteStockMovement = async () => {
    if (
      !tokenPayload?.organization_id ||
      !selectedTeam ||
      !item.new_item_status_histories
    ) {
      return;
    }

    // Extract item IDs from new_item_status_histories
    const itemIds = item.new_item_status_histories.map(
      (history) => history.item.id,
    );

    try {
      await deleteStockMovement({
        itemIds,
        organizationId: tokenPayload.organization_id,
        stockMovementId: item.id,
        storeId: selectedTeam,
      });
    } catch (error) {
      console.error("Failed to delete stock movement:", error);
    }
  };

  // Render status badges using the custom hook
  const renderStatusBadges = () => {
    if (Object.keys(statusCounts).length === 0) {
      return <span className="text-muted-foreground">{t("status.unknown")} (0)</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(statusCounts).map(([status, count]) => (
          <StatusBadgeItem
            key={status}
            count={isPackingType ? 1 : count}
            status={status}
          />
        ))}
      </div>
    );
  };

  return (
    <TableRow>
      {showCheckbox && (
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            className="border-black"
            onCheckedChange={(checked) => {
              onSelect?.(item, checked as boolean);
            }}
          />
        </TableCell>
      )}
      <TableCell className="font-medium">{item.id.slice(0, 4)}</TableCell>
      <TableCell>{skuDisplay}</TableCell>
      <TableCell>
        {item.new_item_status_histories?.[0]?.item?.sku?.internal_code || "-"}
      </TableCell>

      <TableCell>
        {formatTypeDisplay(item.stock_movement_type.name, t)}
      </TableCell>
      <TableCell>{unitPrint}</TableCell>
      <TableCell>{renderStatusBadges()}</TableCell>
      <TableCell>{inboundDate}</TableCell>
      <TableCell>{inboundQty} </TableCell>

      <TableCell className="flex gap-2">
        <ButtonDetail href={`/dashboard/ledger-v2/${item.id}`} />
        <ButtonDelete
          disabled={isDeleting}
          onSubmit={handleDeleteStockMovement}
        />
      </TableCell>
    </TableRow>
  );
};

export default LedgerItemV2;
