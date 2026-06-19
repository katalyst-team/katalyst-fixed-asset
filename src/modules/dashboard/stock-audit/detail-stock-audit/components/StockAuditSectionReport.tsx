import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import AuditStatusBadge from "@/components/shared/AuditStatusBadge";
import DiscrepancyStatusBadge from "@/components/shared/DiscrepancyStatusBadge";
import TableExportButton from "@/components/shared/TableExportButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type ChartConfig,ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DiscrepancyItemsResponse } from "@/types/stock-audit";

import { generateSectionReport } from "../utils/reportDataProcessor";
import { formatSectionReportForExport } from "../utils/reportExportFormatter";
import StockAuditDiscrepancyRow from "./StockAuditDiscrepancyRow";

interface StockAuditSectionReportProps {
  discrepancyItems: DiscrepancyItemsResponse;
  auditId: string;
}

const chartConfig = {
  accuracy: {
    color: "hsl(var(--chart-1))",
    label: "Accuracy",
  },
} satisfies ChartConfig;

const StockAuditSectionReport: React.FC<StockAuditSectionReportProps> = ({
  discrepancyItems,
  auditId,
}) => {
  const { t } = useTranslation("stock-audit");
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const sectionReports = generateSectionReport(discrepancyItems);

  // Prepare chart data - top 10 sections by issue rate
  const chartData = sectionReports.slice(0, 10).map((report) => ({
    accuracy: report.statusBreakdown.accuracyRate,
    fullSectionName: report.sectionName,
    section: report.sectionName.length > 15
      ? report.sectionName.slice(0, 15) + "..."
      : report.sectionName,
    total: report.statusCounts.total,
  }));

  const toggleExpand = (sectionId: string) => {
    setExpandedSectionId(expandedSectionId === sectionId ? null : sectionId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-heading">
          {t("detail.sectionReport", "Per-Section Report")}
        </h2>
        <TableExportButton
          columns={[
            { key: "section", label: t("table.header.section", "Section") },
            { key: "total", label: t("table.header.total", "Total") },
            { key: "expected", label: t("detail.expectedItems", "Expected") },
            { key: "matched", label: t("status.matched", "Found") },
            { key: "missing", label: t("status.missing", "Missing") },
            { key: "unexpected", label: t("status.unexpected", "Extra") },
            { key: "accuracyRate", label: t("detail.accuracyRate", "Accuracy") },
          ]}
          data={formatSectionReportForExport(sectionReports)}
          filename={`stock_audit_sections_${auditId.slice(0, 8)}_${new Date().toISOString().split("T")[0]}`}
        />
      </div>

      {/* Bar Chart */}
      {sectionReports.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              {t("detail.sectionAccuracy", "Section Accuracy Rate")}
            </h3>
            <ChartContainer className="h-[200px] w-full" config={chartConfig}>
              <ResponsiveContainer height="100%" width="100%">
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  layout="vertical"
                  margin={{
                    left: 10,
                  }}
                >
                  <XAxis
                    hide
                    dataKey="accuracy"
                    type="number"
                  />
                  <YAxis
                    axisLine={false}
                    dataKey="section"
                    stroke="#888888"
                    tickFormatter={(value) => {
                      const item = chartData.find((d) => d.section === value);
                      return item?.fullSectionName ?? value;
                    }}
                    tickLine={false}
                    tickMargin={10}
                    type="category"
                    width={120}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent hideLabel />}
                    cursor={false}
                  />
                  <Bar animationDuration={1500} dataKey="accuracy" fill="var(--color-accuracy)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]" />
              <TableHead>{t("table.header.section", "Section")}</TableHead>
              <TableHead className="text-center">{t("table.header.total", "Total")}</TableHead>
              <TableHead className="text-center">{t("detail.expectedItems", "Expected")}</TableHead>
              <TableHead className="text-center">
                <DiscrepancyStatusBadge
                  customText={t("status.matched", "Found")}
                  status="MATCHED"
                />
              </TableHead>
              <TableHead className="text-center">
                <DiscrepancyStatusBadge
                  customText={t("status.missing", "Missing")}
                  status="MISSING"
                />
              </TableHead>
              <TableHead className="text-center">
                <DiscrepancyStatusBadge
                  customText={t("status.unexpected", "Extra")}
                  status="UNEXPECTED"
                />
              </TableHead>
              <TableHead className="text-center">
                {t("detail.auditStatus", "Audit Status")}
              </TableHead>
              <TableHead className="text-center">
                {t("detail.accuracyRate", "Accuracy")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sectionReports.length === 0 ? (
              <TableRow>
                <TableCell className="text-center text-muted-foreground" colSpan={9}>
                  {t("detail.noSectionData", "No section data available")}
                </TableCell>
              </TableRow>
            ) : (
              sectionReports.map((report) => (
                <React.Fragment key={report.sectionId ?? "unknown"}>
                  <TableRow>
                    <TableCell className="w-[50px]">
                      {report.items.length > 0 && (
                        <Button
                          className="h-8 w-8 p-0"
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpand(report.sectionId ?? "unknown")}
                        >
                          {expandedSectionId === (report.sectionId ?? "unknown") ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {report.sectionName}
                    </TableCell>
                    <TableCell className="text-center">
                      {report.statusCounts.total}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-blue-600">
                        {report.statusCounts.matched + report.statusCounts.missing}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {report.statusCounts.matched > 0 ? (
                        <DiscrepancyStatusBadge
                          customText={String(report.statusCounts.matched)}
                          status="MATCHED"
                        />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {report.statusCounts.missing > 0 ? (
                        <DiscrepancyStatusBadge
                          customText={String(report.statusCounts.missing)}
                          status="MISSING"
                        />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {report.statusCounts.unexpected > 0 ? (
                        <DiscrepancyStatusBadge
                          customText={String(report.statusCounts.unexpected)}
                          status="UNEXPECTED"
                        />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <AuditStatusBadge auditStatus={report.auditStatus} />
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-medium ${report.statusBreakdown.accuracyRate >= 90
                          ? "text-green-600"
                          : report.statusBreakdown.accuracyRate >= 70
                            ? "text-yellow-600"
                            : "text-red-600"
                          }`}
                      >
                        {report.statusBreakdown.accuracyRate.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                  {expandedSectionId === (report.sectionId ?? "unknown") && report.items.length > 0 && (
                    <TableRow>
                      <TableCell className="p-0" colSpan={9}>
                        <div className="p-4 bg-muted">
                          <div className="mb-2 text-sm font-medium text-muted-foreground">
                            {t("detail.itemsInSection", "Items in this section")} ({report.items.length})
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[44px] text-center">
                                  {t("table.header.id", "ID")}
                                </TableHead>
                                <TableHead className="w-[120px] text-center">
                                  RFID Name
                                </TableHead>
                                <TableHead className="w-[120px] text-center">
                                  {t("table.header.epc", "EPC")}
                                </TableHead>
                                <TableHead className="w-[150px] text-center">
                                  {t("table.header.skuName", "SKU Name")}
                                </TableHead>
                                <TableHead className="w-[150px] text-center">
                                  {t("table.header.internalCode", "Internal Code")}
                                </TableHead>
                                <TableHead className="w-[120px] text-center">
                                  {t("table.header.section", "Section")}
                                </TableHead>
                                <TableHead className="w-[100px] text-center">
                                  RFID Category
                                </TableHead>
                                <TableHead className="w-[100px] text-center">
                                  RFID Type
                                </TableHead>
                                <TableHead className="w-[100px] text-center">
                                  Image
                                </TableHead>
                                <TableHead className="w-[93px] text-center">
                                  {t("detail.match", "Match")}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {report.items.map((item) => (
                                <StockAuditDiscrepancyRow
                                  key={`${item.discrepancy_id}-${item.discrepancy_status}-${item.item_id}`}
                                  item={item}
                                />
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default StockAuditSectionReport;
