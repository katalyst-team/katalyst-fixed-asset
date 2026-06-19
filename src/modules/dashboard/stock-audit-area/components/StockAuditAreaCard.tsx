import { format } from "date-fns";
import { useTranslation } from "next-i18next";
import React from "react";

import ButtonDetail from "@/components/shared/ButtonDetail";
import ResultBadge from "@/components/shared/ResultBadge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { StockAuditAreaItem } from "@/types/stock-audit-area";

interface StockAuditAreaCardProps {
  basePath?: string;
  item: StockAuditAreaItem;
  storeId: string;
}

const StockAuditAreaCard: React.FC<StockAuditAreaCardProps> = ({
  basePath = "/dashboard/stock-audit-area",
  item,
  storeId,
}) => {
  const { t } = useTranslation("stock-audit-area");

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "d/M/yyyy");
  };

  // Use accuracy from API or calculate if not available
  const accuracy =
    item.accuracy !== null
      ? Math.round(item.accuracy)
      : item.actual_quantity !== null && item.expected_quantity !== 0
        ? Math.round((item.actual_quantity / item.expected_quantity) * 100)
        : 0;

  // Use total_audit_issue from API
  const issuesCount = item.total_audit_issue || 0;

  // Render status badge
  const renderStatusBadge = () => {
    if (item.last_audit_result === "CONSISTENT" && issuesCount === 0) {
      return <Badge className="bg-green-600">{t("status.clean")}</Badge>;
    }
    if (issuesCount > 0) {
      const colorClass = issuesCount >= 3 ? "bg-red-500" : "bg-yellow-500";
      return (
        <Badge className={colorClass}>
          {issuesCount} {t("status.issues")}
        </Badge>
      );
    }
    return <Badge className="bg-muted-foreground">{t("status.unknown")}</Badge>;
  };

  const ownerName = item.editor
    ? `${item.editor.first_name} ${item.editor.last_name}`
    : "-";

  const statusBadge = item.total_audit_issue ? renderStatusBadge() : null;
  return (
    <Card className="flex flex-col">
      <CardHeader className="relative pb-2">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          {statusBadge && (
            <div className="absolute top-2 right-2">{statusBadge}</div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {t("card.owner")}: {ownerName}
        </p>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">
              {t("card.lastAudit")}:
            </span>
            <p className="font-medium">{formatDate(item.last_audit_date)}</p>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">{t("card.result")}:</span>
            {item.last_audit_result ? (
              <ResultBadge
                customText={t(`result.${item.last_audit_result.toLowerCase()}`)}
                result={item.last_audit_result}
              />
            ) : (
              <p className="font-medium">-</p>
            )}
          </div>
          <div>
            <span className="text-muted-foreground">{t("card.expected")}:</span>
            <p className="font-medium">{item.expected_quantity ?? "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("card.counted")}:</span>
            <p className="font-medium">{item.actual_quantity ?? "-"}</p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">{t("card.accuracy")}:</span>
            <p className="font-medium">{accuracy}%</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-4">
        <ButtonDetail
          href={`${basePath}/${storeId}/${item.id}`}
        />
      </CardFooter>
    </Card>
  );
};

export default StockAuditAreaCard;
