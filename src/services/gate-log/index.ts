import {
  GateLogDetailResponse,
  GateLogFilterOptions,
  GateLogListResponse,
} from "@/types/gate-log";

import fetcher from "..";

export const getGateLogListService = (
  organizationId: string,
  filters?: GateLogFilterOptions
): Promise<GateLogListResponse> => {
  const params = new URLSearchParams();

  if (filters?.storeID) params.append("storeID", filters.storeID);
  if (filters?.sectionID) params.append("sectionID", filters.sectionID);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/gate-logs${
      params.toString() ? `?${params.toString()}` : ""
    }`,
  });
};

export const getGateLogDetailService = (
  organizationId: string,
  gateLogId: string
): Promise<GateLogDetailResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/gate-logs/${gateLogId}`,
  });
};
