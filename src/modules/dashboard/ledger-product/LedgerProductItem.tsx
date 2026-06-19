"use client";

import Image from "next/image";
import { useTranslation } from "next-i18next";
import { useState } from "react";

import ImageGalleryModal from "@/components/shared/ImageGalleryModal";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useBadgeStatus } from "@/hooks/useBadgeStatus";
import { SkuItemType } from "@/types/sku";
import { formatDisplayTimestamp } from "@/utils/dateTime";
import { convertToTitleCase } from "@/utils/text";

import LedgerProductScanAction from "./LedgerProductScanAction";
import {
    formatAttributeValues,
    getAttributeValue,
    UniqueAttribute,
} from "./utils/attributeUtils";

interface ActiveColumns {
  agingDays: boolean;
  areaTransferDate: boolean;
  inboundDate: boolean;
  internalCode: boolean;
  itemStatus: boolean;
  movementType: boolean;
  outboundDate: boolean;
  rfidEpc: boolean;
  rfidName: boolean;
  section: boolean;
}

interface LedgerProductItemProps {
  activeColumns: ActiveColumns;
  item: SkuItemType;
  num?: number;
  uniqueAttributes: UniqueAttribute[];
}

const LedgerProductItem: React.FC<LedgerProductItemProps> = ({
  activeColumns,
  item,
  num,
  uniqueAttributes,
}) => {
  const { t } = useTranslation(["common", "ledger-product"]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const imageUrls = item.image_urls || [];

  // Use badge status hook for item status
  const { BadgeComponent: itemStatusBadge } = useBadgeStatus(
    item.item?.status?.name || "",
    {
      fallbackVariant: "outline",
      translationNamespace: "ledger-product",
    }
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{num ?? item.id}</TableCell>
      <TableCell>
        <LedgerProductScanAction skuData={item} />
      </TableCell>
      <TableCell>
        {imageUrls.length > 0 ? (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              {imageUrls.slice(0, 3).map((imageUrl, imgIndex) => (
                <div
                  key={imgIndex}
                  className="relative h-12 w-12 rounded-md overflow-hidden border-2 border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => {
                    setSelectedImageIndex(imgIndex);
                    setIsImageModalOpen(true);
                  }}
                >
                  <Image
                    fill
                    alt={t("ledger-product:item.imageAlt", {
                      defaultValue: `${item.name} thumbnail ${imgIndex + 1}`,
                      index: imgIndex + 1,
                    })}
                    className="object-cover"
                    src={imageUrl}
                  />
                </div>
              ))}
            </div>
            {imageUrls.length > 3 && (
              <button
                className="ml-2 text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full transition-colors"
                onClick={() => {
                  setSelectedImageIndex(3);
                  setIsImageModalOpen(true);
                }}
              >
                +{imageUrls.length - 3}
              </button>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
        <ImageGalleryModal
          images={imageUrls}
          initialIndex={selectedImageIndex}
          isOpen={isImageModalOpen}
          title={`${item.name} Images`}
          onClose={() => setIsImageModalOpen(false)}
        />
      </TableCell>
      <TableCell className="font-medium">{item.name}</TableCell>
      {activeColumns.internalCode && (
      <TableCell className="font-mono text-sm max-w-[150px] truncate" title={item.internal_code || ""}>
        {item.internal_code || "-"}
      </TableCell>
      )}
      {activeColumns.rfidEpc && (
      <TableCell className="font-mono text-sm">
        {item.rfid?.epc ? (
          item.rfid.epc
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      )}
      {activeColumns.rfidName && (
      <TableCell>
        {item.rfid?.name ? (
          item.rfid.name
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      )}
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {item.categories?.map((category) => (
            <Badge key={category.id} className="text-xs" variant="outline">
              {category.name}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <Badge className="text-xs" variant={getStatusBadgeVariant(item.status)}>
          {item.status}
        </Badge>
      </TableCell>
      {activeColumns.itemStatus && (
      <TableCell>
        {item.item?.status?.name ? (
          itemStatusBadge
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      )}
      {activeColumns.section && (
      <TableCell>
        {item.item?.section?.name ? (
          item.item.section.name
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      )}
      {activeColumns.movementType && (
      <TableCell>
        {item.item?.last_item_status_history?.new_stock_movement?.stock_movement_type?.name ? (
          <Badge className="text-xs" variant="outline">
            {convertToTitleCase(item.item.last_item_status_history.new_stock_movement.stock_movement_type.name)}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      )}
      {activeColumns.inboundDate && (
      <TableCell className="text-sm whitespace-nowrap">
        {item.item?.inbound_date ? formatDisplayTimestamp(item.item.inbound_date) : <span className="text-muted-foreground">-</span>}
      </TableCell>
      )}
      {activeColumns.outboundDate && (
      <TableCell className="text-sm whitespace-nowrap">
        {item.item?.outbound_date ? formatDisplayTimestamp(item.item.outbound_date) : <span className="text-muted-foreground">-</span>}
      </TableCell>
      )}
      {activeColumns.areaTransferDate && (
      <TableCell className="text-sm whitespace-nowrap">
        {item.item?.area_transfer_date ? formatDisplayTimestamp(item.item.area_transfer_date) : <span className="text-muted-foreground">-</span>}
      </TableCell>
      )}
      {activeColumns.agingDays && (
      <TableCell className="text-sm text-center">
        {item.item?.aging_days != null ? (
          <span className="font-medium">{item.item.aging_days}d</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      )}
      {/* Dynamic attribute columns */}
      {uniqueAttributes.map((attribute) => {
        const attributeValues = getAttributeValue(item, attribute.id);
        const formattedValue = formatAttributeValues(attributeValues);

        return (
          <TableCell key={attribute.id} className="min-w-[120px]">
            {formattedValue !== "-" ? (
              <div className="flex flex-wrap gap-1">
                {attributeValues.map((value, index) => (
                  <Badge
                    key={index}
                    className="text-xs"
                    variant="secondary"
                  >
                    {value}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

export default LedgerProductItem;
