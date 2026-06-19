import { useQuery } from "@tanstack/react-query";

import { getStatusDataService } from "@/services/status/getStatusDataService";
import { StatusLedgerResponse } from "@/types/statusLedger";

interface UseGetStatusDataQueryParams {
  organizationId: string;
}

export const KEY_USE_GET_STATUS_DATA = (organizationId: string) => [
  "statusData",
  organizationId,
];

const useGetStatusDataQuery = ({
  organizationId,
}: UseGetStatusDataQueryParams) => {
  return useQuery<StatusLedgerResponse, Error>({
    enabled: Boolean(organizationId),
    queryFn: () =>
      getStatusDataService({
        organizationId,
      }),
    queryKey: KEY_USE_GET_STATUS_DATA(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetStatusDataQuery;