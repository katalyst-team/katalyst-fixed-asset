import fetcher, { ApiResponse } from "@/services";
import { VerificationActionParams } from "@/types/verification";

export const rejectVerificationService = async ({
  organizationId,
  storeId,
  entityType,
  entityId,
  note,
}: VerificationActionParams): Promise<ApiResponse<unknown>> => {
  return fetcher({
    data: { note },
    method: "POST",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/verification/${entityType}/${entityId}/reject`,
  });
};
