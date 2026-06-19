import { useQuery } from "@tanstack/react-query";

import {
  GetStoreDataFiltersParams,
  GetStoreDataResponse,
  getStoreDataService,
} from "@/services/store/getStoreDataService";

interface UseGetStoreDataQueryParams {
  organizationId: string;
  filters?: GetStoreDataFiltersParams;
}

export const KEY_USE_GET_STORE_DATA = (organizationId: string) => [
  "storeData",
  organizationId,
];

const useGetStoreDataQuery = ({
  organizationId,
  filters,
}: UseGetStoreDataQueryParams) => {
  return useQuery<GetStoreDataResponse, Error>({
    enabled: Boolean(organizationId),
    queryFn: () => getStoreDataService({ filters, organizationId }),
    queryKey: KEY_USE_GET_STORE_DATA(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetStoreDataQuery;
