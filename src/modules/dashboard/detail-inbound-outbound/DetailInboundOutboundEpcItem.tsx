import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import ButtonDetail from "@/components/shared/ButtonDetail";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useBadgeStatus } from "@/hooks/useBadgeStatus";
import { StockMovementEpcItemType } from "@/types/stockMovementDetail";

const METADATA_LABELS: Record<string, string> = {
  actual_length: "Panjang",
  diameter_end: "Dia. Akhir",
  diameter_start: "Dia. Awal",
  trim_type: "Trim",
  volume: "Volume",
};

interface DetailInboundOutboundEpcItemProps {
  item: StockMovementEpcItemType;
  qty: number;
  rowNumber?: number;
}

const DetailInboundOutboundEpcItem: React.FC<
  DetailInboundOutboundEpcItemProps
> = ({ item, qty, rowNumber }) => {
  const { BadgeComponent } = useBadgeStatus(item.lastStatus, {
    translationNamespace: "detail-inbound-outbound",
  });
  const [expanded, setExpanded] = useState(false);

  const epcDetailHref = item.id ? `/dashboard/epc/${item.id}` : null;

  const storeId = item.storeId || "0";
  const itemHistoryHref = item.itemId
    ? `/dashboard/store/${storeId}/items/${item.itemId}`
    : null;

  const hasMetadata = item.metadata && Object.keys(item.metadata).length > 0;

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          <div className="flex items-center gap-1">
            {hasMetadata && (
              <Button
                className="h-4 w-4 p-0"
                size="sm"
                variant="ghost"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
            {rowNumber || item.no}
          </div>
        </TableCell>
        <TableCell className="font-mono">
          {epcDetailHref ? (
            <Link
              className="text-blue-600 hover:text-blue-800 hover:underline"
              href={epcDetailHref}
            >
              {item.epc}
            </Link>
          ) : (
            <span className="text-blue-500">{item.epc}</span>
          )}
        </TableCell>
        <TableCell>{item.rfidName || "N/A"}</TableCell>
        <TableCell>{item.category}</TableCell>
        <TableCell>{item.category === "PACKAGE" ? qty : 1}</TableCell>
        <TableCell>{item.lastUpdate}</TableCell>
        <TableCell>{BadgeComponent}</TableCell>
        <TableCell>
          {itemHistoryHref ? <ButtonDetail href={itemHistoryHref} /> : "-"}
        </TableCell>
      </TableRow>
      {expanded && hasMetadata && (
        <TableRow className="bg-muted/30">
          <TableCell className="py-2 pl-10" colSpan={8}>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {Object.entries(item.metadata!).map(([key, value]) => (
                <span key={key}>
                  <span className="text-muted-foreground">
                    {METADATA_LABELS[key] ?? key}:
                  </span>{" "}
                  <span className="font-medium">{String(value)}</span>
                </span>
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default DetailInboundOutboundEpcItem;
