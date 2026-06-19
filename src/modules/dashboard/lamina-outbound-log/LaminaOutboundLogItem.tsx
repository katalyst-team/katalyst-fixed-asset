"use client";

import Image from "next/image";
import React, { useState } from "react";

import ButtonDetail from "@/components/shared/ButtonDetail";
import ImageGalleryModal from "@/components/shared/ImageGalleryModal";
import VerificationStatusBadge from "@/components/shared/VerificationStatusBadge";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  CommonAttribute,
  getAttributeValues,
  getHistoryItem,
  getRfidDetail,
} from "@/modules/dashboard/stock-movement-log/utils";
import { StockMovementItem } from "@/services/stockMovement/getStockMovementDataService";
import { convertToTitleCase, formatDateTime } from "@/utils/text";

// Column IDs for lamina-outbound-log
const COLUMN_ID_ACTION = "action";
const COLUMN_ID_NO = "no";
const COLUMN_ID_STATUS = "status";
const COLUMN_ID_OUTBOUND_TYPE = "outboundType";
const COLUMN_ID_OUTBOUND_DATE = "outboundDate";
const COLUMN_ID_SKU_NAME = "skuName";
const COLUMN_ID_INTERNAL_CODE = "internalCode";
const COLUMN_ID_OUTBOUND_QTY = "outboundQty";
const COLUMN_ID_STORE = "store";
const COLUMN_ID_WAREHOUSE = "warehouse";
const COLUMN_ID_OPERATOR = "operator";
const COLUMN_ID_NOTE = "note";
const COLUMN_ID_IMAGES = "images";
const COLUMN_ID_RFID_NAME = "rfidName";
const COLUMN_ID_RFID_EPC = "rfidEpc";
const COLUMN_ID_CATEGORIES = "categories";
const COLUMN_ID_SKU_IMAGES = "skuImages";

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
};

interface LaminaOutboundLogItemProps {
  commonAttributes: CommonAttribute[];
  isColumnVisible: (columnId: string) => boolean;
  item: StockMovementItem;
  num: number;
}

const LaminaOutboundLogItem: React.FC<LaminaOutboundLogItemProps> = ({
  commonAttributes,
  isColumnVisible,
  item,
  num,
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isSkuImageModalOpen, setIsSkuImageModalOpen] = useState(false);
  const [selectedSkuImageIndex, setSelectedSkuImageIndex] = useState(0);

  const no = num.toString().padStart(4, "0");
  const outboundDate = formatDateTime(item.created_at);
  const outboundQty = item.new_item_status_histories?.length || 0;
  const outboundType = item.stock_movement_type.name;
  const operator = item.editor.name;
  const storeName = item.store_name || "-";
  const warehouse = item.section?.name || "-";
  const note = item.note || "-";
  const imageUrls = item.image_urls || [];

  const historyItem = getHistoryItem(item);
  const sku = historyItem?.sku;
  const rfidDetail = getRfidDetail(historyItem, item);

  const statusCounts: Record<string, number> = {};
  item.new_item_status_histories?.forEach((history) => {
    const statusName = history.item.status.name;
    statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
  });

  const categoryNames = sku?.categories
    ?.map((category) => category.name)
    .filter(Boolean)
    .join(", ");
  const skuImages = sku?.image_urls || [];

  const renderAttributeValues = (values: string[]) => {
    if (!values || values.length === 0) {
      return <span className="text-sm text-muted-foreground">-</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {values.map((value, index) => (
          <Badge
            key={`${value}-${index}`}
            className="text-xs"
            variant="secondary"
          >
            {value}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <TableRow>
      {isColumnVisible(COLUMN_ID_ACTION) && (
        <TableCell>
          <ButtonDetail href={`/dashboard/outbound/${item.id}`} />
        </TableCell>
      )}
      {isColumnVisible(COLUMN_ID_NO) && (
        <TableCell className="font-medium">{no}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_STATUS) && (
        <TableCell>
          <VerificationStatusBadge
            namespace="outbound"
            statusCounts={statusCounts}
            verificationStatus={item.verification_status}
          />
        </TableCell>
      )}
      {isColumnVisible(COLUMN_ID_OUTBOUND_TYPE) && (
        <TableCell>{convertToTitleCase(outboundType)}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_OUTBOUND_DATE) && (
        <TableCell>{outboundDate}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_SKU_NAME) && (
        <TableCell>{formatValue(sku?.name)}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_INTERNAL_CODE) && (
        <TableCell>{formatValue(sku?.internal_code)}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_OUTBOUND_QTY) && (
        <TableCell>{outboundQty}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_STORE) && (
        <TableCell>{storeName}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_WAREHOUSE) && (
        <TableCell>{warehouse}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_OPERATOR) && (
        <TableCell>{operator}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_NOTE) && (
        <TableCell>{note}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_IMAGES) && (
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
                      alt={`Thumbnail ${imgIndex + 1}`}
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
            title={`Outbound Images - ${convertToTitleCase(outboundType)}`}
            onClose={() => setIsImageModalOpen(false)}
          />
        </TableCell>
      )}
      {isColumnVisible(COLUMN_ID_RFID_NAME) && (
        <TableCell>{formatValue(rfidDetail?.name)}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_RFID_EPC) && (
        <TableCell className="font-mono text-xs">
          {formatValue(rfidDetail?.epc)}
        </TableCell>
      )}
      {isColumnVisible(COLUMN_ID_CATEGORIES) && (
        <TableCell className="min-w-[180px] break-words">
          {formatValue(categoryNames)}
        </TableCell>
      )}
      {isColumnVisible(COLUMN_ID_SKU_IMAGES) && (
        <TableCell>
          {skuImages.length > 0 ? (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {skuImages.slice(0, 3).map((imageUrl, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="relative h-12 w-12 rounded-md overflow-hidden border-2 border-border cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => {
                      setSelectedSkuImageIndex(imgIndex);
                      setIsSkuImageModalOpen(true);
                    }}
                  >
                    <Image
                      fill
                      alt={`SKU Thumbnail ${imgIndex + 1}`}
                      className="object-cover"
                      src={imageUrl}
                    />
                  </div>
                ))}
              </div>
              {skuImages.length > 3 && (
                <button
                  className="ml-2 text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full transition-colors"
                  onClick={() => {
                    setSelectedSkuImageIndex(3);
                    setIsSkuImageModalOpen(true);
                  }}
                >
                  +{skuImages.length - 3}
                </button>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
          <ImageGalleryModal
            images={skuImages}
            initialIndex={selectedSkuImageIndex}
            isOpen={isSkuImageModalOpen}
            title={`SKU Images - ${convertToTitleCase(outboundType)}`}
            onClose={() => setIsSkuImageModalOpen(false)}
          />
        </TableCell>
      )}
      {commonAttributes.map((attribute) => {
        const columnId = `attr-${attribute.id}`;
        if (!isColumnVisible(columnId)) {
          return null;
        }
        const values = getAttributeValues(sku?.attributes, attribute.id);
        return (
          <TableCell key={attribute.id} className="w-fit whitespace-nowrap">
            {renderAttributeValues(values)}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

export default LaminaOutboundLogItem;
