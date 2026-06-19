import { RfidFilterOptions, RfidListResponse } from "@/types/rfid";

import fetcher from "..";

interface GetRfidDataParams {
  organizationId: string;
  filters?: RfidFilterOptions;
}

export const getRfidDataService = async ({
  organizationId,
  filters,
}: GetRfidDataParams): Promise<RfidListResponse> => {
  const url = `/v1/organizations/${organizationId}/rfids`;

  const params = new URLSearchParams();

  if (filters?.type) {
    params.append("type", filters.type);
  }
  if (filters?.category) {
    params.append("category", filters.category);
  }
  if (filters?.status) {
    params.append("status", filters.status);
  }
  if (filters?.epcs && filters.epcs.length > 0) {
    filters.epcs.forEach((epc) => params.append("epcs", epc));
  }
  if (filters?.cursor) {
    params.append("cursor", filters.cursor);
  }
  if (filters?.limit) {
    params.append("limit", filters.limit.toString());
  }

  if (filters?.is_used !== undefined) {
    params.append("is_used", filters.is_used.toString());
  }

  if (filters?.assigned_store_id) {
    params.append("assigned_store_id", filters.assigned_store_id);
  }

  if (filters?.sort_by) {
    params.append("sort_by", filters.sort_by);
  }

  if (filters?.order_by) {
    params.append("order_by", filters.order_by);
  }

  if (filters?.rfid_name) {
    params.append("rfid_name", filters.rfid_name);
  }

  const queryString = params.toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;

  return fetcher({
    method: "GET",
    url: fullUrl,
  });
};
