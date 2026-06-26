import { useQuery } from "@tanstack/react-query";

import {
  GetApprovalRulesResponse,
  getApprovalRulesService,
} from "@/services/fixed-assets/getApprovalRulesService";

interface UseGetApprovalRulesQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_APPROVAL_RULES = (organizationId: string) => [
  "faApprovalRules",
  organizationId,
];

const useGetApprovalRulesQuery = ({
  enabled = true,
  organizationId,
}: UseGetApprovalRulesQueryParams) => {
  return useQuery<GetApprovalRulesResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getApprovalRulesService({ organizationId }),
    queryKey: KEY_USE_GET_FA_APPROVAL_RULES(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetApprovalRulesQuery;
