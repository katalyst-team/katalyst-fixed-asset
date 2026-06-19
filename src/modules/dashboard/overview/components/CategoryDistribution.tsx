import { useTranslation } from "next-i18next";
import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import useGetCategoryDistributionQuery from "@/hooks/api/dashboard/useCategoryDistributionQuery";
import { type CategoryDistributionItemType } from "@/types/category-distribution";

interface CategoryData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

const CHART_COLORS = [
  "hsl(217 91% 60%)",
  "hsl(199 89% 48%)",
  "hsl(173 80% 40%)",
  "hsl(250 84% 60%)",
  "hsl(28 90% 55%)",
  "hsl(340 82% 52%)",
  "hsl(142 71% 45%)",
  "hsl(26 83% 54%)",
  "hsl(280 65% 60%)",
  "hsl(190 90% 50%)",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: CategoryData;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
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
          {data.name}
        </div>
        <div style={{ color: "hsl(var(--text-2))", fontSize: "12px" }}>
          {data.value} items ({(data.percentage || 0).toFixed(1)}%)
        </div>
      </div>
    );
  }
  return null;
};

export function CategoryDistribution() {
  const { t } = useTranslation("overview");
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const storeId = selectedTeam === "0" ? undefined : selectedTeam;

  const { data: distributionData, isLoading } = useGetCategoryDistributionQuery({
    organizationId,
    storeId,
  });

  const distribution = React.useMemo(
    () => distributionData?.data?.distribution ?? [],
    [distributionData?.data?.distribution],
  );

  const chartData: CategoryData[] = React.useMemo(() => {
    if (distribution.length === 0) return [];

    return distribution.map((item: CategoryDistributionItemType, index) => ({
      color: CHART_COLORS[index % CHART_COLORS.length],
      name: item.category_name,
      percentage: item.percentage,
      value: item.item_count,
    }));
  }, [distribution]);

  const totalItems = React.useMemo(
    () => distribution.reduce((sum, item) => sum + item.item_count, 0),
    [distribution],
  );

  return (
    <Card className="ks-card">
      <div className="ks-card-head">
        <div className="ks-card-title">
          {t("categoryDistribution.title", "Category Distribution")}
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
            {t("categoryDistribution.empty", "No category data available")}
          </div>
        ) : (
          <>
            <ResponsiveContainer height={300} width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={chartData}
                  dataKey="value"
                  innerRadius={60}
                  label={false}
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
            <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", marginTop: "16px" }}>
              {chartData.map((item) => (
                <div key={item.name} style={{ alignItems: "center", display: "flex", gap: "8px", minWidth: 0 }}>
                  <div
                    style={{
                      background: item.color,
                      borderRadius: "3px",
                      flexShrink: 0,
                      height: "12px",
                      width: "12px",
                    }}
                  />
                  <span
                    style={{
                      color: "hsl(var(--text-2))",
                      fontSize: "12px",
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={`${item.name} (${((item.value / totalItems) * 100).toFixed(1)}%)`}
                  >
                    {item.name} ({((item.value / totalItems) * 100).toFixed(1)}%)
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
