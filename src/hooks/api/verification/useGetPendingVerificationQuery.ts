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
  cursor?: string,
  module?: string,
) => ["verification-pending", organizationId, storeId, entityType, cursor, module];

interface UseGetPendingVerificationQueryProps {
  cursor?: string;
  enabled?: boolean;
  entityType: VerificationEntityType;
  module?: string;
  organizationId: string;
  storeId: string;
}

const useGetPendingVerificationQuery = ({
  cursor,
  enabled = true,
  entityType,
  module,
  organizationId,
  storeId,
}: UseGetPendingVerificationQueryProps) => {
  return useQuery<ApiResponse<VerificationPendingResponse>>({
    enabled: !!organizationId && !!storeId && !!entityType && enabled,
    queryFn: () =>
      getPendingVerificationService({ cursor, entityType, module, organizationId, storeId }),
    queryKey: KEY_USE_GET_PENDING_VERIFICATION(
      organizationId,
      storeId,
      entityType,
      cursor,
      module,
    ),
  });
};

export default useGetPendingVerificationQuery;
