import {
  InventoryAreaDetailFilterOptions,
  InventoryAreaDetailResponse,
} from "@/types/inventory-area";

import fetcher from "..";

export interface GetInventoryAreaDetailParams {
  organizationId: string;
  storeId: string;
  sectionId: string;
  filters?: InventoryAreaDetailFilterOptions;
}

export const getInventoryAreaDetailService = (
  params: GetInventoryAreaDetailParams
): Promise<InventoryAreaDetailResponse> => {
  const { stock_movement_type_ids, ...otherFilters } = params.filters || {};

  return fetcher({
    method: "GET",
    params: {
      ...(otherFilters.cursor && { cursor: otherFilters.cursor }),
      ...(otherFilters.limit && { limit: otherFilters.limit }),
      ...(otherFilters.query && { query: otherFilters.query }),
      ...(otherFilters.start_date && { start_date: otherFilters.start_date }),
      ...(otherFilters.end_date && { end_date: otherFilters.end_date }),
      ...(stock_movement_type_ids && stock_movement_type_ids.length > 0 && {
        stock_movement_type_ids: stock_movement_type_ids.join(","),
      }),
    },
    url: `/v1/organizations/${params.organizationId}/stores/${params.storeId}/section-inventories/${params.sectionId}`,
  });
};
