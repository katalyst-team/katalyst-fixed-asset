import { useQuery } from "@tanstack/react-query";

import {
  GetInventorySkuParams,
  getInventorySkuService,
  InventorySkuResponse,
} from "@/services/inventory/getInventorySkuService";

interface UseGetInventorySkuQueryProps extends GetInventorySkuParams {
  enabled?: boolean;
}

const useGetInventorySkuQuery = ({
  organizationId,
  skuId,
  enabled = true,
}: UseGetInventorySkuQueryProps) => {
  return useQuery<InventorySkuResponse>({
    enabled: enabled && Boolean(organizationId) && Boolean(skuId),
    queryFn: () => getInventorySkuService({ organizationId, skuId }),
    queryKey: ["inventorySku", organizationId, skuId],
  });
};

export default useGetInventorySkuQuery;