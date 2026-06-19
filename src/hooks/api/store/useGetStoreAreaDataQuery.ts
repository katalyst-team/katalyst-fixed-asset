import { useQuery } from "@tanstack/react-query";

import {
  GetStoreAreaDataResponse,
  getStoreAreaDataService,
} from "@/services/store/getStoreAreaDataService";

interface UseGetStoreAreaDataQueryParams {
  limit?: number;
  name?: string;
  organizationId: string;
  storeId: string;
}

export const KEY_USE_GET_STORE_AREA_DATA = (
  organizationId: string,
  storeId: string,
  limit?: number,
  name?: string,
) => ["storeAreaData", organizationId, storeId, limit, name];

const useGetStoreAreaDataQuery = ({
  limit,
  name,
  organizationId,
  storeId,
}: UseGetStoreAreaDataQueryParams) => {
  return useQuery<GetStoreAreaDataResponse, Error>({
    enabled: Boolean(organizationId) && Boolean(storeId),
    queryFn: () =>
      getStoreAreaDataService({ limit, name, organizationId, storeId }),
    queryKey: KEY_USE_GET_STORE_AREA_DATA(organizationId, storeId, limit, name),
    staleTime: 60 * 1000,
  });
};

export default useGetStoreAreaDataQuery;
