"use client";

import Image from "next/image";
import { useTranslation } from "next-i18next";
import { useState } from "react";

import ImageGalleryModal from "@/components/shared/ImageGalleryModal";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useBadgeStatus } from "@/hooks/useBadgeStatus";
import { SkuItemType } from "@/types/sku";
import { convertToTitleCase } from "@/utils/text";

import { formatAttributeValues, getAttributeValue, UniqueAttribute } from "../ledger-product/utils/attributeUtils";

const COLUMN_ID_NO = "no";
const COLUMN_ID_IMAGE = "image";
const COLUMN_ID_NAME = "name";

const COLUMN_ID_RFID_EPC = "rfidEpc";
const COLUMN_ID_RFID_NAME = "rfidName";
const COLUMN_ID_CATEGORY = "category";
const COLUMN_ID_STATUS = "status";
const COLUMN_ID_ITEM_STATUS = "itemStatus";
const COLUMN_ID_STOCK_MOVEMENT_TYPE = "stockMovementType";

interface PenerimaanLogItemProps {
  item: SkuItemType;
  isColumnVisible: (columnId: string) => boolean;
  num?: number;
  uniqueAttributes: UniqueAttribute[];
}

const PenerimaanLogItem: React.FC<PenerimaanLogItemProps> = ({
  isColumnVisible,
  item,
  num,
  uniqueAttributes,
}) => {
  const { t } = useTranslation(["common", "penerimaan-log"]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const imageUrls = item.image_urls || [];

  const { BadgeComponent: itemStatusBadge } = useBadgeStatus(
    item.item?.status?.name || "",
    {
      fallbackVariant: "outline",
      translationNamespace: "penerimaan-log",
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
      {isColumnVisible(COLUMN_ID_NO) && (
        <TableCell className="font-medium">{num ?? item.id}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_IMAGE) && (
        <TableCell>
          {imageUrls.length > 0 ? (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {imageUrls.slice(0, 3).map((imageUrl, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="relative h-12 w-12 rounded-md overflow-hidden border-2 border-border cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => {
                      setSelectedImageIndex(imgIndex);
                      setIsImageModalOpen(true);
                    }}
                  >
                    <Image
                      fill
                      alt={t("penerimaan-log:item.imageAlt", {
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
      )}
      {isColumnVisible(COLUMN_ID_NAME) && (
        <TableCell className="font-medium">{item.name}</TableCell>
      )}

      {isColumnVisible(COLUMN_ID_RFID_EPC) && (
        <TableCell className="font-mono text-sm">
          {item.rfid?.epc ? (
            item.rfid.epc
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </TableCell>
      )}
      {isColumnVisible(COLUMN_ID_RFID_NAME) && (
        <TableCell>
          {item.rfid?.name ? (
            item.rfid.name
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </TableCell>
      )}
      {isColumnVisible(COLUMN_ID_CATEGORY) && (
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {item.categories?.map((category) => (
              <Badge key={category.id} className="text-xs" variant="outline">
                {category.name}
              </Badge>
            ))}
          </div>
        </TableCell>
      )}
      {isColumnVisible(COLUMN_ID_STATUS) && (
        <TableCell>
          <Badge className="text-xs" variant={getStatusBadgeVariant(item.status)}>
            {item.status}
          </Badge>
        </TableCell>
      )}
      {isColumnVisible(COLUMN_ID_ITEM_STATUS) && (
        <TableCell>
          {item.item?.status?.name ? (
            itemStatusBadge
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </TableCell>
      )}
      {isColumnVisible(COLUMN_ID_STOCK_MOVEMENT_TYPE) && (
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
      {uniqueAttributes.map((attribute) => {
        const columnId = `attr-${attribute.id}`;
        if (!isColumnVisible(columnId)) {
          return null;
        }
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

export default PenerimaanLogItem;
