import { useTranslation } from "next-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import AuditStatusBadge from "@/components/shared/AuditStatusBadge";
import DiscrepancyStatusBadge from "@/components/shared/DiscrepancyStatusBadge";
import TableExportButton from "@/components/shared/TableExportButton";
import { Card, CardContent } from "@/components/ui/card";
import { type ChartConfig,ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DiscrepancyItemsResponse } from "@/types/stock-audit";

import { generateOverallSummary } from "../utils/reportDataProcessor";
import { formatSummaryForExport } from "../utils/reportExportFormatter";

interface StockAuditSummaryCardsProps {
  auditId: string;
  discrepancyItems: DiscrepancyItemsResponse;
}

const chartConfig = {
  matched: {
    color: "hsl(142, 76%, 36%)",
    label: "Matched",
  },
  missing: {
    color: "hsl(0, 84%, 60%)",
    label: "Missing",
  },
  notRecorded: {
    color: "hsl(220, 8%, 46%)",
    label: "Not Recorded",
  },
  unexpected: {
    color: "hsl(48, 96%, 53%)",
    label: "Unexpected",
  },
} satisfies ChartConfig;

const CHART_COLORS = {
  MATCHED: "hsl(142, 76%, 36%)", // green-600
  MISSING: "hsl(0, 84%, 60%)", // red-500
  NOT_RECORDED: "hsl(220, 8%, 46%)", // gray-500
  UNEXPECTED: "hsl(48, 96%, 53%)", // yellow-500
};

const StockAuditSummaryCards: React.FC<StockAuditSummaryCardsProps> = ({
  auditId,
  discrepancyItems,
}) => {
  const { t } = useTranslation("stock-audit");
  const summary = generateOverallSummary(discrepancyItems);

  const {
    auditStatus,
    statusCounts,
    statusBreakdown,
  } = summary;

  const expectedItems = statusCounts.matched + statusCounts.missing;

  // Prepare chart data
  const chartData = [
    {
      fill: CHART_COLORS.MATCHED,
      name: "matched",
      value: statusCounts.matched,
    },
    {
      fill: CHART_COLORS.MISSING,
      name: "missing",
      value: statusCounts.missing,
    },
    {
      fill: CHART_COLORS.UNEXPECTED,
      name: "unexpected",
      value: statusCounts.unexpected,
    },
    {
      fill: CHART_COLORS.NOT_RECORDED,
      name: "notRecorded",
      value: statusCounts.notRecorded,
    },
  ].filter((item) => item.value > 0);

  // Generate dynamic chart config with only present statuses
  const dynamicChartConfig = chartData.reduce(
    (acc, item) => ({
      ...acc,
      [item.name]: {
        color: item.fill,
        label: chartConfig[item.name as keyof typeof chartConfig].label,
      },
    }),
    {} as ChartConfig
  );

  const StatCard: React.FC<{
    title: string;
    count: number;
    status: "MATCHED" | "MISSING" | "UNEXPECTED" | "NOT_RECORDED";
  }> = ({ title, count, status }) => (
    <Card className="border-l-4">
      <CardContent
        className={`border-l-${status === "MATCHED"
          ? "green-600"
          : status === "MISSING"
            ? "red-500"
            : status === "UNEXPECTED"
              ? "yellow-500"
              : "gray-500"
          } pt-6`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold mt-1">
              {count}
            </p>
          </div>
          <DiscrepancyStatusBadge
            customText={status === "NOT_RECORDED"
              ? `${((count / statusCounts.total) * 100).toFixed(1)}%`
              : `${((count / statusCounts.total) * 100).toFixed(1)}%`
            }
            status={status}
          />
        </div>
      </CardContent>
    </Card>
  );

  const getAuditStatusConfig = (status: typeof auditStatus) => {
    switch (status) {
      case "MATCH":
        return { bgColor: "bg-green-600", borderClass: "green-600", label: "Match" };
      case "EXCESS":
        return { bgColor: "bg-orange-500", borderClass: "orange-500", label: "Excess" };
      case "MISPLACED":
        return { bgColor: "bg-yellow-500", borderClass: "yellow-500", label: "Misplaced" };
      case "MISMATCH":
        return { bgColor: "bg-red-500", borderClass: "red-500", label: "Mismatch" };
      default:
        return { bgColor: "bg-muted-foreground", borderClass: "muted-foreground", label: "Unknown" };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-heading">
          {t("detail.summary", "Overall Summary")}
        </h2>
        <TableExportButton
          columns={[
            { key: "metric", label: "Metric" },
            { key: "value", label: "Value" },
          ]}
          data={formatSummaryForExport(summary)}
          filename={`stock_audit_summary_${auditId.slice(0, 8)}_${new Date().toISOString().split("T")[0]}`}
        />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Audit Status Card */}
        <Card className={`border-l-4 border-l-${getAuditStatusConfig(auditStatus).borderClass}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                {t("detail.auditStatus", "Audit Status")}
              </p>
              <AuditStatusBadge auditStatus={auditStatus} />
            </div>
          </CardContent>
        </Card>
        {/* Expected Items Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("detail.expectedItems", "Expected Items")}
                </p>
                <p className="text-2xl font-bold mt-1">
                  {expectedItems}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <StatCard
          count={statusCounts.matched}
          status="MATCHED"
          title={t("status.matched", "Found")}
        />
        <StatCard
          count={statusCounts.missing}
          status="MISSING"
          title={t("status.missing", "Missing")}
        />
        <StatCard
          count={statusCounts.unexpected}
          status="UNEXPECTED"
          title={t("status.unexpected", "Extra Item")}
        />
        <StatCard
          count={statusCounts.notRecorded}
          status="NOT_RECORDED"
          title={t("status.not_recorded", "Not Registered")}
        />
      </div>

      {/* Accuracy and Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Accuracy Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {t("detail.accuracyRate", "Accuracy Rate")}
              </p>
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="transform -rotate-90 w-full h-full" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))" }}>
                  <circle
                    cx="80"
                    cy="80"
                    fill="none"
                    r="70"
                    stroke="hsl(var(--muted))"
                    strokeWidth="12"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    fill="none"
                    r="70"
                    stroke={statusBreakdown.accuracyRate >= 90
                      ? "hsl(142, 71%, 45%)"
                      : statusBreakdown.accuracyRate >= 70
                        ? "hsl(48, 96%, 53%)"
                        : "hsl(0, 84%, 60%)"
                    }
                    strokeDasharray={`${(statusBreakdown.accuracyRate / 100) * 440}, 440`}
                    strokeLinecap="round"
                    strokeWidth="12"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold">
                    {statusBreakdown.accuracyRate.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {statusCounts.total} {t("detail.items", "items")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
              {t("detail.statusDistribution", "Status Distribution")}
            </h3>
            {chartData.length > 0 ? (
              <ChartContainer className="h-[180px] w-full" config={dynamicChartConfig}>
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      animationDuration={1500}
                      cornerRadius={4}
                      cx="50%"
                      cy="50%"
                      data={chartData}
                      dataKey="value"
                      innerRadius={50}
                      label={(entry) =>
                        entry.value > 0 ? `${entry.value}` : ""
                      }
                      labelLine={false}
                      nameKey="name"
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
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

export default StockAuditSummaryCards;
