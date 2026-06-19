import type {
  GetItemsMapParams,
  ItemsMapResponse,
} from "@/types/addRemoveRfid";

import fetcher from "..";

export const getItemsMapService = async ({
  organizationId,
  storeId,
  filters,
}: GetItemsMapParams): Promise<ItemsMapResponse> => {
  const url = `/v2/organizations/${organizationId}/stores/${storeId}/items-map`;

  // Build request body from filters
  const body: Record<string, unknown> = {};

  if (filters?.cursor !== undefined) {
    body.cursor = filters.cursor;
  }

  if (filters?.limit !== undefined) {
    body.limit = filters.limit;
  }

  if (filters?.is_rfid_assigned !== undefined) {
    body.is_rfid_assigned = filters.is_rfid_assigned;
  }

  if (filters?.epcs && filters.epcs.length > 0) {
    body.epcs = filters.epcs;
  }

  if (filters?.category_ids && filters.category_ids.length > 0) {
    body.category_ids = filters.category_ids;
  }

  if (filters?.expiry_date) {
    body.expiry_date = filters.expiry_date;
  }

  if (filters?.last_updated_end) {
    body.last_updated_end = filters.last_updated_end;
  }

  if (filters?.last_updated_start) {
    body.last_updated_start = filters.last_updated_start;
  }

  if (filters?.section_id) {
    body.section_id = filters.section_id;
  }

  if (filters?.show_total_count !== undefined) {
    body.show_total_count = filters.show_total_count;
  }

  if (filters?.sku) {
    body.sku = filters.sku;
  }

  if (filters?.sku_ids && filters.sku_ids.length > 0) {
    body.sku_ids = filters.sku_ids;
  }

  if (filters?.sku_name) {
    body.sku_name = filters.sku_name;
  }

  if (filters?.status_ids && filters.status_ids.length > 0) {
    body.status_ids = filters.status_ids;
  }

  return fetcher({
    data: body,
    method: "POST",
    url,
  });
};
