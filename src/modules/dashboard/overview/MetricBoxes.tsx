"use client";

import { Package, TrendingDown, TrendingUp, Truck } from "lucide-react";
import { useTranslation } from "next-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useOverview } from "./useOverview";

const MetricBox = ({
  title,
  value,
  icon: Icon,
  isLoading,
  suffix = "",
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  isLoading: boolean;
  suffix?: string;
}) => {
  return (
    <Card className="border-l-4 border-l-accent/30 hover:-translate-y-1 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-lg p-2.5 bg-accent/10">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-heading">
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              {value.toLocaleString()}
              {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const MetricBoxes = () => {
  const { overviewData, inventoryAccuracy, isLoading } = useOverview();
  const { t } = useTranslation(["overview"]);

  const metrics = overviewData.data?.data?.metrics;

  const metricBoxes = [
    {
      icon: Package,
      suffix: "",
      title: t("metrics.inventoryCount.title"),
      value: metrics?.total_items || 0,
    },
    {
      icon: Package,
      suffix: "",
      title: t("metrics.totalSku.title"),
      value: metrics?.total_sku || 0,
    },
    {
      icon: TrendingUp,
      suffix: "",
      title: t("metrics.inboundTotal.title"),
      value: metrics?.total_inbound || 0,
    },
    {
      icon: TrendingDown,
      suffix: "",
      title: t("metrics.outboundTotal.title"),
      value: metrics?.total_outbound || 0,
    },
    {
      icon: Truck,
      suffix: "%",
      title: t("metrics.inventoryAccuracy.title"),
      value: inventoryAccuracy,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {metricBoxes.map((metric, index) => (
        <MetricBox
          key={index}
          icon={metric.icon}
          isLoading={isLoading}
          suffix={metric.suffix}
          title={metric.title}
          value={metric.value}
        />
      ))}
    </div>
  );
};