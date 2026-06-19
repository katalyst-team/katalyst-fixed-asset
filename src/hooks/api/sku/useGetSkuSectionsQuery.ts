import { useQuery } from "@tanstack/react-query";

import { getSkuSectionsService } from "@/services/sku/getSkuSectionsService";
import {
  DetailInventoryFilterOptions,
  SectionsBySkuResponse,
} from "@/types/detailInventory";

interface UseGetSkuSectionsQueryParams {
  filters?: Omit<DetailInventoryFilterOptions, "sku_id">;
  organizationId: string;
  skuId: string;
}

export const KEY_USE_GET_SKU_SECTIONS = (
  organizationId: string,
  skuId: string
) => ["skuSections", organizationId, skuId];

const useGetSkuSectionsQuery = ({
  filters,
  organizationId,
  skuId,
}: UseGetSkuSectionsQueryParams) => {
  return useQuery<SectionsBySkuResponse, Error>({
    enabled: Boolean(organizationId) && Boolean(skuId),
    queryFn: () =>
      getSkuSectionsService({
        filters,
        organizationId,
        skuId,
      }),
    queryKey: KEY_USE_GET_SKU_SECTIONS(organizationId, skuId),
    staleTime: 60 * 1000,
  });
};

export default useGetSkuSectionsQuery;
