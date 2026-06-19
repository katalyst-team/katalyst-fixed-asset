import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";

import ButtonDelete from "@/components/shared/ButtonDelete";
import ButtonDetail from "@/components/shared/ButtonDetail";
import DiscrepancyStatusBadge from "@/components/shared/DiscrepancyStatusBadge";
import ImageGalleryModal from "@/components/shared/ImageGalleryModal";
import ResultBadge from "@/components/shared/ResultBadge";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockAuditItem } from "@/types/stock-audit";
import { formatDisplayTimestamp } from "@/utils/dateTime";
import { formatStockAuditType } from "@/utils/stockAuditType";
import { formatStockMovementTypeName } from "@/utils/stockMovementType";

interface StockAuditTableProps {
  basePath?: string;
  data: StockAuditItem[];
  onDelete: (id: string, storeId: string) => void;
}

const StockAuditTable: React.FC<StockAuditTableProps> = ({
  basePath = "/dashboard/stock-audit",
  data,
  onDelete,
}) => {
  const { t } = useTranslation("stock-audit");
  const router = useRouter();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);

  const getItemTypeNames = (item: StockAuditItem): string[] => {
    if (item.stock_movement_type_names && item.stock_movement_type_names.length > 0)
      return item.stock_movement_type_names;
    const fromQuery = router.query["stock_movement_type_name"];
    return fromQuery ? [fromQuery as string] : [];
  };

  const renderStatusBadge = (status: string) => {
    if (status === "COMPLETED") {
      return <Badge className="bg-green-600">{t("status.completed")}</Badge>;
    }
    if (status === "ON_PROGRESS") {
      return <Badge className="bg-yellow-500">{t("status.on_progress")}</Badge>;
    }
    if (status === "PENDING") {
      return <Badge className="bg-muted-foreground">{t("status.pending")}</Badge>;
    }
    return (
      <Badge className="bg-muted-foreground">
        {t(`status.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  const handleImageClick = (imageUrls: string[], imageIndex: number) => {
    setCurrentImageUrls(imageUrls);
    setSelectedImageIndex(imageIndex);
    setIsImageModalOpen(true);
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[44px] text-center">
              {t("table.header.no")}
            </TableHead>
            <TableHead className="w-[100px] text-center">
              {t("table.header.store")}
            </TableHead>
            <TableHead className="w-[80px] text-center">
              {t("table.header.auditName")}
            </TableHead>
            <TableHead className="w-[94px] text-center">
              {t("table.header.matchQty")}
            </TableHead>
            <TableHead className="w-[98px] text-center">
              {t("table.header.expectedQuantity")}
            </TableHead>
            <TableHead className="w-[98px] text-center">
              {t("table.header.extraQuantity")}
            </TableHead>
            <TableHead className="w-[98px] text-center">
              {t("table.header.missingQuantity")}
            </TableHead>
            <TableHead className="w-[93px] text-center">
              {t("table.header.status")}
            </TableHead>
            <TableHead className="w-[140px] text-center">
              {t("detail.reportTitle")}
            </TableHead>
            <TableHead className="w-[99px] text-center">
              {t("table.header.operator")}
            </TableHead>
            <TableHead className="w-[130px] text-center">
              {t("detail.createdOn")}
            </TableHead>
            <TableHead className="w-[49px] text-center">
              {t("table.header.area")}
            </TableHead>
            <TableHead className="w-[54px] text-center">SKU</TableHead>
            <TableHead className="w-[160px] text-center">
              {t("table.header.movementTypes")}
            </TableHead>
            <TableHead className="w-[80px] text-center">
              {t("table.header.images")}
            </TableHead>
            <TableHead className="w-[91px] text-center">
              {t("table.header.action")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell className="text-center font-medium">
                {index + 1}
              </TableCell>
              <TableCell className="text-center">{item.store.name}</TableCell>
              <TableCell className="text-center">
                {formatStockAuditType(item.type)}
              </TableCell>
              <TableCell className="text-center">
                <DiscrepancyStatusBadge
                  customText={String(item.actual_quantity)}
                  status="MATCHED"
                />
              </TableCell>
              <TableCell className="text-center">
                {item.expected_quantity}
              </TableCell>
              <TableCell className="text-center">
                <DiscrepancyStatusBadge
                  customText={String(item.extra_quantity)}
                  status="UNEXPECTED"
                />
              </TableCell>
              <TableCell className="text-center">
                <DiscrepancyStatusBadge
                  customText={String(item.missing_quantity)}
                  status="MISSING"
                />
              </TableCell>
              <TableCell className="text-center">
                {renderStatusBadge(item.status)}
              </TableCell>
              <TableCell className="text-center">
                {item.result ? (
                  <ResultBadge
                    customText={t(`result.${item.result.toLowerCase()}`)}
                    result={
                      item.result as "CONSISTENT" | "MISMATCH" | "UNKNOWN"
                    }
                  />
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="text-center">
                {item.editor
                  ? `${item.editor.first_name} ${item.editor.last_name}`
                  : "-"}
              </TableCell>

              <TableCell className="text-center">
                {formatDisplayTimestamp(item.created_at)}
              </TableCell>
              <TableCell className="text-center">
                {item.type === "BY_SECTION"
                  ? (item.checking_object?.name ?? "-")
                  : "-"}
              </TableCell>
              <TableCell className="text-center">
                {item.type === "BY_SKU"
                  ? (item.checking_object?.name ?? "-")
                  : "-"}
              </TableCell>
              <TableCell className="text-center text-sm">
                {item.stock_movement_type_names?.length
                  ? item.stock_movement_type_names
                      .map((name) => formatStockMovementTypeName(name))
                      .join(", ")
                  : "-"}
              </TableCell>
              <TableCell className="text-center">
                {item.image_urls && item.image_urls.length > 0 ? (
                  <div className="flex items-center justify-center gap-1">
                    <div className="flex -space-x-2">
                      {item.image_urls.slice(0, 3).map((imageUrl, imgIndex) => (
                        <div
                          key={imgIndex}
                          className="relative h-12 w-12 rounded-md overflow-hidden border-2 border-border cursor-pointer hover:scale-110 transition-transform"
                          onClick={() =>
                            handleImageClick(item.image_urls!, imgIndex)
                          }
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
                    {item.image_urls.length > 3 && (
                      <button
                        className="ml-2 text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full transition-colors"
                        onClick={() => handleImageClick(item.image_urls!, 3)}
                      >
                        +{item.image_urls.length - 3}
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex gap-2 justify-center">
                  <ButtonDetail
                    additionalQuery={{ stock_movement_type_name: getItemTypeNames(item) }}
                    href={`${basePath}/${item.store.id}/${item.id}`}
                  />
                  <ButtonDelete
                    onSubmit={() => onDelete(item.id, item.store.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ImageGalleryModal
        images={currentImageUrls}
        initialIndex={selectedImageIndex}
        isOpen={isImageModalOpen}
        title="Stock Audit Images"
        onClose={() => setIsImageModalOpen(false)}
      />
    </div>
  );
};

export default StockAuditTable;
