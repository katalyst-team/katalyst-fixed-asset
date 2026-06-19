import { GateListFilter, GateListResponse } from "@/types/gate";

import fetcher, { ApiResponse } from "..";

interface GetGateListParams {
  filters?: GateListFilter;
  organizationId: string;
}

export const getGateListService = async ({
  filters,
  organizationId,
}: GetGateListParams): Promise<ApiResponse<GateListResponse>> => {
  const params = new URLSearchParams();
  if (filters?.store_id) params.append("store_id", filters.store_id);
  if (filters?.section_id) params.append("section_id", filters.section_id);
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.cursor) params.append("cursor", filters.cursor);

  const qs = params.toString();
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/gates${qs ? `?${qs}` : ""}`,
  });
};
