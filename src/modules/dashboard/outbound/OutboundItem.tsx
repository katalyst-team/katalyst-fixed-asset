import Image from "next/image";
import React, { useState } from "react";

import ButtonDetail from "@/components/shared/ButtonDetail";
import ImageGalleryModal from "@/components/shared/ImageGalleryModal";
import VerificationStatusBadge from "@/components/shared/VerificationStatusBadge";
import { TableCell, TableRow } from "@/components/ui/table";
import { StockMovementItem } from "@/services/stockMovement/getStockMovementDataService";
import { convertToTitleCase, formatDateTime } from "@/utils/text";

const COLUMN_ID_NO = "no";
const COLUMN_ID_STATUS = "status";
const COLUMN_ID_OUTBOUND_TYPE = "outboundType";
const COLUMN_ID_OUTBOUND_DATE = "outboundDate";
const COLUMN_ID_OUTBOUND_QTY = "outboundQty";
const COLUMN_ID_STORE = "store";
const COLUMN_ID_WAREHOUSE = "warehouse";
const COLUMN_ID_OPERATOR = "operator";
const COLUMN_ID_NOTE = "note";
const COLUMN_ID_IMAGES = "images";
const COLUMN_ID_ACTION = "action";


interface OutboundItemProps {
  isColumnVisible: (columnId: string) => boolean;
  item: StockMovementItem;
  num: number;
}

const OutboundItem: React.FC<OutboundItemProps> = ({ isColumnVisible, item, num }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const no = num.toString().padStart(4, "0");
  const outboundDate = formatDateTime(item.created_at);
  const outboundQty = item.new_item_status_histories?.length;
  const outboundType = item.stock_movement_type.name;
  const operator = item.editor.name;
  const storeName = item.store_name || "-";
  const warehouse = item.section?.name || "-";
  const note = item.note || "-";
  const imageUrls = item.image_urls || [];

  const statusCounts: Record<string, number> = {};
  item.new_item_status_histories?.forEach((history) => {
    const statusName = history.item.status.name;
    statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
  });

  return (
    <TableRow>
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
      {isColumnVisible(COLUMN_ID_ACTION) && (
        <TableCell>
          <ButtonDetail href={`/dashboard/outbound/${item.id}`} />
        </TableCell>
      )}
    </TableRow>
  );
};

export default OutboundItem;
