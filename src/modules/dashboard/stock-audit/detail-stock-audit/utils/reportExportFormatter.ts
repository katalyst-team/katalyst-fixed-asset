import {
  OverallSummary,
  RFIDInsights,
  SectionReport,
  SKUReport,
} from "./reportDataProcessor";

/**
 * Format summary data for export
 */
export const formatSummaryForExport = (
  summary: OverallSummary
): Array<Record<string, string | number>> => {
  const expectedItems = summary.statusCounts.matched + summary.statusCounts.missing;

  return [
    {
      metric: "Total Items",
      value: summary.statusCounts.total,
    },
    {
      metric: "Expected Items",
      value: expectedItems,
    },
    {
      metric: "Matched",
      value: summary.statusCounts.matched,
    },
    {
      metric: "Missing",
      value: summary.statusCounts.missing,
    },
    {
      metric: "Unexpected",
      value: summary.statusCounts.unexpected,
    },
    {
      metric: "Not Recorded",
      value: summary.statusCounts.notRecorded,
    },
    {
      metric: "Accuracy Rate",
      value: `${summary.statusBreakdown.accuracyRate.toFixed(2)}%`,
    },
  ];
};

/**
 * Format section report for export
 */
export const formatSectionReportForExport = (
  reports: SectionReport[]
): Array<Record<string, string | number>> => {
  return reports.map((report) => {
    const expectedItems = report.statusCounts.matched + report.statusCounts.missing;
    return {
      accuracyRate: `${report.statusBreakdown.accuracyRate.toFixed(2)}%`,
      expected: expectedItems,
      matched: report.statusCounts.matched,
      missing: report.statusCounts.missing,
      section: report.sectionName,
      total: report.statusCounts.total,
      unexpected: report.statusCounts.unexpected,
    };
  });
};

/**
 * Format SKU report for export
 */
export const formatSKUReportForExport = (
  reports: SKUReport[]
): Array<Record<string, string | number>> => {
  return reports.map((report) => {
    const expectedItems = report.statusCounts.matched + report.statusCounts.missing;
    return {
      accuracyRate: `${report.statusBreakdown.accuracyRate.toFixed(2)}%`,
      expected: expectedItems,
      internalCode: report.internalCode ?? "-",
      matched: report.statusCounts.matched,
      missing: report.statusCounts.missing,
      sections: report.sectionDistribution
        .map((d) => `${d.sectionName} (${d.count})`)
        .join(", "),
      sku: report.skuName,
      total: report.statusCounts.total,
      unexpected: report.statusCounts.unexpected,
    };
  });
};

/**
 * Format RFID insights for export
 */
export const formatRFIDInsightsForExport = (
  insights: RFIDInsights
): {
  typeBreakdown: Array<Record<string, string | number>>;
  categoryBreakdown: Array<Record<string, string | number>>;
} => {
  return {
    categoryBreakdown: insights.categoryBreakdown.map((item) => ({
      category: item.category,
      count: item.count,
      percentage: `${item.percentage.toFixed(2)}%`,
    })),
    typeBreakdown: insights.typeBreakdown.map((item) => ({
      count: item.count,
      percentage: `${item.percentage.toFixed(2)}%`,
      type: item.type,
    })),
  };
};
