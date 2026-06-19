import {
  AuditHistoryFilterOptions,
  AuditHistoryResponse,
} from "@/types/stock-audit-area";

import fetcher from "..";

export interface GetAuditHistoryBySectionParams {
  organizationId: string;
  storeId: string;
  sectionId: string;
  filters?: AuditHistoryFilterOptions;
}

export const getAuditHistoryBySection = (
  params: GetAuditHistoryBySectionParams
): Promise<AuditHistoryResponse> => {
  const queryParams = new URLSearchParams();

  // Required query params from user's specification
  queryParams.append("type", "BY_SECTION");
  queryParams.append("status", "COMPLETED");
  queryParams.append("checking_object_id", params.sectionId);
  queryParams.append("order_direction", params.filters?.sort_order || "DESC");

  // Optional filters
  if (params.filters?.auditor) {
    queryParams.append("aor_id", params.filters.auditor);
  }
  params.filters?.stock_movement_type_names?.forEach((name) =>
    queryParams.append("stock_movement_type_names", name),
  );

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${params.organizationId}/stores/${params.storeId}/audits?${queryParams.toString()}`,
  });
};
