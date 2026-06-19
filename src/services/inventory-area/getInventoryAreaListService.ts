import {
  InventoryAreaFilterOptions,
  InventoryAreaListResponse,
} from "@/types/inventory-area";

import fetcher from "..";

export interface GetInventoryAreaListParams {
  organizationId: string;
  storeId: string;
  filters?: InventoryAreaFilterOptions;
}

export const getInventoryAreaListService = (
  params: GetInventoryAreaListParams
): Promise<InventoryAreaListResponse> => {
  return fetcher({
    method: "GET",
    params: {
      ...(params.filters?.query && { query: params.filters.query }),
      ...(params.filters?.rfid_name && { rfid_name: params.filters.rfid_name }),
      ...(params.filters?.section_ids &&
        params.filters.section_ids.length > 0 && {
          section_ids: params.filters.section_ids.join(","),
        }),
      ...(params.filters?.sort && { sort: params.filters.sort }),
      ...(params.filters?.stock_movement_type_id && {
        stock_movement_type_id: params.filters.stock_movement_type_id,
      }),
      ...(params.filters?.start_date && { start_date: params.filters.start_date }),
      ...(params.filters?.end_date && { end_date: params.filters.end_date }),
    },
    url: `/v1/organizations/${params.organizationId}/stores/${params.storeId}/section-inventories`,
  });
};
