import { useTranslation } from "next-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import TableExportButton from "@/components/shared/TableExportButton";
import { Card, CardContent } from "@/components/ui/card";
import {ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DiscrepancyItemsResponse } from "@/types/stock-audit";

import { generateRFIDInsights } from "../utils/reportDataProcessor";
import { formatRFIDInsightsForExport } from "../utils/reportExportFormatter";

interface StockAuditRFIDInsightsProps {
  discrepancyItems: DiscrepancyItemsResponse;
  auditId: string;
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const UNKNOWN_COLOR = "hsl(220, 8%, 46%)"; // gray-500

const StockAuditRFIDInsights: React.FC<StockAuditRFIDInsightsProps> = ({
  discrepancyItems,
  auditId,
}) => {
  const { t } = useTranslation("stock-audit");
  const insights = generateRFIDInsights(discrepancyItems);

  // Prepare type chart data
  const typeChartData = insights.typeBreakdown.map((item, index) => ({
    fill: item.type === "Unknown" ? UNKNOWN_COLOR : CHART_COLORS[index % CHART_COLORS.length],
    name: item.type,
    value: item.count,
  }));

  // Prepare category chart data
  const categoryChartData = insights.categoryBreakdown.map((item, index) => ({
    fill: item.category === "Unknown" ? UNKNOWN_COLOR : CHART_COLORS[index % CHART_COLORS.length],
    name: item.category,
    value: item.count,
  }));

  // Get display text for RFID type
  const getTypeDisplayText = (type: string): string => {
    const typeMap: Record<string, string> = {
      DISPOSABLE: t("rfid.type.disposable", "Disposable"),
      REUSABLE: t("rfid.type.reusable", "Reusable"),
    };
    return typeMap[type] || type;
  };

  // Get display text for RFID category
  const getCategoryDisplayText = (category: string): string => {
    const categoryMap: Record<string, string> = {
      PACKAGE: t("rfid.category.package", "Package"),
      SINGLE: t("rfid.category.single", "Single"),
    };
    return categoryMap[category] || category;
  };

  // Export RFID insights
  const exportData = () => {
    const { typeBreakdown, categoryBreakdown } = formatRFIDInsightsForExport(insights);

    return [
      ...typeBreakdown.map((item) => ({
        category: "Type",
        count: item.count,
        name: item.type,
        percentage: item.percentage,
      })),
      ...categoryBreakdown.map((item) => ({
        category: "Category",
        count: item.count,
        name: item.category,
        percentage: item.percentage,
      })),
    ];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-heading">
          {t("detail.rfidInsights", "RFID Insights")}
        </h2>
        <TableExportButton
          columns={[
            { key: "category", label: "Category" },
            { key: "name", label: "Name" },
            { key: "count", label: "Count" },
            { key: "percentage", label: "Percentage" },
          ]}
          data={exportData()}
          filename={`stock_audit_rfid_insights_${auditId.slice(0, 8)}_${new Date().toISOString().split("T")[0]}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Type Breakdown */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              {t("detail.rfidTypeBreakdown", "RFID Type Breakdown")}
            </h3>
            {typeChartData.length > 0 ? (
              <div className="space-y-4">
                <ChartContainer
                  className="h-[180px] w-full"
                  config={typeChartData.reduce(
                    (acc, item) => ({
                      ...acc,
                      [item.name]: {
                        color: item.fill,
                        label: getTypeDisplayText(item.name),
                      },
                    }),
                    {}
                  )}
                >
                  <ResponsiveContainer height="100%" width="100%">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        animationDuration={1500}
                        cornerRadius={4}
                        cx="50%"
                        cy="50%"
                        data={typeChartData}
                        dataKey="value"
                        innerRadius={50}
                        label={(entry) =>
                          entry.value > 0 ? `${getTypeDisplayText(entry.name)} (${entry.value})` : ""
                        }
                        labelLine={false}
                        nameKey="name"
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {typeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4">
                  {insights.typeBreakdown.map((item, index) => (
                    <div key={item.type} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.type === "Unknown" ? UNKNOWN_COLOR : CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-sm">
                        {getTypeDisplayText(item.type)}: {item.count} ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground">
                {t("detail.noData", "No data available")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              {t("detail.rfidCategoryBreakdown", "RFID Category Breakdown")}
            </h3>
            {categoryChartData.length > 0 ? (
              <div className="space-y-4">
                <ChartContainer
                  className="h-[180px] w-full"
                  config={categoryChartData.reduce(
                    (acc, item) => ({
                      ...acc,
                      [item.name]: {
                        color: item.fill,
                        label: getCategoryDisplayText(item.name),
                      },
                    }),
                    {}
                  )}
                >
                  <ResponsiveContainer height="100%" width="100%">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        animationDuration={1500}
                        cornerRadius={4}
                        cx="50%"
                        cy="50%"
                        data={categoryChartData}
                        dataKey="value"
                        innerRadius={50}
                        label={(entry) =>
                          entry.value > 0 ? `${getCategoryDisplayText(entry.name)} (${entry.value})` : ""
                        }
                        labelLine={false}
                        nameKey="name"
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4">
                  {insights.categoryBreakdown.map((item, index) => (
                    <div key={item.category} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.category === "Unknown" ? UNKNOWN_COLOR : CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-sm">
                        {getCategoryDisplayText(item.category)}: {item.count} ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground">
                {t("detail.noData", "No data available")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StockAuditRFIDInsights;
