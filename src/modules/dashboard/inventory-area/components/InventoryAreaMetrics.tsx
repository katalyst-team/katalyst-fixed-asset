import { Layers, Package } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";

interface InventoryAreaMetricsProps {
  totalQuantity: number;
  totalSections: number;
}

const InventoryAreaMetrics = ({
  totalQuantity,
  totalSections,
}: InventoryAreaMetricsProps) => {
  const { t } = useTranslation("inventory-area");

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }),
    []
  );

  const metrics = [
    {
      icon: Layers,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      key: "total_sections",
      label: t("metrics.totalSections"),
      value: numberFormatter.format(totalSections),
    },
    {
      icon: Package,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      key: "total_quantity",
      label: t("metrics.totalQuantity"),
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
            <div className={`rounded-lg p-3 ${metric.iconBg}`}>
              <Icon className={`h-6 w-6 ${metric.iconColor}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InventoryAreaMetrics;
