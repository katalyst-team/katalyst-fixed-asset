import { useQuery, UseQueryResult } from "@tanstack/react-query";

import {
  getBrandDataService,
  GetBrandDataServiceResponse,
} from "@/services/category/brand/getBrandDataService";

interface UseGetBrandDataQueryParams {
  organizationId: string;
}

export type UseGetBrandDataQueryResponse = UseQueryResult<
  GetBrandDataServiceResponse,
  Error
>;

export const KEY_USE_GET_BRAND_DATA_QUERY = (organizationId: string) => [
  "brandData",
  organizationId,
];

const useGetBrandDataQuery = ({
  organizationId,
}: UseGetBrandDataQueryParams): UseGetBrandDataQueryResponse => {
  const brandData = useQuery({
    queryFn: () => getBrandDataService(organizationId),
    queryKey: KEY_USE_GET_BRAND_DATA_QUERY(organizationId),
    staleTime: 60 * 1000, // 60 seconds
  });

  return brandData;
};

export default useGetBrandDataQuery;
