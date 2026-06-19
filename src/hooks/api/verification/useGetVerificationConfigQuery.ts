import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import {
  getVerificationConfigService,
  VerificationConfigData,
} from "@/services/verification/getVerificationConfigService";

interface UseGetVerificationConfigQueryParams {
  enabled?: boolean;
  organizationId: string;
  stockMovementTypeId: string;
}

export const KEY_USE_GET_VERIFICATION_CONFIG = (
  organizationId: string,
  stockMovementTypeId: string,
) => ["verificationConfig", organizationId, stockMovementTypeId];

const useGetVerificationConfigQuery = ({
  enabled = true,
  organizationId,
  stockMovementTypeId,
}: UseGetVerificationConfigQueryParams) => {
  return useQuery<ApiResponse<VerificationConfigData>, Error>({
    enabled: enabled && Boolean(organizationId) && Boolean(stockMovementTypeId),
    queryFn: () =>
      getVerificationConfigService({
        organizationId,
        stockMovementTypeId,
      }),
    queryKey: KEY_USE_GET_VERIFICATION_CONFIG(organizationId, stockMovementTypeId),
    staleTime: 5 * 60 * 1000,
  });
};

export default useGetVerificationConfigQuery;
