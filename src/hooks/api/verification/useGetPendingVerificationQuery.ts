import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import { getPendingVerificationService } from "@/services/verification";
import {
  VerificationEntityType,
  VerificationPendingResponse,
} from "@/types/verification";

export const KEY_USE_GET_PENDING_VERIFICATION = (
  organizationId: string,
  storeId: string,
  entityType: VerificationEntityType,
  page?: number,
  module?: string,
) => ["verification-pending", organizationId, storeId, entityType, page, module];

interface UseGetPendingVerificationQueryProps {
  enabled?: boolean;
  entityType: VerificationEntityType;
  module?: string;
  organizationId: string;
  page?: number;
  storeId: string;
}

const useGetPendingVerificationQuery = ({
  enabled = true,
  entityType,
  module,
  organizationId,
  page,
  storeId,
}: UseGetPendingVerificationQueryProps) => {
  return useQuery<ApiResponse<VerificationPendingResponse>>({
    enabled: !!organizationId && !!storeId && !!entityType && enabled,
    queryFn: () =>
      getPendingVerificationService({ entityType, module, organizationId, page, storeId }),
    queryKey: KEY_USE_GET_PENDING_VERIFICATION(
      organizationId,
      storeId,
      entityType,
      page,
      module,
    ),
  });
};

export default useGetPendingVerificationQuery;
