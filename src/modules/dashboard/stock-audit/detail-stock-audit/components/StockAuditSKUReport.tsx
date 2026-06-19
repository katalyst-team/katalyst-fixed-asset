/* eslint-disable no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";

import AuditStatusBadge from "@/components/shared/AuditStatusBadge";
import DiscrepancyStatusBadge from "@/components/shared/DiscrepancyStatusBadge";
import TableExportButton from "@/components/shared/TableExportButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type ChartConfig } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DiscrepancyItemsResponse } from "@/types/stock-audit";

import { generateSKUReport } from "../utils/reportDataProcessor";
import { formatSKUReportForExport } from "../utils/reportExportFormatter";
import StockAuditDiscrepancyRow from "./StockAuditDiscrepancyRow";

interface StockAuditSKUReportProps {
  discrepancyItems: DiscrepancyItemsResponse;
  auditId: string;
}

const chartConfig = {
  issues: {
    color: "hsl(var(--chart-2))",
    label: "Issues",
  },
  total: {
    color: "hsl(var(--chart-1))",
    label: "Total Items",
  },
} satisfies ChartConfig;

const StockAuditSKUReport: React.FC<StockAuditSKUReportProps> = ({
  discrepancyItems,
  auditId,
}) => {
  const { t } = useTranslation("stock-audit");
  const [expandedSKUId, setExpandedSKUId] = useState<string | null>(null);
  const skuReports = generateSKUReport(discrepancyItems);

  // Prepare chart data - top 10 SKUs by item count
  const chartData = skuReports.slice(0, 10).map((report) => ({
    fullSKUName: report.skuName,
    issues: report.statusCounts.missing + report.statusCounts.unexpected,
    matched: report.statusCounts.matched,
    sku:
      report.skuName.length > 20
        ? report.skuName.slice(0, 20) + "..."
        : report.skuName,
    total: report.statusCounts.total,
  }));

  const toggleExpand = (skuId: string) => {
    setExpandedSKUId(expandedSKUId === skuId ? null : skuId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-heading">
          {t("detail.skuReport", "Per-SKU Report")}
        </h2>
        <TableExportButton
          columns={[
            { key: "sku", label: t("table.header.skuName", "SKU Name") },
            {
              key: "internalCode",
              label: t("table.header.internalCode", "Internal Code"),
            },
            { key: "total", label: t("table.header.total", "Total") },
            { key: "expected", label: t("detail.expectedItems", "Expected") },
            { key: "matched", label: t("status.matched", "Found") },
            { key: "missing", label: t("status.missing", "Missing") },
            { key: "unexpected", label: t("status.unexpected", "Extra") },
            {
              key: "accuracyRate",
              label: t("detail.accuracyRate", "Accuracy"),
            },
            { key: "sections", label: t("detail.sections", "Sections") },
          ]}
          data={formatSKUReportForExport(skuReports)}
          filename={`stock_audit_skus_${auditId.slice(0, 8)}_${new Date().toISOString().split("T")[0]}`}
        />
      </div>

      {/* Bar Chart */}
      {/* {skuReports.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              {t("detail.topSKUs", "Top SKUs by Item Count")}
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
                  <XAxis hide type="number" />
                  <YAxis
                    axisLine={false}
                    dataKey="sku"
                    stroke="#888888"
                    tickFormatter={(value) => {
                      const item = chartData.find((d) => d.sku === value);
                      return item?.fullSKUName ?? value;
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
                  <Bar dataKey="total" fill="var(--color-total)" radius={5} />
                  <Bar dataKey="issues" fill="var(--color-issues)" radius={5} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )} */}

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]" />
              <TableHead className="w-[60px]" />
              <TableHead>{t("table.header.skuName", "SKU Name")}</TableHead>
              <TableHead>
                {t("table.header.internalCode", "Internal Code")}
              </TableHead>
              <TableHead className="text-center">
                {t("table.header.total", "Total")}
              </TableHead>
              <TableHead className="text-center">
                {t("detail.expectedItems", "Expected")}
              </TableHead>
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
              <TableHead>{t("detail.sections", "Sections")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skuReports.length === 0 ? (
              <TableRow>
                <TableCell
                  className="text-center text-muted-foreground"
                  colSpan={12}
                >
                  {t("detail.noSKUData", "No SKU data available")}
                </TableCell>
              </TableRow>
            ) : (
              skuReports.map((report) => (
                <React.Fragment key={report.skuId}>
                  <TableRow>
                    <TableCell className="w-[50px]">
                      {report.items.length > 0 && (
                        <Button
                          className="h-8 w-8 p-0"
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpand(report.skuId)}
                        >
                          {expandedSKUId === report.skuId ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="w-[60px]">
                      {report.skuImage ? (
                        <div className="relative h-10 w-10 rounded-md overflow-hidden border">
                          <Image
                            fill
                            alt={report.skuName}
                            className="object-cover"
                            sizes="40px"
                            src={report.skuImage}
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {report.skuName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {report.internalCode ?? "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {report.statusCounts.total}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-blue-600">
                        {report.statusCounts.matched +
                          report.statusCounts.missing}
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
                        className={`font-medium ${
                          report.statusBreakdown.accuracyRate >= 90
                            ? "text-green-600"
                            : report.statusBreakdown.accuracyRate >= 70
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {report.statusBreakdown.accuracyRate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {report.sectionDistribution.length > 0
                        ? report.sectionDistribution
                            .slice(0, 2)
                            .map((d) => d.sectionName)
                            .join(", ") +
                          (report.sectionDistribution.length > 2
                            ? ` +${report.sectionDistribution.length - 2}`
                            : "")
                        : "-"}
                    </TableCell>
                  </TableRow>
                  {expandedSKUId === report.skuId &&
                    report.items.length > 0 && (
                      <TableRow>
                        <TableCell className="p-0" colSpan={12}>
                          <div className="p-4 bg-muted">
                            <div className="mb-2 text-sm font-medium text-muted-foreground">
                              {t("detail.itemsForSKU", "Items for this SKU")} (
                              {report.items.length})
                            </div>

                            {/* Section Distribution */}
                            {report.sectionDistribution.length > 1 && (
                              <div className="mb-4 p-3 bg-card rounded-md border">
                                <div className="text-xs font-medium text-muted-foreground mb-2">
                                  {t(
                                    "detail.sectionDistribution",
                                    "Section Distribution",
                                  )}
                                  :
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {report.sectionDistribution.map((dist) => (
                                    <span
                                      key={dist.sectionName}
                                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                                    >
                                      {dist.sectionName}: {dist.count}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

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
                                    {t(
                                      "table.header.internalCode",
                                      "Internal Code",
                                    )}
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

export default StockAuditSKUReport;
