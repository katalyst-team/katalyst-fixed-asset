"use client";

import { format } from "date-fns";
import { useTranslation } from "next-i18next";

import { DetailStockMovementData } from "@/types/detailStockMovement";

interface StockMovementInformationProps {
  ledgerInfo: DetailStockMovementData;
  packageQuantity: number;
}

const StockMovementInformation: React.FC<StockMovementInformationProps> = ({
  ledgerInfo,
  packageQuantity,
}) => {
  const { t } = useTranslation("ledger");
  const { t: commonT } = useTranslation("common");

  const createdDate = ledgerInfo.created_at
    ? new Date(ledgerInfo.created_at)
    : null;
  const updatedDate = ledgerInfo.updated_at
    ? new Date(ledgerInfo.updated_at)
    : null;

  // Localize movement type name
  const getLocalizedMovementType = (name: string) => {
    if (name === "LEDGER_PACKING") {
      return commonT("packing");
    }
    return commonT("single");
  };

  return (
    <div className="bg-background rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-bold font-heading mb-4">{t("ledgerV2.information")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-muted-foreground">{t("ledgerV2.store")}</h3>
            <p className="font-medium">{ledgerInfo.store_name}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">{t("ledgerV2.section")}</h3>
            <p className="font-medium">
              {ledgerInfo.section.name ||
                ledgerInfo.new_item_status_histories?.[0]?.item?.section?.name ||
                "-"}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">
              {t("ledgerV2.movementType")}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-md text-white uppercase ${
                  ledgerInfo.stock_movement_type.direction === "INBOUND"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                {ledgerInfo.stock_movement_type.direction}
              </span>
              <span>
                {getLocalizedMovementType(ledgerInfo.stock_movement_type.name)}
              </span>
            </div>
          </div>
          {ledgerInfo.reference_number && (
            <div>
              <h3 className="text-sm text-muted-foreground">
                {t("ledgerV2.referenceNumber")}
              </h3>
              <p className="font-medium">{ledgerInfo.reference_number}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm text-muted-foreground">
              {t("ledgerV2.packageQuantity")}
            </h3>
            <p className="text-2xl font-bold">
              {ledgerInfo.stock_movement_type.name === "LEDGER_PACKING"
                ? 1
                : packageQuantity > 0
                  ? packageQuantity
                  : "-"}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">
              {t("ledgerV2.totalItems")}
            </h3>
            <p className="text-2xl font-bold">{ledgerInfo.quantity}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-muted-foreground">{t("ledgerV2.createdAt")}</h3>
            <p className="font-medium">
              {createdDate ? format(createdDate, "dd/MM/yyyy, HH:mm:ss") : "-"}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">{t("ledgerV2.updatedAt")}</h3>
            <p className="font-medium">
              {updatedDate ? format(updatedDate, "dd/MM/yyyy, HH:mm:ss") : "-"}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">{t("ledgerV2.editor")}</h3>
            <p className="font-medium">{ledgerInfo.editor.name}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">ID</h3>
            <p className="font-medium text-xs text-muted-foreground">{ledgerInfo.id}</p>
          </div>
          {ledgerInfo.metadata && Object.keys(ledgerInfo.metadata).length > 0 && (
            <div>
              <h3 className="text-sm text-muted-foreground">
                {t("ledgerV2.metadata")}
              </h3>
              <div className="space-y-1">
                {Object.entries(ledgerInfo.metadata).map(([key, value]) => (
                  <div key={key} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockMovementInformation;
