import { useTranslation } from "next-i18next";
import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import useGetStockHealthQuery from "@/hooks/api/dashboard/useStockHealthQuery";

interface StockHealthDataItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

const CHART_COLORS: Record<string, string> = {
  expired: "hsl(0 84% 60%)",
  expiring_soon: "hsl(340 82% 52%)",
  healthy: "hsl(142 71% 45%)",
  low_stock: "hsl(28 90% 55%)",
  overstocked: "hsl(250 84% 60%)",
};

const LABEL_MAP: Record<string, string> = {
  expired: "overview.stockHealth.expired",
  expiring_soon: "overview.stockHealth.expiringSoon",
  healthy: "overview.stockHealth.healthy",
  low_stock: "overview.stockHealth.lowStock",
  overstocked: "overview.stockHealth.overstocked",
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: StockHealthDataItem;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  const { t } = useTranslation("overview");
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div
        style={{
          background: "hsl(var(--surface))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: "12px",
        }}
      >
        <div style={{ color: "hsl(var(--text))", fontWeight: 600, marginBottom: "4px" }}>
          {t(data.name, data.name)}
        </div>
        <div style={{ color: "hsl(var(--text-2))", fontSize: "12px" }}>
          {data.value} items ({data.percentage.toFixed(1)}%)
        </div>
      </div>
    );
  }
  return null;
};

export function StockHealth() {
  const { t } = useTranslation("overview");
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const storeId = selectedTeam === "0" ? undefined : selectedTeam;

  const { data: stockHealthData, isLoading } = useGetStockHealthQuery({
    organization_id: organizationId,
    store_id: storeId,
  });

  const stockHealth = React.useMemo(
    () => stockHealthData?.data?.data ?? null,
    [stockHealthData?.data?.data],
  );

  const chartData: StockHealthDataItem[] = React.useMemo(() => {
    if (!stockHealth) return [];

    const { breakdown } = stockHealth;
    return [
      {
        color: CHART_COLORS.healthy,
        name: LABEL_MAP.healthy,
        percentage: breakdown.healthy.percentage,
        value: breakdown.healthy.count,
      },
      {
        color: CHART_COLORS.low_stock,
        name: LABEL_MAP.low_stock,
        percentage: breakdown.low_stock.percentage,
        value: breakdown.low_stock.count,
      },
      {
        color: CHART_COLORS.overstocked,
        name: LABEL_MAP.overstocked,
        percentage: breakdown.overstocked.percentage,
        value: breakdown.overstocked.count,
      },
      {
        color: CHART_COLORS.expiring_soon,
        name: LABEL_MAP.expiring_soon,
        percentage: breakdown.expiring_soon.percentage,
        value: breakdown.expiring_soon.count,
      },
      {
        color: CHART_COLORS.expired,
        name: LABEL_MAP.expired,
        percentage: breakdown.expired.percentage,
        value: breakdown.expired.count,
      },
    ].filter((item) => item.value > 0);
  }, [stockHealth]);

  const healthScore = React.useMemo(
    () => stockHealth?.health_percentage ?? 0,
    [stockHealth?.health_percentage],
  );

  return (
    <Card className="ks-card">
      <div className="ks-card-head">
        <div className="ks-card-title">
          {t("stockHealth.title", "Stock Health")}
        </div>
      </div>
      <div className="ks-card-body">
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <Skeleton className="h-[300px] w-full" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ alignItems: "center", display: "flex", gap: "6px" }}>
                  <Skeleton className="h-3 w-3 rounded-sm" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div
            style={{
              alignItems: "center",
              color: "hsl(var(--text-3))",
              display: "flex",
              fontSize: "13px",
              justifyContent: "center",
              minHeight: 300,
              padding: "30px 0",
              textAlign: "center",
            }}
          >
            {t("stockHealth.empty", "No stock data available")}
          </div>
        ) : (
          <>
            <div style={{ alignItems: "center", display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <div
                style={{
                  alignItems: "center",
                  background: healthScore >= 80 ? "hsl(142 71% 45% / 10%)" : healthScore >= 50 ? "hsl(28 90% 55% / 10%)" : "hsl(0 84% 60% / 10%)",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  padding: "8px 16px",
                }}
              >
                <div style={{ color: "hsl(var(--text-2))", fontSize: "12px", fontWeight: 500 }}>
                  {t("stockHealth.healthScore", "Health Score")}
                </div>
                <div
                  style={{
                    color: healthScore >= 80 ? "hsl(142 71% 45%)" : healthScore >= 50 ? "hsl(28 90% 55%)" : "hsl(0 84% 60%)",
                    fontSize: "24px",
                    fontWeight: 700,
                  }}
                >
                  {healthScore.toFixed(0)}%
                </div>
              </div>
            </div>
            <ResponsiveContainer height={300} width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={chartData}
                  dataKey="value"
                  innerRadius={60}
                  label={({ name, percent }) => `${t(name, name)} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", marginTop: "16px" }}>
              {chartData.map((item) => (
                <div key={item.name} style={{ alignItems: "center", display: "flex", gap: "6px" }}>
                  <div
                    style={{
                      background: item.color,
                      borderRadius: "3px",
                      height: "12px",
                      width: "12px",
                    }}
                  />
                  <span style={{ color: "hsl(var(--text-2))", fontSize: "12px", fontWeight: 500 }}>
                    {t(item.name, item.name)} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
