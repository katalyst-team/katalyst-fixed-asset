import ButtonDetail from "@/components/shared/ButtonDetail";
import { TableCell, TableRow } from "@/components/ui/table";
import { useBadgeStatus } from "@/hooks/useBadgeStatus";
import { StockMovementProductItemType } from "@/types/stockMovementDetail";

interface DetailInboundOutboundProductItemProps {
  item: StockMovementProductItemType;
}

const DetailInboundOutboundProductItem: React.FC<
  DetailInboundOutboundProductItemProps
> = ({ item }) => {
  const { BadgeComponent } = useBadgeStatus(item.lastStatus, {
    translationNamespace: "detail-inbound-outbound",
  });

  // Determine link based on SKU type
  const href =
    item.skuType === "UNIQUE"
      ? `/dashboard/product/${item.skuId}`
      : `/dashboard/sku/${item.skuId}`;

  return (
    <TableRow>
      <TableCell className="font-medium">{item.no}</TableCell>
      <TableCell>{item.productName}</TableCell>
      <TableCell>{item.category}</TableCell>
      <TableCell>{item.quantity}</TableCell>
      <TableCell>{BadgeComponent}</TableCell>
      <TableCell>
        <ButtonDetail href={href} />
      </TableCell>
    </TableRow>
  );
};

export default DetailInboundOutboundProductItem;
