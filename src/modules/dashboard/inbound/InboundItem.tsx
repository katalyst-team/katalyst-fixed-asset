import Image from "next/image";
import React, { useState } from "react";

import ButtonDetail from "@/components/shared/ButtonDetail";
import ImageGalleryModal from "@/components/shared/ImageGalleryModal";
import StockMovementActions from "@/components/shared/StockMovementActions";
import VerificationStatusBadge from "@/components/shared/VerificationStatusBadge";
import { TableCell, TableRow } from "@/components/ui/table";
import { StockMovementItem } from "@/services/stockMovement/getStockMovementDataService";
import { VerificationEntityType } from "@/types/verification";
import { convertToTitleCase, formatDateTime } from "@/utils/text";

const COLUMN_ID_NO = "no";
const COLUMN_ID_STATUS = "status";
const COLUMN_ID_VERIFICATION_ACTIONS = "verificationActions";
const COLUMN_ID_INBOUND_TYPE = "inboundType";
const COLUMN_ID_INBOUND_DATE = "inboundDate";
const COLUMN_ID_INBOUND_QTY = "inboundQty";
const COLUMN_ID_STORE = "store";
const COLUMN_ID_STORE_AREA = "storeArea";
const COLUMN_ID_OPERATOR = "operator";
const COLUMN_ID_NOTE = "note";
const COLUMN_ID_IMAGES = "images";
const COLUMN_ID_ACTION = "action";

interface InboundItemProps {
  isColumnVisible: (columnId: string) => boolean;
  item: StockMovementItem;
  num: number;
}

const InboundItem: React.FC<InboundItemProps> = ({ isColumnVisible, item, num }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const no = num.toString().padStart(4, "0");
  const inboundDate = formatDateTime(item.created_at);
  const inboundQty = item.new_item_status_histories?.length || 0;
  const inboundType = item.stock_movement_type.name;
  const operator = item.editor.name;
  const storeName = item.store_name || "-";
  const storeArea = item.section?.name || "-";
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
        <TableCell className="text-center">
          <VerificationStatusBadge
            namespace="inbound"
            statusCounts={statusCounts}
            verificationStatus={item.verification_status}
          />
        </TableCell>
      )}
      {isColumnVisible(COLUMN_ID_VERIFICATION_ACTIONS) && (
        <TableCell className="text-center">
          <StockMovementActions
            entityId={item.id}
            entityType={VerificationEntityType.STOCK_MOVEMENT_INBOUND}
            storeId={item.store_id}
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
      {isColumnVisible(COLUMN_ID_ACTION) && (
        <TableCell>
          <div className="flex h-full gap-2">
            <ButtonDetail href={`/dashboard/inbound/${item.id}`} />
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};

export default InboundItem;
