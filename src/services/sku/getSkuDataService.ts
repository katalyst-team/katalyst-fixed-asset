import { SkuFilterOptions, SkuItemType, SkuType } from "@/types/sku";

import fetcher, { ApiResponse } from "..";

type AssignStatus = "ASSIGNED" | "UNASSIGNED";

export interface SkuDataFilters extends SkuFilterOptions {
  assign_status?: AssignStatus;
  sku?: string;
  item_status_ids?: string[];
  cursor?: string;
  limit?: number;
  type?: SkuType;
}

interface GetSkuDataParams {
  organizationId: string;
  filters?: SkuDataFilters;
}

export type GetSkuDataResponse = ApiResponse<{ skus: SkuItemType[] | null }>;

export const getSkuDataService = async ({
  organizationId,
  filters,
}: GetSkuDataParams): Promise<GetSkuDataResponse> => {
  const url = `/v1/organizations/${organizationId}/skus`;
  const params = new URLSearchParams();

  if (filters) {
    if (filters.name) {
      params.append("name", filters.name);
    }

    if (filters.brand_id) {
      params.append("brand_id", filters.brand_id);
    }

    if (filters.color_id) {
      params.append("color_id", filters.color_id);
    }

    if (filters.size_id) {
      params.append("size_id", filters.size_id);
    }

    if (filters.query) {
      params.append("query", filters.query);
    }

    if (filters.sku) {
      params.append("sku", filters.sku);
    }

    if (filters.internal_code) {
      params.append("internal_code", filters.internal_code);
    }

    if (filters.status) {
      params.append("status", filters.status);
    }

    if (filters.category_ids && filters.category_ids.length > 0) {
      params.append("category_ids", filters.category_ids.join(","));
    }

    if (filters.parent_category_ids && filters.parent_category_ids.length > 0) {
      params.append("parent_category_ids", filters.parent_category_ids.join(","));
    }

    if (filters.query_attributes) {
      params.append("query_attributes", filters.query_attributes);
    }

    if (filters.assign_status) {
      params.append("assign_status", filters.assign_status);
    }

    if (filters.item_status_ids && filters.item_status_ids.length > 0) {
      filters.item_status_ids.forEach((statusId) => {
        params.append("item_status_ids", statusId);
      });
    }

    if (filters.sku_ids && filters.sku_ids.length > 0) {
      params.append("sku_ids", filters.sku_ids.join(","));
    }

    if (filters.assigned_store_id) {
      params.append("assigned_store_id", filters.assigned_store_id);
    }
    if (filters.limit) {
      params.append("limit", filters.limit.toString());
    }
    if (filters.cursor) {
      params.append("cursor", filters.cursor);
    }
    if (filters.type) {
      params.append("sku_type", filters.type);
    }
  }

  const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;

  return fetcher({
    method: "GET",
    url: fullUrl,
  });
};
