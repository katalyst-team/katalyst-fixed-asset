import { useQuery } from "@tanstack/react-query";

import {
  GetBillingResponse,
  getBillingService,
} from "@/services/fixed-assets/getBillingService";

interface UseGetBillingQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_BILLING = (organizationId: string) => [
  "faBilling",
  organizationId,
];

const useGetBillingQuery = ({
  enabled = true,
  organizationId,
}: UseGetBillingQueryParams) => {
  return useQuery<GetBillingResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getBillingService({ organizationId }),
    queryKey: KEY_USE_GET_FA_BILLING(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetBillingQuery;
