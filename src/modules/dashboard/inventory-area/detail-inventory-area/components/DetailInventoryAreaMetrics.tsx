import { BarChart3, Package } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import { SectionInventorySummary } from "@/types/inventory-area";

interface DetailInventoryAreaMetricsProps {
  section: SectionInventorySummary | null;
  totalQuantity: number;
}

const DetailInventoryAreaMetrics = ({
  section,
  totalQuantity,
}: DetailInventoryAreaMetricsProps) => {
  const { t } = useTranslation("inventory-area");

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }),
    []
  );

  const metrics = [
    {
      description: t("detail.metrics.sectionQuantityDesc"),
      icon: Package,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      key: "section_quantity",
      label: t("detail.metrics.sectionQuantity"),
      value: section
        ? numberFormatter.format(section.quantity)
        : t("metrics.notAvailable"),
    },
    {
      description: t("detail.metrics.totalQuantityDesc"),
      icon: BarChart3,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      key: "total_quantity",
      label: t("detail.metrics.totalQuantity"),
      value: numberFormatter.format(totalQuantity),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.key}
            className="rounded-xl border bg-card p-5 shadow-sm flex items-center gap-4"
          >
            <div className={`rounded-lg p-3 shrink-0 ${metric.iconBg}`}>
              <Icon className={`h-6 w-6 ${metric.iconColor}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {metric.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DetailInventoryAreaMetrics;
