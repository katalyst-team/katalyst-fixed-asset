import { useQuery } from "@tanstack/react-query";

import {
  AssignStatus,
  getProductService,
  ProductFilterOptions,
} from "../../../services/product/getProductService";

interface UseGetProductDataQueryParams {
  enabled?: boolean;
  filters?: ProductFilterOptions;
  organizationId: string;
}

export const USE_GET_PRODUCT_DATA_QUERY_KEY = (
  organizationId: string,
  filters?: ProductFilterOptions,
) => ["products", organizationId, JSON.stringify(filters)];

export const useGetProductDataQuery = ({
  filters,
  organizationId,
  enabled,
}: UseGetProductDataQueryParams) => {
  return useQuery({
    enabled: enabled !== undefined ? enabled : Boolean(organizationId),
    queryFn: () => getProductService({ filters, organizationId }),
    queryKey: USE_GET_PRODUCT_DATA_QUERY_KEY(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export type { AssignStatus, ProductFilterOptions };
