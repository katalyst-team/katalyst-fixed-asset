import fetcher from "@/services";
import {
  DetailInventoryFilterOptions,
  SectionsBySkuResponse,
} from "@/types/detailInventory";

interface GetSkuSectionsParams {
  filters?: Omit<DetailInventoryFilterOptions, "sku_id">;
  organizationId: string;
  skuId: string;
}

export const getSkuSectionsService = async ({
  filters,
  organizationId,
  skuId,
}: GetSkuSectionsParams): Promise<SectionsBySkuResponse> => {
  // Create API params
  const params: Record<string, unknown> = {
    ...filters,
  };

  return fetcher({
    method: "GET",
    params,
    url: `/v1/organizations/${organizationId}/skus/${skuId}/sections`,
  });
};
