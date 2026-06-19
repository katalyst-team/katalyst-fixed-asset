import { Eye } from "lucide-react";
import Link from "next/link";

import BadgeStatus from "@/components/shared/BadgeStatus";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { convertToTitleCase } from "@/utils/text";

import { ItemHistoryEntry } from "./useItemHistory";

interface ItemHistoryRowProps {
  item: ItemHistoryEntry;
}

const ItemHistoryRow: React.FC<ItemHistoryRowProps> = ({ item }) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{item.no}</TableCell>
      <TableCell>
        <BadgeStatus status={item.status} />
      </TableCell>
      <TableCell>{convertToTitleCase(item.movementType)}</TableCell>
      <TableCell>{item.store}</TableCell>
      <TableCell>{item.section}</TableCell>
      <TableCell>{item.quantity}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className="truncate max-w-[200px]" title={item.note}>
            {item.note}
          </span>
          {item.images && item.images.length > 0 && (
            <span className="text-xs text-blue-600">
              {item.images.length} image{item.images.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">{item.lastUpdate}</TableCell>
      <TableCell className="whitespace-nowrap">{item.operator}</TableCell>
      <TableCell className="whitespace-nowrap">{item.operator}</TableCell>
      <TableCell>
        {(() => {
          const type = item.movementType?.toUpperCase();
          const id = item.stockMovementId;
          let url = null;

          if (id) {
            // Priority check for specific statuses
            if (item.status === "SUCCESS_INBOUND") {
              url = `/dashboard/inbound/${id}`;
            } else if (item.status === "SUCCESS_OUTBOUND") {
              url = `/dashboard/outbound/${id}`;
            } else {
              // Fallback to movement type
              if (type === "INBOUND") {
                url = `/dashboard/inbound/${id}`;
              } else if (type === "OUTBOUND") {
                url = `/dashboard/outbound/${id}`;
              } else if (type === "LEDGER") {
                url = `/dashboard/ledger-v2/${id}`;
              }
            }
          }

          if (url) {
            return (
              <Button asChild size="icon" variant="ghost">
                <Link href={url}>
                  <Eye className="w-4 h-4" />
                </Link>
              </Button>
            );
          }
          return null;
        })()}
      </TableCell>
    </TableRow>
  );
};

export default ItemHistoryRow;
