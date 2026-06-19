import {
  AuditType,
  DiscrepancyItem,
  DiscrepancyItemsResponse,
  StockAuditDetail,
} from "@/types/stock-audit";

import {
  flattenDiscrepancyItems,
  normalizeDiscrepancyStatus,
} from "../utils";

// ============================================================================
// Types for Report Data
// ============================================================================

export type NormalizedStatus = "MATCHED" | "MISSING" | "UNEXPECTED" | "NOT_RECORDED";

export type AuditStatus = "EXCESS" | "MATCH" | "MISMATCH" | "MISPLACED";

export interface StatusCounts {
  matched: number;
  missing: number;
  unexpected: number;
  notRecorded: number;
  total: number;
}

export interface StatusBreakdown extends StatusCounts {
  accuracyRate: number; // (matched / (matched + missing)) * 100
}

export interface SectionReport {
  auditStatus: AuditStatus;
  sectionId: string | null;
  sectionName: string;
  statusCounts: StatusCounts;
  statusBreakdown: StatusBreakdown;
  items: DiscrepancyItem[];
}

export interface SKUReport {
  auditStatus: AuditStatus;
  skuId: string;
  skuName: string;
  internalCode: string | null;
  skuImage: string | null;
  statusCounts: StatusCounts;
  statusBreakdown: StatusBreakdown;
  sectionDistribution: Array<{
    sectionName: string;
    count: number;
  }>;
  items: DiscrepancyItem[];
}

export interface RFIDInsights {
  typeBreakdown: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

export interface OverallSummary {
  auditStatus: AuditStatus;
  statusCounts: StatusCounts;
  statusBreakdown: StatusBreakdown;
}

export interface ReportConfig {
  auditType: AuditType;
  focusedSKUName: string | null;
  focusedSectionName: string | null;
  showSKUReport: boolean;
  showSectionReport: boolean;
}

/**
 * Determine which report sections to show based on audit type
 */
export const getReportConfig = (auditDetail: StockAuditDetail): ReportConfig => {
  const auditType = auditDetail.type;

  switch (auditType) {
    case "ALL":
      return {
        auditType,
        focusedSKUName: null,
        focusedSectionName: null,
        showSKUReport: true,
        showSectionReport: true,
      };
    case "BY_SECTION":
      return {
        auditType,
        focusedSKUName: null,
        focusedSectionName: auditDetail.checking_object?.name ?? null,
        showSKUReport: true, // Show SKU breakdown for this section
        showSectionReport: false, // Only one section being audited
      };
    case "BY_SKU":
      return {
        auditType,
        focusedSKUName: auditDetail.checking_object?.name ?? null,
        focusedSectionName: null,
        showSKUReport: false, // Only one SKU being audited
        showSectionReport: true, // Show section breakdown for this SKU
      };
    default:
      return {
        auditType: "ALL",
        focusedSKUName: null,
        focusedSectionName: null,
        showSKUReport: true,
        showSectionReport: true,
      };
  }
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Count items by each status
 */
const countByStatus = (items: DiscrepancyItem[]): StatusCounts => {
  const counts: StatusCounts = {
    matched: 0,
    missing: 0,
    notRecorded: 0,
    total: items.length,
    unexpected: 0,
  };

  items.forEach((item) => {
    const status = normalizeDiscrepancyStatus(item.discrepancy_status);
    // Map normalized status to camelCase keys
    const statusKeyMap: Record<string, keyof StatusCounts> = {
      MATCHED: "matched",
      MISSING: "missing",
      NOT_RECORDED: "notRecorded",
      UNEXPECTED: "unexpected",
    };
    const key = statusKeyMap[status] ?? "matched";
    counts[key] += 1;
  });

  return counts;
};

/**
 * Calculate status breakdown with accuracy rate.
 * Accuracy = (found / expected) * 100
 * where found = matched, expected = matched + missing
 */
export const calculateStatusBreakdown = (
  counts: StatusCounts
): StatusBreakdown => {
  const expected = counts.matched + counts.missing;
  const accuracyRate = expected > 0
    ? (counts.matched / expected) * 100
    : 0;

  return {
    ...counts,
    accuracyRate,
  };
};

/**
 * Calculate audit status based on missing and unexpected items
 * - MATCH: All expected items found, no extra items
 * - EXCESS: All expected items found + has extra items (expected > 0)
 * - MISPLACED: Nothing expected but items found (expected === 0)
 * - MISSING: Some expected items are not found
 */
export const calculateAuditStatus = (
  counts: StatusCounts
): AuditStatus => {
  const expectedItems = counts.matched + counts.missing;

  if (counts.missing > 0) {
    return "MISMATCH";
  }
  if (counts.unexpected > 0) {
    if (expectedItems > 0) {
      return "EXCESS";
    }
    return "MISPLACED";
  }
  return "MATCH";
};

// ============================================================================
// Overall Summary
// ============================================================================

/**
 * Generate overall summary for all discrepancy items
 */
export const generateOverallSummary = (
  discrepancyItems: DiscrepancyItemsResponse
): OverallSummary => {
  const items = flattenDiscrepancyItems(discrepancyItems);
  const statusCounts = countByStatus(items);
  const statusBreakdown = calculateStatusBreakdown(statusCounts);

  return {
    auditStatus: calculateAuditStatus(statusCounts),
    statusBreakdown,
    statusCounts,
  };
};

// ============================================================================
// Section Report
// ============================================================================

/**
 * Filter out NOT_RECORDED items
 */
const excludeNotRecorded = (items: DiscrepancyItem[]): DiscrepancyItem[] => {
  return items.filter(
    (item) => normalizeDiscrepancyStatus(item.discrepancy_status) !== "NOT_RECORDED"
  );
};

/**
 * Get only NOT_RECORDED items
 */
const getOnlyNotRecorded = (items: DiscrepancyItem[]): DiscrepancyItem[] => {
  return items.filter(
    (item) => normalizeDiscrepancyStatus(item.discrepancy_status) === "NOT_RECORDED"
  );
};

/**
 * Group discrepancy items by section (excluding NOT_RECORDED)
 */
export const generateSectionReport = (
  discrepancyItems: DiscrepancyItemsResponse
): SectionReport[] => {
  const items = excludeNotRecorded(flattenDiscrepancyItems(discrepancyItems));

  // Group by section
  const sectionMap = new Map<string | null, DiscrepancyItem[]>();

  items.forEach((item) => {
    const sectionId = item.section?.id ?? "unknown";
    if (!sectionMap.has(sectionId)) {
      sectionMap.set(sectionId, []);
    }
    sectionMap.get(sectionId)!.push(item);
  });

  // Generate report for each section
  const reports: SectionReport[] = Array.from(sectionMap.entries())
    .map(([sectionId, sectionItems]) => {
      const firstItem = sectionItems[0];
      const sectionName = firstItem?.section?.name ?? "Unknown Section";
      const statusCounts = countByStatus(sectionItems);
      const statusBreakdown = calculateStatusBreakdown(statusCounts);

      return {
        auditStatus: calculateAuditStatus(statusCounts),
        items: sectionItems,
        sectionId,
        sectionName,
        statusBreakdown,
        statusCounts,
      };
    })
    .sort((a, b) => {
      // Sort by section name alphabetically
      return a.sectionName.localeCompare(b.sectionName);
    });

  return reports;
};

// ============================================================================
// SKU Report
// ============================================================================

/**
 * Group discrepancy items by SKU (excluding NOT_RECORDED)
 */
export const generateSKUReport = (
  discrepancyItems: DiscrepancyItemsResponse
): SKUReport[] => {
  const items = excludeNotRecorded(flattenDiscrepancyItems(discrepancyItems));

  // Group by SKU
  const skuMap = new Map<string, DiscrepancyItem[]>();

  items.forEach((item) => {
    const skuId = item.sku?.id ?? "unknown";
    if (!skuMap.has(skuId)) {
      skuMap.set(skuId, []);
    }
    skuMap.get(skuId)!.push(item);
  });

  // Generate report for each SKU
  const reports: SKUReport[] = Array.from(skuMap.entries())
    .map(([skuId, skuItems]) => {
      const firstItem = skuItems[0];
      const skuName = firstItem?.sku?.name ?? "Unknown SKU";
      const internalCode = firstItem?.sku?.internal_code ?? null;
      const skuImage =
        firstItem?.sku?.image_urls && firstItem.sku.image_urls.length > 0
          ? firstItem.sku.image_urls[0]
          : null;

      const statusCounts = countByStatus(skuItems);
      const statusBreakdown = calculateStatusBreakdown(statusCounts);

      // Calculate section distribution
      const sectionMap = new Map<string, number>();
      skuItems.forEach((item) => {
        const sectionName = item.section?.name ?? "Unknown";
        sectionMap.set(sectionName, (sectionMap.get(sectionName) ?? 0) + 1);
      });

      const sectionDistribution = Array.from(sectionMap.entries())
        .map(([sectionName, count]) => ({
          count,
          sectionName,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        auditStatus: calculateAuditStatus(statusCounts),
        internalCode,
        items: skuItems,
        sectionDistribution,
        skuId,
        skuImage,
        skuName,
        statusBreakdown,
        statusCounts,
      };
    })
    .sort((a, b) => {
      // Sort by SKU name alphabetically
      return a.skuName.localeCompare(b.skuName);
    });

  return reports;
};

// ============================================================================
// Not Recorded Report
// ============================================================================

/**
 * Get all NOT_RECORDED items
 */
export const generateNotRecordedReport = (
  discrepancyItems: DiscrepancyItemsResponse
): DiscrepancyItem[] => {
  return getOnlyNotRecorded(flattenDiscrepancyItems(discrepancyItems));
};

// ============================================================================
// RFID Insights
// ============================================================================

/**
 * Generate RFID insights (type and category breakdown)
 */
export const generateRFIDInsights = (
  discrepancyItems: DiscrepancyItemsResponse
): RFIDInsights => {
  const items = flattenDiscrepancyItems(discrepancyItems);
  const total = items.length;

  // Count by type
  const typeMap = new Map<string, number>();
  items.forEach((item) => {
    const type = item.rfid_detail?.type ?? "Unknown";
    typeMap.set(type, (typeMap.get(type) ?? 0) + 1);
  });

  const typeBreakdown = Array.from(typeMap.entries())
    .map(([type, count]) => ({
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      type,
    }))
    .sort((a, b) => b.count - a.count);

  // Count by category
  const categoryMap = new Map<string, number>();
  items.forEach((item) => {
    const category = item.rfid_detail?.category ?? "Unknown";
    categoryMap.set(category, (categoryMap.get(category) ?? 0) + 1);
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    categoryBreakdown,
    typeBreakdown,
  };
};
