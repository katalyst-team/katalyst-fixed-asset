import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import { StockAuditAreaSummary } from "@/types/stock-audit-area";

interface StockAuditAreaMetricsProps {
  summary: StockAuditAreaSummary | null;
}

const StockAuditAreaMetrics = ({
  summary,
}: StockAuditAreaMetricsProps) => {
  const { t } = useTranslation("stock-audit-area");

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }),
    []
  );
  const percentageFormatter = useMemo(
    () => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }),
    []
  );

  const metrics = [
    {
      key: "total",
      label: t("metrics.totalSections"),
      value:
        summary?.total !== undefined
          ? numberFormatter.format(summary.total)
          : t("metrics.notAvailable"),
    },
    {
      key: "section_with_discrepancy",
      label: t("metrics.sectionsWithDiscrepancy"),
      value:
        summary?.section_with_discrepancy !== undefined
          ? numberFormatter.format(summary.section_with_discrepancy)
          : t("metrics.notAvailable"),
    },
    {
      key: "average_accuracy",
      label: t("metrics.averageAccuracy"),
      value:
        summary?.average_accuracy !== undefined &&
        summary?.average_accuracy !== null
          ? `${percentageFormatter.format(summary.average_accuracy)}%`
          : t("metrics.notAvailable"),
    },
    {
      key: "overdue",
      label: t("metrics.overdueAudits"),
      value:
        summary?.overdue !== undefined
          ? numberFormatter.format(summary.overdue)
          : t("metrics.notAvailable"),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.key}
          className="rounded-lg border bg-card p-4 shadow-sm"
        >
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <p className="text-2xl font-semibold">{metric.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StockAuditAreaMetrics;
