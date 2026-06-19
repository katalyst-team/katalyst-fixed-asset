"use client";

import { BarChart3 } from "lucide-react";
import { useTranslation } from "next-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useOverview } from "./useOverview";

const MetricValueCard = ({
  isLoading,
  label,
  value,
}: {
  isLoading: boolean;
  label: string;
  value: number;
}) => {
  return (
    <Card className="border-l-4 border-l-accent/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <div className="rounded-lg p-2.5 bg-accent/10">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-heading">
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            value.toLocaleString(undefined, { maximumFractionDigits: 2 })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const DashboardMetricValues = () => {
  const { metricConfigsValuesData } = useOverview();
  const { t } = useTranslation(["overview"]);

  const values = metricConfigsValuesData.data?.data?.values ?? [];
  const isLoading = metricConfigsValuesData.isLoading;

  if (!isLoading && values.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-border p-6 space-y-4">
      <h2 className="text-lg font-semibold font-heading border-b-2 border-accent pb-3 mb-4">{t("overview:metricConfigs.title")}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <MetricValueCard key={i} isLoading label="" value={0} />
            ))
          : values.map((item) => (
              <MetricValueCard
                key={item.name}
                isLoading={false}
                label={item.label}
                value={item.value}
              />
            ))}
      </div>
    </div>
  );
};
