import { format } from "date-fns";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import { SectionMetrics } from "@/types/stock-audit-area";

interface DetailStockAuditAreaMetricsProps {
  metrics: SectionMetrics | null;
}

const DetailStockAuditAreaMetrics = ({
  metrics,
}: DetailStockAuditAreaMetricsProps) => {
  const { t } = useTranslation("stock-audit-area");

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }),
    []
  );
  const percentageFormatter = useMemo(
    () => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }),
    []
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("metrics.notAvailable");
    try {
      return format(new Date(dateString), "d/M/yyyy, HH:mm:ss");
    } catch {
      return t("metrics.notAvailable");
    }
  };

  const metricsData = [
    {
      key: "last_audit",
      label: t("detailMetrics.lastAudit", "Last Audit"),
      value: metrics?.last_audit_timestamp
        ? formatDate(metrics.last_audit_timestamp)
        : t("metrics.notAvailable"),
    },
    {
      key: "expected_quantity",
      label: t("detailMetrics.expectedQuantity", "Expected Quantity"),
      value:
        metrics?.last_audit_expected_quantity !== undefined
          ? numberFormatter.format(metrics.last_audit_expected_quantity)
          : t("metrics.notAvailable"),
    },
    {
      key: "actual_quantity",
      label: t("detailMetrics.actualQuantity", "Actual Quantity"),
      value:
        metrics?.last_audit_actual_quantity !== undefined
          ? numberFormatter.format(metrics.last_audit_actual_quantity)
          : t("metrics.notAvailable"),
    },
    {
      key: "accuracy",
      label: t("detailMetrics.accuracy", "Accuracy"),
      value:
        metrics?.last_audit_accuracy !== undefined &&
        metrics?.last_audit_accuracy !== null
          ? `${percentageFormatter.format(metrics.last_audit_accuracy)}%`
          : t("metrics.notAvailable"),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {metricsData.map((metric) => (
        <div
          key={metric.key}
          className="rounded-lg border bg-card p-4 shadow-sm"
        >
          <p className="text-sm text-muted-foreground truncate" title={metric.label}>
            {metric.label}
          </p>
          <p className="text-2xl font-semibold break-words" title={metric.value}>
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DetailStockAuditAreaMetrics;
