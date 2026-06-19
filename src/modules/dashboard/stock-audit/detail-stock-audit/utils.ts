import {
  DiscrepancyItem,
  DiscrepancyItemsResponse,
  DiscrepancyStatus,
} from "@/types/stock-audit";

export const normalizeDiscrepancyStatus = (
  status: DiscrepancyStatus,
): "MATCHED" | "MISSING" | "UNEXPECTED" | "NOT_RECORDED" => {
  // Map various possible status values to normalized ones
  const statusMap: Record<string, "MATCHED" | "MISSING" | "UNEXPECTED" | "NOT_RECORDED"> = {
    EXTRA: "UNEXPECTED",
    MATCH: "MATCHED",
    MATCHED: "MATCHED",
    MISSING: "MISSING",
    NOT_RECORDED: "NOT_RECORDED",
    NOT_REGISTER: "NOT_RECORDED",
    NOT_REGISTERED: "NOT_RECORDED",
    UNEXPECTED: "UNEXPECTED",
  };

  return statusMap[status] ?? status as "MATCHED" | "MISSING" | "UNEXPECTED" | "NOT_RECORDED";
};

export const flattenDiscrepancyItems = (
  items: DiscrepancyItemsResponse,
): DiscrepancyItem[] => {
  if (!items) {
    return [];
  }

  if (Array.isArray(items)) {
    return items;
  }

  return [
    ...(items.missing_items ?? []),
    ...(items.unexpected_items ?? []),
    ...(items.not_recorded_items ?? []),
    ...(items.matched_items ?? []),
  ];
};
