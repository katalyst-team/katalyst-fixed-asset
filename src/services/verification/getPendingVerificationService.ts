import fetcher, { ApiResponse } from "@/services";
import {
  VerificationEntityType,
  VerificationPendingResponse,
} from "@/types/verification";

interface GetPendingVerificationParams {
  entityType: VerificationEntityType;
  limit?: number;
  module?: string;
  organizationId: string;
  page?: number;
  storeId: string;
}

export const getPendingVerificationService = async ({
  entityType,
  limit = 20,
  module,
  organizationId,
  page,
  storeId,
}: GetPendingVerificationParams): Promise<
  ApiResponse<VerificationPendingResponse>
> => {
  return fetcher({
    method: "GET",
    params: { limit, module, page },
    url: `/v1/organizations/${organizationId}/stores/${storeId}/verification/${entityType}/pending`,
  });
};
