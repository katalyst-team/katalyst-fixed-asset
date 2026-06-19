import { SkuItemType, SkuStatus, SkuType } from "@/types/sku";

import fetcher, { ApiResponse } from "..";

export type AssignStatus = "ASSIGNED" | "UNASSIGNED";

export type QueryAttributesType =
  | string
  | Record<string, unknown>;

export type DateAttributeFilterType = string | { attribute_id: string; end_date: string; start_date: string }[];

export interface ProductFilterOptions {
  aging_days_max?: number;
  aging_days_min?: number;
  area_transfer_date_end?: string;
  area_transfer_date_start?: string;
  assign_status?: AssignStatus;
  assigned_store_id?: string;
  category_ids?: string[];
  cursor?: string;
  end_date?: string;
  inbound_date_end?: string;
  inbound_date_start?: string;
  internal_code?: string;
  item_status_ids?: string[];
  limit?: number;
  outbound_date_end?: string;
  outbound_date_start?: string;
  parent_category_ids?: string[];
  query?: string;
  query_attributes?: QueryAttributesType;
  query_date_attributes?: DateAttributeFilterType;
  rfid_name?: string;
  sku?: string;
  start_date?: string;
  status?: SkuStatus;
  type?: SkuType;
}

interface GetProductParams {
  cursor?: string;
  filters?: ProductFilterOptions;
  limit?: number;
  organizationId: string;
  type?: SkuType;
}

export type GetProductResponse = ApiResponse<{ skus: SkuItemType[] }>;

export const getProductService = async ({
  organizationId,
  cursor,
  limit,
  type,
  filters,
}: GetProductParams): Promise<GetProductResponse> => {
  const url = `/v1/organizations/${organizationId}/skus/products`;
  const params = new URLSearchParams();

  // Top-level params (for backward compatibility with product module)
  if (cursor) {
    params.append("cursor", cursor);
  }

  if (limit) {
    params.append("limit", limit.toString());
  }

  if (type) {
    params.append("sku_type", type);
  }

  if (filters) {
    // For ledger product compatibility - cursor/limit can also come from filters
    if (filters.cursor) {
      params.append("cursor", filters.cursor);
    }

    if (filters.limit) {
      params.append("limit", filters.limit.toString());
    }

    if (filters.type) {
      params.append("sku_type", filters.type);
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

    if (filters.rfid_name) {
      params.append("rfid_name", filters.rfid_name);
    }

    if (filters.status) {
      params.append("status", filters.status);
    }

    if (filters.category_ids && filters.category_ids.length > 0) {
      filters.category_ids.forEach((id) => {
        params.append("category_ids", id);
      });
    }

    if (filters.parent_category_ids && filters.parent_category_ids.length > 0) {
      params.append("parent_category_ids", filters.parent_category_ids.join(","));
    }

    if (filters.query_attributes) {
      const queryString =
        typeof filters.query_attributes === "string"
          ? filters.query_attributes
          : JSON.stringify(filters.query_attributes);
      params.append("query_attributes", queryString);
    }

    if (filters.assign_status) {
      params.append("assign_status", filters.assign_status);
    }

    if (filters.item_status_ids && filters.item_status_ids.length > 0) {
      filters.item_status_ids.forEach((statusId) => {
        params.append("item_status_ids", statusId);
      });
    }

    if (filters.assigned_store_id) {
      params.append("assigned_store_id", filters.assigned_store_id);
    }

    if (filters.start_date) {
      params.append("start_date", filters.start_date);
    }

    if (filters.end_date) {
      params.append("end_date", filters.end_date);
    }

    if (filters.inbound_date_start) {
      params.append("inbound_date_start", filters.inbound_date_start);
    }
    if (filters.inbound_date_end) {
      params.append("inbound_date_end", filters.inbound_date_end);
    }
    if (filters.outbound_date_start) {
      params.append("outbound_date_start", filters.outbound_date_start);
    }
    if (filters.outbound_date_end) {
      params.append("outbound_date_end", filters.outbound_date_end);
    }
    if (filters.area_transfer_date_start) {
      params.append("area_transfer_date_start", filters.area_transfer_date_start);
    }
    if (filters.area_transfer_date_end) {
      params.append("area_transfer_date_end", filters.area_transfer_date_end);
    }
    if (filters.aging_days_min != null) {
      params.append("aging_days_min", String(filters.aging_days_min));
    }
    if (filters.aging_days_max != null) {
      params.append("aging_days_max", String(filters.aging_days_max));
    }
    if (filters.query_date_attributes) {
      const dateString =
        typeof filters.query_date_attributes === "string"
          ? filters.query_date_attributes
          : JSON.stringify(filters.query_date_attributes);
      params.append("query_date_attributes", dateString);
    }
  }

  const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;

  return fetcher({
    method: "GET",
    url: fullUrl,
  });
};
