import { useQuery } from "@tanstack/react-query";

import {
  GetInsurancePoliciesResponse,
  getInsurancePoliciesService,
} from "@/services/fixed-assets/getInsurancePoliciesService";

interface UseGetInsurancePoliciesQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_INSURANCE = (organizationId: string) => [
  "faInsurance",
  organizationId,
];

const useGetInsurancePoliciesQuery = ({
  enabled = true,
  organizationId,
}: UseGetInsurancePoliciesQueryParams) => {
  return useQuery<GetInsurancePoliciesResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getInsurancePoliciesService({ organizationId }),
    queryKey: KEY_USE_GET_FA_INSURANCE(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetInsurancePoliciesQuery;
