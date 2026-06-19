import fetcher, { ApiResponse } from "@/services";
import { VerificationActionParams } from "@/types/verification";

export const submitVerificationService = async ({
  organizationId,
  storeId,
  entityType,
  entityId,
}: VerificationActionParams): Promise<ApiResponse<unknown>> => {
  return fetcher({
    method: "POST",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/verification/${entityType}/${entityId}/submit`,
  });
};
