import Image from "next/image";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";

import DiscrepancyStatusBadge, {
  DiscrepancyStatusType,
} from "@/components/shared/DiscrepancyStatusBadge";
import ImageGalleryModal from "@/components/shared/ImageGalleryModal";
import { TableCell, TableRow } from "@/components/ui/table";
import { DiscrepancyItem } from "@/types/stock-audit";

import { normalizeDiscrepancyStatus } from "../utils";

interface StockAuditDiscrepancyRowProps {
  item: DiscrepancyItem;
}

const StockAuditDiscrepancyRow: React.FC<StockAuditDiscrepancyRowProps> = ({
  item,
}) => {
  const { t } = useTranslation("stock-audit");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const getRfidTypeText = (type: string) => {
    switch (type) {
      case "REUSABLE":
        return t("rfid.type.reusable");
      case "DISPOSABLE":
        return t("rfid.type.disposable");
      default:
        return type;
    }
  };

  const getRfidCategoryText = (category: string) => {
    switch (category) {
      case "SINGLE":
        return t("rfid.category.single");
      case "PACKAGE":
        return t("rfid.category.package");
      default:
        return category;
    }
  };

  const hasImages = item.sku?.image_urls && item.sku.image_urls.length > 0;
  const normalizedStatus = normalizeDiscrepancyStatus(
    item.discrepancy_status
  );
  const statusLabelKey =
    normalizedStatus === "MATCHED"
      ? "matched"
      : normalizedStatus.toLowerCase();

  return (
    <>
      <TableRow>
        <TableCell className="text-center font-medium">
          {item.item_id.slice(0, 4)}
        </TableCell>
        <TableCell className="text-center">
          {item.rfid_detail?.name || "-"}
        </TableCell>
        <TableCell className="text-center">{item.epc}</TableCell>
        <TableCell className="text-center relative group">
          <div className="flex flex-col items-center">
            <span>{item.sku?.name || "-"}</span>
          </div>
        </TableCell>
        <TableCell className="text-center font-mono text-sm">
          {item.sku?.internal_code || "-"}
        </TableCell>
        <TableCell className="text-center">
          {item.section?.name || "-"}
        </TableCell>
        <TableCell className="text-center">
          {item.rfid_detail?.category
            ? getRfidCategoryText(item.rfid_detail.category)
            : "-"}
        </TableCell>
        <TableCell className="text-center">
          {item.rfid_detail?.type
            ? getRfidTypeText(item.rfid_detail.type)
            : "-"}
        </TableCell>
        <TableCell className="text-center">
          {hasImages ? (
            <div className="flex justify-center">
              <div
                className="relative h-8 w-8 cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setIsImageModalOpen(true)}
              >
                <Image
                  fill
                  alt={item.sku.name}
                  className="rounded object-cover border border-border"
                  sizes="32px"
                  src={item.sku.image_urls![0]}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
            </div>
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell className="text-center">
          <DiscrepancyStatusBadge
            customText={t(`status.${statusLabelKey}`)}
            status={normalizedStatus as DiscrepancyStatusType}
          />
        </TableCell>
      </TableRow>

      {hasImages && (
        <ImageGalleryModal
          images={item.sku.image_urls!}
          initialIndex={0}
          isOpen={isImageModalOpen}
          title={item.sku.name}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}
    </>
  );
};

export default StockAuditDiscrepancyRow;
