"use client";

import { Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

import ButtonDetail from "@/components/shared/ButtonDetail";
import ImageGalleryModal from "@/components/shared/ImageGalleryModal";
import VerificationStatusBadge from "@/components/shared/VerificationStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  CommonAttribute,
  getAttributeValues,
  getHistoryItem,
  getRfidDetail,
} from "@/modules/dashboard/stock-movement-log/utils";
import { StockMovementItem } from "@/services/stockMovement/getStockMovementDataService";
import { convertToTitleCase, formatDateTime } from "@/utils/text";

// Column IDs for lamina-inbound-log
const COLUMN_ID_ACTION = "action";
const COLUMN_ID_NO = "no";
const COLUMN_ID_STATUS = "status";
const COLUMN_ID_INBOUND_TYPE = "inboundType";
const COLUMN_ID_INBOUND_DATE = "inboundDate";
const COLUMN_ID_SKU_NAME = "skuName";
const COLUMN_ID_INTERNAL_CODE = "internalCode";
const COLUMN_ID_INBOUND_QTY = "inboundQty";
const COLUMN_ID_STORE = "store";
const COLUMN_ID_STORE_AREA = "storeArea";
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

interface LaminaInboundLogItemProps {
  commonAttributes: CommonAttribute[];
  isColumnVisible: (columnId: string) => boolean;
  item: StockMovementItem;
  num: number;
}

const LaminaInboundLogItem: React.FC<LaminaInboundLogItemProps> = ({
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
  const inboundDate = formatDateTime(item.created_at);
  const inboundQty = item.new_item_status_histories?.length || 0;
  const inboundType = item.stock_movement_type?.name ?? "";
  const operator = item.editor?.name ?? "-";
  const storeName = item.store_name || "-";
  const storeArea = item.section?.name || "-";
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
        <TableCell className="text-center">
          <div className="flex h-full items-center justify-center gap-2">
            <ButtonDetail href={`/dashboard/inbound/${item.id}`} />
            {item.verification_status === "REJECTED" && sku?.id && (
              <Link href={`/dashboard/product/edit/${sku.id}`}>
                <Button
                  className="border border-amber-400"
                  size="icon"
                  variant="outline"
                >
                  <Pencil className="text-amber-400" />
                </Button>
              </Link>
            )}
          </div>
        </TableCell>
      )}
      {isColumnVisible(COLUMN_ID_NO) && (
        <TableCell className="font-medium">{no}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_STATUS) && (
        <TableCell className="text-center">
          <VerificationStatusBadge
            namespace="inbound"
            statusCounts={statusCounts}
            verificationStatus={item.verification_status}
          />
        </TableCell>
      )}
      {isColumnVisible(COLUMN_ID_INBOUND_TYPE) && (
        <TableCell>{convertToTitleCase(inboundType)}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_INBOUND_DATE) && (
        <TableCell>{inboundDate}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_SKU_NAME) && (
        <TableCell>{formatValue(sku?.name)}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_INTERNAL_CODE) && (
        <TableCell>{formatValue(sku?.internal_code)}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_INBOUND_QTY) && (
        <TableCell>{inboundQty}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_STORE) && (
        <TableCell>{storeName}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_STORE_AREA) && (
        <TableCell>{storeArea}</TableCell>
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
            title={`Inbound Images - ${convertToTitleCase(inboundType)}`}
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
            title={`SKU Images - ${convertToTitleCase(inboundType)}`}
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

export default LaminaInboundLogItem;
