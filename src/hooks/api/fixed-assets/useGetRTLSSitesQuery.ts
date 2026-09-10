import { useQuery } from "@tanstack/react-query";

import {
  GetRTLSSitesResponse,
  getRTLSSitesService,
} from "@/services/fixed-assets/getRTLSSitesService";

interface UseGetRTLSSitesQueryParams {
  organizationId: string;
}

export const KEY_USE_GET_FA_RTLS_SITES = (organizationId: string) => [
  "faRTLSSites",
  organizationId,
];

const useGetRTLSSitesQuery = ({
  organizationId,
}: UseGetRTLSSitesQueryParams) => {
  return useQuery<GetRTLSSitesResponse, Error>({
    enabled: Boolean(organizationId),
    queryFn: () => getRTLSSitesService({ organizationId }),
    queryKey: KEY_USE_GET_FA_RTLS_SITES(organizationId),
  });
};

export default useGetRTLSSitesQuery;
