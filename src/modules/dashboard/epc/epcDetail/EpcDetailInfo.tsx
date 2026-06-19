"use client";

import { useTranslation } from "next-i18next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RfidDetailWithStockMovements } from "@/types/rfid";
import { formatDateTime } from "@/utils/text";

interface EpcDetailInfoProps {
  epcData: RfidDetailWithStockMovements | null;
}

const EpcDetailInfo: React.FC<EpcDetailInfoProps> = ({ epcData }) => {
  const { t } = useTranslation(["epc"]);

  if (!epcData) {
    return null;
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "REUSABLE":
        return "outline";
      case "DISPOSABLE":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getCategoryVariant = (category: string) => {
    switch (category) {
      case "SINGLE":
        return "outline";
      case "PACKAGE":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return t("status.active");
      case "INACTIVE":
        return t("status.inactive");
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "REUSABLE":
        return t("type.reusable");
      case "DISPOSABLE":
        return t("type.disposable");
      default:
        return type;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "SINGLE":
        return t("category.single");
      case "PACKAGE":
        return t("category.package");
      default:
        return category;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {t("detail.information")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-x-8 gap-y-0 text-sm">
          {/* Left column */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                {t("detail.name")}
              </p>
              <p className="font-medium">{epcData.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                {t("detail.epcCode")}
              </p>
              <code className="block font-mono text-xs bg-muted px-2 py-1 rounded break-all leading-relaxed">
                {epcData.epc}
              </code>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                {t("detail.cycleCount")}
              </p>
              <p className="font-medium">{epcData.cycle_count ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                {t("detail.createdAt")}
              </p>
              <p>{formatDateTime(epcData.created_at)}</p>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                {t("detail.type")}
              </p>
              <Badge variant={getTypeVariant(epcData.type)}>
                {getTypeText(epcData.type)}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                {t("detail.category")}
              </p>
              <Badge variant={getCategoryVariant(epcData.category)}>
                {getCategoryText(epcData.category)}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                {t("detail.status")}
              </p>
              <Badge variant={getStatusVariant(epcData.status)}>
                {getStatusText(epcData.status)}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                {t("detail.store", "Store")}
              </p>
              <p className="font-medium">{epcData.store?.name ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                {t("detail.updatedAt")}
              </p>
              <p>{formatDateTime(epcData.updated_at)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EpcDetailInfo;
