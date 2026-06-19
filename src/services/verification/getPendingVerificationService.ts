import fetcher, { ApiResponse } from "@/services";
import {
  VerificationEntityType,
  VerificationPendingResponse,
} from "@/types/verification";

interface GetPendingVerificationParams {
  cursor?: string;
  entityType: VerificationEntityType;
  limit?: number;
  module?: string;
  organizationId: string;
  storeId: string;
}

export const getPendingVerificationService = async ({
  cursor,
  entityType,
  limit = 20,
  module,
  organizationId,
  storeId,
}: GetPendingVerificationParams): Promise<
  ApiResponse<VerificationPendingResponse>
> => {
  return fetcher({
    method: "GET",
    params: { cursor, limit, module },
    url: `/v1/organizations/${organizationId}/stores/${storeId}/verification/${entityType}/pending`,
  });
};
