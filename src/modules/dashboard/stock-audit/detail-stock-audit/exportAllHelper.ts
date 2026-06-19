
import { format } from "date-fns";

import { StockAuditDetail } from "@/types/stock-audit";
import { exportMultiSheetExcel } from "@/utils/exportUtils";
import { formatStockAuditType } from "@/utils/stockAuditType";
import { convertToTitleCase } from "@/utils/text";

import { exportConsolidatedReport } from "./exportConsolidatedHelper";
import {
  flattenDiscrepancyItems,
  normalizeDiscrepancyStatus,
} from "./utils";
import {
  generateOverallSummary,
  generateRFIDInsights,
  generateSectionReport,
  generateSKUReport,
} from "./utils/reportDataProcessor";
import {
  formatRFIDInsightsForExport,
  formatSectionReportForExport,
  formatSKUReportForExport,
  formatSummaryForExport,
} from "./utils/reportExportFormatter";

interface ExportAllParams {
  stockAuditDetail: StockAuditDetail;
  t: (key: string) => string;
}

export const exportAllStockAuditData = async ({
  stockAuditDetail,
  t,
}: ExportAllParams) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd HH:mm:ss");
    } catch {
      return dateString;
    }
  };

  const getRfidTypeText = (type: string) => {
    switch (type) {
      case "REUSABLE":
        return t("rfid.type.reusable");
      case "DISPOSABLE":
        return t("rfid.type.disposable");
      default:
        return type;
    }
  };

  const getRfidCategoryText = (category: string) => {
    switch (category) {
      case "SINGLE":
        return t("rfid.category.single");
      case "PACKAGE":
        return t("rfid.category.package");
      default:
        return category;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      CANCELLED: "cancelled",
      COMPLETED: "completed",
      EXCESS: "excess",
      IN_PROGRESS: "inProgress",
      MATCH: "match",
      MATCHED: "matched",
      MISMATCH: "mismatch",
      MISPLACED: "misplaced",
      MISSING: "missing",
      NOT_RECORDED: "not_recorded",
      PENDING: "pending",
      UNEXPECTED: "unexpected",
    };

    const statusKey = statusMap[status] || status.toLowerCase();
    return t(`status.${statusKey}`);
  };

  const getResultText = (result: string) => {
    return t(`result.${result.toLowerCase()}`);
  };

  const discrepancyItems = flattenDiscrepancyItems(
    stockAuditDetail.discrepancy_items,
  );

  // Generate all report data using the same processors as the UI
  const overallSummary = generateOverallSummary(stockAuditDetail.discrepancy_items);
  const sectionReports = generateSectionReport(stockAuditDetail.discrepancy_items);
  const skuReports = generateSKUReport(stockAuditDetail.discrepancy_items);
  const rfidInsights = generateRFIDInsights(stockAuditDetail.discrepancy_items);

  // Get audit status text
  const getAuditStatusText = (status: string) => {
    return t(`auditStatus.${status.toLowerCase()}`);
  };

  // Build sheets array
  const sheets: Array<{
    columns: Array<{ key: string; label: string }>;
    data: unknown[];
    sheetName: string;
  }> = [];

  // ==================== SHEET 1: AUDIT INFORMATION ====================
  sheets.push({
    columns: [
      { key: "field", label: "Field" },
      { key: "value", label: "Value" },
    ],
    data: [
      { field: "Audit ID", value: stockAuditDetail.id || "-" },
      {
        field: t("table.header.type"),
        value: formatStockAuditType(stockAuditDetail.type),
      },
      {
        field: t("detail.area"),
        value:
          stockAuditDetail.type === "BY_SECTION"
            ? (stockAuditDetail.checking_object?.name ?? "-")
            : "-",
      },
      {
        field: t("detail.sku"),
        value:
          stockAuditDetail.type === "BY_SKU"
            ? (stockAuditDetail.checking_object?.name ?? "-")
            : "-",
      },
      {
        field: t("detail.operator"),
        value: stockAuditDetail.editor
          ? `${stockAuditDetail.editor.first_name} ${stockAuditDetail.editor.last_name}`
          : "-",
      },
      {
        field: t("detail.createdOn"),
        value: formatDate(stockAuditDetail.created_at),
      },
      {
        field: t("table.header.lastUpdated"),
        value: stockAuditDetail.updated_at
          ? formatDate(stockAuditDetail.updated_at)
          : "-",
      },
      {
        field: t("detail.status"),
        value: getStatusText(stockAuditDetail.status),
      },
      {
        field: t("detail.match"),
        value: getResultText(stockAuditDetail.result),
      },
      {
        field: t("detail.auditStatus"),
        value: getAuditStatusText(overallSummary.auditStatus),
      },
      {
        field: t("detail.accuracyRate"),
        value: `${overallSummary.statusBreakdown.accuracyRate.toFixed(2)}%`,
      },
      {
        field: "Export Date",
        value: new Date().toLocaleString(),
      },
      ...(stockAuditDetail.note
        ? [{ field: t("table.header.note"), value: stockAuditDetail.note }]
        : []),
    ],
    sheetName: "Audit Info",
  });

  // ==================== SHEET 2: OVERALL SUMMARY ====================
  const summaryData = formatSummaryForExport(overallSummary);
  sheets.push({
    columns: [
      { key: "metric", label: "Metric" },
      { key: "value", label: "Value" },
    ],
    data: summaryData,
    sheetName: "Summary",
  });

  // ==================== SHEET 3: PER-SECTION REPORT ====================
  if (sectionReports.length > 0) {
    const sectionExportData = formatSectionReportForExport(sectionReports);
    // Add audit status column
    const sectionDataWithStatus = sectionExportData.map((item) => ({
      accuracyRate: item.accuracyRate,
      auditStatus: getAuditStatusText(
        sectionReports.find((r) => r.sectionName === (item as { section: string }).section)?.auditStatus ??
          "MATCH",
      ),
      expected: item.expected,
      matched: item.matched,
      missing: item.missing,
      section: item.section,
      total: item.total,
      unexpected: item.unexpected,
    }));

    sheets.push({
      columns: [
        { key: "section", label: t("table.header.section") },
        { key: "total", label: t("table.header.total") },
        { key: "expected", label: t("detail.expectedItems") },
        { key: "matched", label: t("status.matched") },
        { key: "missing", label: t("status.missing") },
        { key: "unexpected", label: t("status.unexpected") },
        { key: "accuracyRate", label: t("detail.accuracyRate") },
        { key: "auditStatus", label: t("detail.auditStatus") },
      ],
      data: sectionDataWithStatus,
      sheetName: "Sections",
    });
  }

  // ==================== SHEET 4: PER-SKU REPORT ====================
  if (skuReports.length > 0) {
    const skuExportData = formatSKUReportForExport(skuReports);
    // Add audit status column
    const skuDataWithStatus = skuExportData.map((item) => ({
      accuracyRate: item.accuracyRate,
      auditStatus: getAuditStatusText(
        skuReports.find((r) => r.skuName === (item as { sku: string }).sku)?.auditStatus ?? "MATCH",
      ),
      expected: item.expected,
      internalCode: item.internalCode,
      matched: item.matched,
      missing: item.missing,
      sections: item.sections,
      sku: item.sku,
      total: item.total,
      unexpected: item.unexpected,
    }));

    sheets.push({
      columns: [
        { key: "sku", label: t("table.header.skuName") },
        {
          key: "internalCode",
          label: t("table.header.internalCode"),
        },
        { key: "total", label: t("table.header.total") },
        { key: "expected", label: t("detail.expectedItems") },
        { key: "matched", label: t("status.matched") },
        { key: "missing", label: t("status.missing") },
        { key: "unexpected", label: t("status.unexpected") },
        { key: "accuracyRate", label: t("detail.accuracyRate") },
        { key: "auditStatus", label: t("detail.auditStatus") },
        { key: "sections", label: t("detail.sections") },
      ],
      data: skuDataWithStatus,
      sheetName: "SKUs",
    });
  }

  // ==================== SHEET 5: RFID INSIGHTS ====================
  const { typeBreakdown, categoryBreakdown } = formatRFIDInsightsForExport(
    rfidInsights,
  );

  sheets.push({
    columns: [
      { key: "category", label: "Category" },
      { key: "name", label: "Name" },
      { key: "count", label: "Count" },
      { key: "percentage", label: "Percentage" },
    ],
    data: [
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
    ],
    sheetName: "RFID Insights",
  });

  // ==================== SHEET 6: DISCREPANCY ITEMS ====================
  const discrepancyData = discrepancyItems.map((item) => ({
    epc: item.epc,
    id: item.item_id.slice(0, 4),
    image:
      item.sku?.image_urls && item.sku.image_urls.length > 0
        ? item.sku.image_urls[0]
        : "-",
    match: convertToTitleCase(
      normalizeDiscrepancyStatus(item.discrepancy_status),
    ),
    rfidCategory: item.rfid_detail?.category
      ? getRfidCategoryText(item.rfid_detail.category)
      : "-",
    rfidName: item.rfid_detail?.name || "-",
    rfidType: item.rfid_detail?.type
      ? getRfidTypeText(item.rfid_detail.type)
      : "-",
    section: item.section?.name || "-",
    skuInternalCode: item.sku?.internal_code || "-",
    skuName: item.sku?.name || "-",
  }));

  sheets.push({
    columns: [
      { key: "id", label: t("table.header.id") },
      { key: "rfidName", label: "RFID Name" },
      { key: "epc", label: t("table.header.epc") },
      { key: "skuName", label: t("table.header.skuName") },
      {
        key: "skuInternalCode",
        label: t("table.header.internalCode"),
      },
      { key: "section", label: t("table.header.section") },
      { key: "rfidCategory", label: "RFID Category" },
      { key: "rfidType", label: "RFID Type" },
      { key: "image", label: "Image URL" },
      { key: "match", label: t("detail.match") },
    ],
    data: discrepancyData,
    sheetName: "All Items",
  });

  // ==================== SHEET 7: NOT REGISTERED ITEMS ====================
  const notRecordedItems = discrepancyItems.filter(
    (item) =>
      normalizeDiscrepancyStatus(item.discrepancy_status) === "NOT_RECORDED",
  );

  if (notRecordedItems.length > 0) {
    sheets.push({
      columns: [
        { key: "epc", label: t("table.header.epc") },
        { key: "match", label: t("detail.match") },
      ],
      data: notRecordedItems.map((item) => ({
        epc: item.epc,
        match: getStatusText("NOT_RECORDED"),
      })),
      sheetName: "Not Registered",
    });
  }

  // ==================== SHEET 8: IMAGES ====================
  if (
    stockAuditDetail.image_urls &&
    stockAuditDetail.image_urls.length > 0
  ) {
    sheets.push({
      columns: [
        { key: "no", label: "No" },
        { key: "url", label: "Image URL" },
      ],
      data: stockAuditDetail.image_urls.map((url, index) => ({
        no: index + 1,
        url,
      })),
      sheetName: "Images",
    });
  }

  // Export the consolidated complete report as a separate Excel file
  await exportConsolidatedReport({
    getAuditStatusText,
    getResultText,
    getRfidCategoryText,
    getRfidTypeText,
    getStatusText,
    stockAuditDetail,
    t,
  });

  // Export all sheets to a single Excel file
  await exportMultiSheetExcel({
    filename: `stock_audit_detail_${stockAuditDetail.id.slice(0, 8)}_${new Date().toISOString().split("T")[0]}`,
    sheets,
  });
};
