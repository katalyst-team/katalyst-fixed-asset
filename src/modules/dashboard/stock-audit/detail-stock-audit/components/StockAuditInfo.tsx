import Image from "next/image";
import { useTranslation } from "next-i18next";
import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { StockAuditDetail } from "@/types/stock-audit";
import { formatDisplayTimestamp } from "@/utils/dateTime";
import { formatStockAuditType } from "@/utils/stockAuditType";
import { formatStockMovementTypeName } from "@/utils/stockMovementType";

interface StockAuditInfoProps {
  data: StockAuditDetail;
}

const StockAuditInfo: React.FC<StockAuditInfoProps> = ({ data }) => {
  const { t } = useTranslation("stock-audit");
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="border-b pb-2">
            <p className="text-sm font-medium">
              {t("table.header.type")}: {formatStockAuditType(data.type)}
            </p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm font-medium">
              {t("detail.area")}:{" "}
              {data.type === "BY_SECTION"
                ? (data.checking_object?.name ?? "-")
                : "-"}
            </p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm font-medium">
              {t("detail.sku")}:{" "}
              {data.type === "BY_SKU"
                ? (data.checking_object?.name ?? "-")
                : "-"}
            </p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm font-medium">
              {t("detail.operator")}:{" "}
              {data.editor
                ? `${data.editor.first_name} ${data.editor.last_name}`
                : "-"}
            </p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm font-medium">
              {t("detail.createdOn")}: {formatDisplayTimestamp(data.created_at)}
            </p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm font-medium">
              {t("table.header.lastUpdated")}:{" "}
              {data.updated_at ? formatDisplayTimestamp(data.updated_at) : "-"}
            </p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm font-medium">
              {t("detail.status")}: {t(`status.${data.status.toLowerCase()}`)}
            </p>
          </div>
          {data.stock_movement_type_names && data.stock_movement_type_names.length > 0 ? (
            <div className="border-b pb-2">
              <p className="text-sm font-medium">
                {t("modal.create.movementTypes")}:{" "}
                {data.stock_movement_type_names
                  .map((name) => formatStockMovementTypeName(name))
                  .join(", ")}
              </p>
            </div>
          ) : (
            <div />
          )}
          {data.note && (
            <div className="border-b pb-2 col-span-2">
              <p className="text-sm font-medium">
                {t("table.header.note")}: {data.note}
              </p>
            </div>
          )}
        </div>

        {/* Images */}
        {data.image_urls && data.image_urls.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">
              {t("table.header.images")}:
            </p>
            <div className="flex flex-wrap gap-2">
              {data.image_urls.map((url, index) => (
                <div
                  key={index}
                  className="relative h-20 w-20 rounded-md overflow-hidden border"
                >
                  <Image
                    fill
                    alt={`${t("table.header.images")} ${index + 1}`}
                    className="object-cover"
                    sizes="80px"
                    src={url}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockAuditInfo;
