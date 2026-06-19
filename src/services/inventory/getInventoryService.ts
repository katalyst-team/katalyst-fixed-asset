import fetcher, { ApiResponse } from "@/services";
import { InventoryFilterOptions, InventoryResponse } from "@/types/inventory";
interface GetInventoryParams {
  filters?: InventoryFilterOptions;
  organizationId: string;
}

export const getInventoryService = async ({
  filters,
  organizationId,
}: GetInventoryParams): Promise<ApiResponse<InventoryResponse>> => {
  // Extract category_ids for special handling
  const { category_ids, rfid_category, section_ids, stock_movement_type_id, ...otherFilters } = filters || {};

  // Create API params
  const params: Record<string, unknown> = {
    ...otherFilters,
  };

  // Add category_ids as a string if it exists
  if (category_ids && category_ids.length > 0) {
    params.category_ids = category_ids.join(",");
  }

  if (rfid_category) {
    params.rfid_category = rfid_category;
  }

  if (stock_movement_type_id) {
    params.stock_movement_type_id = stock_movement_type_id;
  }

  if (section_ids && section_ids.length > 0) {
    params.section_ids = section_ids.join(",");
  }

  return fetcher({
    method: "GET",
    params,
    url: `/v1/organizations/${organizationId}/inventories`,
  });
};
