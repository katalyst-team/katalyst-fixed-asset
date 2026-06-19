import { format } from "date-fns";

import type { DiscrepancyStatus, StockAuditDetail } from "@/types/stock-audit";
import { exportToExcel } from "@/utils/exportUtils";
import { formatStockAuditType } from "@/utils/stockAuditType";
import { convertToTitleCase } from "@/utils/text";

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
import { formatSummaryForExport } from "./utils/reportExportFormatter";

interface ExportConsolidatedParams {
  getAuditStatusText: (status: string) => string;
  getResultText: (result: string) => string;
  getRfidCategoryText: (category: string) => string;
  getRfidTypeText: (type: string) => string;
  getStatusText: (status: string) => string;
  stockAuditDetail: StockAuditDetail;
  t: (key: string) => string;
}

export const exportConsolidatedReport = async ({
  getAuditStatusText,
  getResultText,
  getRfidCategoryText,
  getRfidTypeText,
  getStatusText,
  stockAuditDetail,
  t,
}: ExportConsolidatedParams) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd HH:mm:ss");
    } catch {
      return dateString;
    }
  };

  const discrepancyItems = flattenDiscrepancyItems(stockAuditDetail.discrepancy_items);
  const overallSummary = generateOverallSummary(stockAuditDetail.discrepancy_items);
  const sectionReports = generateSectionReport(stockAuditDetail.discrepancy_items);
  const skuReports = generateSKUReport(stockAuditDetail.discrepancy_items);
  const rfidInsights = generateRFIDInsights(stockAuditDetail.discrepancy_items);
  const notRecordedItems = discrepancyItems.filter(
    (item) => normalizeDiscrepancyStatus(item.discrepancy_status as DiscrepancyStatus) === "NOT_RECORDED",
  );

  // Separator line for section breaks
  const separatorLine = "=".repeat(300);

  const maxColumns = 10;
  const emptyRow: Record<string, string> = {};
  for (let i = 0; i < maxColumns; i++) {
    emptyRow[String.fromCharCode(65 + i)] = "";
  }

  const allData: Record<string, string>[] = [];
  const merges: Array<{ s: { r: number; c: number }; e: { r: number; c: number } }> = [];
  const titleRows: number[] = [];
  let currentRow = 0;

  const addSection = (title: string) => {
    allData.push({
      A: separatorLine,
      B: separatorLine,
      C: separatorLine,
      D: separatorLine,
      E: separatorLine,
      F: separatorLine,
      G: separatorLine,
      H: separatorLine,
      I: separatorLine,
      J: separatorLine,
    });
    merges.push({ e: { c: maxColumns - 1, r: currentRow }, s: { c: 0, r: currentRow } });
    currentRow++;

    allData.push({
      A: title,
      B: "",
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
      H: "",
      I: "",
      J: "",
    });
    merges.push({ e: { c: maxColumns - 1, r: currentRow }, s: { c: 0, r: currentRow } });
    titleRows.push(currentRow);
    currentRow++;

    allData.push({
      A: separatorLine,
      B: separatorLine,
      C: separatorLine,
      D: separatorLine,
      E: separatorLine,
      F: separatorLine,
      G: separatorLine,
      H: separatorLine,
      I: separatorLine,
      J: separatorLine,
    });
    merges.push({ e: { c: maxColumns - 1, r: currentRow }, s: { c: 0, r: currentRow } });
    currentRow++;
  };

  const addEmptyRow = () => {
    allData.push({ ...emptyRow });
    currentRow++;
  };

  // 1. AUDIT INFORMATION
  addSection("AUDIT INFORMATION");
  allData.push({
    A: "Audit ID",
    B: stockAuditDetail.id || "-",
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
    H: "",
    I: "",
    J: "",
  });
  currentRow++;
  allData.push({
    A: t("table.header.type"),
    B: formatStockAuditType(stockAuditDetail.type),
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
    H: "",
    I: "",
    J: "",
  });
  currentRow++;
  allData.push({
    A: t("detail.area"),
    B: stockAuditDetail.type === "BY_SECTION" ? (stockAuditDetail.checking_object?.name ?? "-") : "-",
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
    H: "",
    I: "",
    J: "",
  });
  currentRow++;
  allData.push({
    A: t("detail.sku"),
    B: stockAuditDetail.type === "BY_SKU" ? (stockAuditDetail.checking_object?.name ?? "-") : "-",
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
    H: "",
    I: "",
    J: "",
  });
  currentRow++;
  allData.push({
    A: t("detail.operator"),
    B: stockAuditDetail.editor ? `${stockAuditDetail.editor.first_name} ${stockAuditDetail.editor.last_name}` : "-",
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
    H: "",
    I: "",
    J: "",
  });
  currentRow++;
  allData.push({
    A: t("detail.createdOn"),
    B: formatDate(stockAuditDetail.created_at),
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
    H: "",
    I: "",
    J: "",
  });
  currentRow++;
  allData.push({
    A: t("table.header.lastUpdated"),
    B: stockAuditDetail.updated_at ? formatDate(stockAuditDetail.updated_at) : "-",
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
    H: "",
    I: "",
    J: "",
  });
  currentRow++;
  allData.push({
    A: t("detail.status"),
    B: getStatusText(stockAuditDetail.status),
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
    H: "",
    I: "",
    J: "",
  });
  currentRow++;
  allData.push({
    A: t("detail.match"),
    B: getResultText(stockAuditDetail.result),
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
    H: "",
    I: "",
    J: "",
  });
  currentRow++;
  allData.push({
    A: t("detail.auditStatus"),
    B: getAuditStatusText(overallSummary.auditStatus),
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
    H: "",
    I: "",
    J: "",
  });
  currentRow++;
  allData.push({
    A: t("detail.accuracyRate"),
    B: `${overallSummary.statusBreakdown.accuracyRate.toFixed(2)}%`,
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
    H: "",
    I: "",
    J: "",
  });
  currentRow++;
  allData.push({
    A: "Export Date",
    B: new Date().toLocaleString(),
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
    H: "",
    I: "",
    J: "",
  });
  currentRow++;
  if (stockAuditDetail.note) {
    allData.push({
      A: t("table.header.note"),
      B: stockAuditDetail.note,
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
      H: "",
      I: "",
      J: "",
    });
    currentRow++;
  }
  addEmptyRow();

  // 2. OVERALL SUMMARY
  addSection("OVERALL SUMMARY");
  const summaryData2 = formatSummaryForExport(overallSummary);
  summaryData2.forEach((row) => {
    allData.push({
      A: (row as { metric: string }).metric,
      B: String((row as { value: string | number }).value),
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
      H: "",
      I: "",
      J: "",
    });
    currentRow++;
  });
  addEmptyRow();

  // 3. PER-SECTION REPORT
  if (sectionReports.length > 0) {
    addSection("PER-SECTION REPORT");
    allData.push({
      A: t("table.header.section"),
      B: t("table.header.total"),
      C: t("detail.expectedItems"),
      D: t("status.matched"),
      E: t("status.missing"),
      F: t("status.unexpected"),
      G: t("detail.accuracyRate"),
      H: t("detail.auditStatus"),
      I: "",
      J: "",
    });
    currentRow++;
    sectionReports.forEach((report) => {
      allData.push({
        A: report.sectionName,
        B: String(report.statusCounts.total),
        C: String(report.statusCounts.matched + report.statusCounts.missing),
        D: String(report.statusCounts.matched),
        E: String(report.statusCounts.missing),
        F: String(report.statusCounts.unexpected),
        G: `${report.statusBreakdown.accuracyRate.toFixed(2)}%`,
        H: getAuditStatusText(report.auditStatus),
        I: "",
        J: "",
      });
      currentRow++;
    });
    addEmptyRow();
  }

  // 4. PER-SKU REPORT
  if (skuReports.length > 0) {
    addSection("PER-SKU REPORT");
    allData.push({
      A: t("table.header.skuName"),
      B: t("table.header.internalCode"),
      C: t("table.header.total"),
      D: t("detail.expectedItems"),
      E: t("status.matched"),
      F: t("status.missing"),
      G: t("status.unexpected"),
      H: t("detail.accuracyRate"),
      I: t("detail.auditStatus"),
      J: t("detail.sections"),
    });
    currentRow++;
    skuReports.forEach((report) => {
      allData.push({
        A: report.skuName,
        B: report.internalCode ?? "-",
        C: String(report.statusCounts.total),
        D: String(report.statusCounts.matched + report.statusCounts.missing),
        E: String(report.statusCounts.matched),
        F: String(report.statusCounts.missing),
        G: String(report.statusCounts.unexpected),
        H: `${report.statusBreakdown.accuracyRate.toFixed(2)}%`,
        I: getAuditStatusText(report.auditStatus),
        J: report.sectionDistribution.map((d) => `${d.sectionName} (${d.count})`).join(", "),
      });
      currentRow++;
    });
    addEmptyRow();
  }

  // 5. RFID INSIGHTS
  addSection("RFID INSIGHTS");
  allData.push({ A: "RFID Type", B: "Count", C: "Percentage", D: "", E: "", F: "", G: "", H: "", I: "", J: "" });
  currentRow++;
  rfidInsights.typeBreakdown.forEach((item) => {
    allData.push({ A: item.type, B: String(item.count), C: `${item.percentage.toFixed(2)}%`, D: "", E: "", F: "", G: "", H: "", I: "", J: "" });
    currentRow++;
  });
  currentRow++;
  allData.push({ A: "RFID Category", B: "Count", C: "Percentage", D: "", E: "", F: "", G: "", H: "", I: "", J: "" });
  currentRow++;
  rfidInsights.categoryBreakdown.forEach((item) => {
    allData.push({ A: item.category, B: String(item.count), C: `${item.percentage.toFixed(2)}%`, D: "", E: "", F: "", G: "", H: "", I: "", J: "" });
    currentRow++;
  });
  addEmptyRow();

  // 6. DISCREPANCY ITEMS
  addSection("DISCREPANCY ITEMS");
  allData.push({
    A: t("table.header.id"),
    B: "RFID Name",
    C: t("table.header.epc"),
    D: t("table.header.skuName"),
    E: t("table.header.internalCode"),
    F: t("table.header.section"),
    G: "RFID Category",
    H: "RFID Type",
    I: "Image URL",
    J: t("detail.match"),
  });
  currentRow++;
  discrepancyItems.forEach((item) => {
    allData.push({
      A: item.item_id.slice(0, 4),
      B: item.rfid_detail?.name || "-",
      C: item.epc,
      D: item.sku?.name || "-",
      E: item.sku?.internal_code || "-",
      F: item.section?.name || "-",
      G: item.rfid_detail?.category ? getRfidCategoryText(item.rfid_detail.category) : "-",
      H: item.rfid_detail?.type ? getRfidTypeText(item.rfid_detail.type) : "-",
      I: item.sku?.image_urls && item.sku.image_urls.length > 0 ? item.sku.image_urls[0] : "-",
      J: convertToTitleCase(normalizeDiscrepancyStatus(item.discrepancy_status as DiscrepancyStatus)),
    });
    currentRow++;
  });
  addEmptyRow();

  // 7. NOT REGISTERED ITEMS
  if (notRecordedItems.length > 0) {
    addSection("NOT REGISTERED ITEMS");
    allData.push({ A: t("table.header.epc"), B: t("detail.match"), C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "" });
    currentRow++;
    notRecordedItems.forEach((item) => {
      allData.push({ A: item.epc, B: getStatusText("NOT_RECORDED"), C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "" });
      currentRow++;
    });
    addEmptyRow();
  }

  // 8. IMAGES
  if (stockAuditDetail.image_urls && stockAuditDetail.image_urls.length > 0) {
    addSection("IMAGES");
    allData.push({ A: "No", B: "Image URL", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "" });
    currentRow++;
    stockAuditDetail.image_urls.forEach((url, index) => {
      allData.push({ A: String(index + 1), B: url, C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "" });
      currentRow++;
    });
  }

  const consolidatedColumns = [
    { key: "A", label: "A" },
    { key: "B", label: "B" },
    { key: "C", label: "C" },
    { key: "D", label: "D" },
    { key: "E", label: "E" },
    { key: "F", label: "F" },
    { key: "G", label: "G" },
    { key: "H", label: "H" },
    { key: "I", label: "I" },
    { key: "J", label: "J" },
  ];

  await exportToExcel({
    columnWidths: [20, 30, 15, 25, 20, 20, 15, 15, 40, 15],
    columns: consolidatedColumns,
    data: allData,
    filename: `stock_audit_complete_${stockAuditDetail.id.slice(0, 8)}_${new Date().toISOString().split("T")[0]}`,
    grayBackgroundRows: titleRows,
    merges,
    sheetName: "Complete Report",
  });
};
