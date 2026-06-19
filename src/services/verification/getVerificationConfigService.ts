import fetcher, { ApiResponse } from "@/services";

export interface VerificationLevel {
  action: string;
  level: number;
  name: string;
  required: boolean;
}

export interface VerificationConfigData {
  enable_reference_number: boolean;
  levels: VerificationLevel[];
  reference_number_format: string;
  stock_movement_type_id: string;
  target_item_status_after_verification: string;
}

interface GetVerificationConfigParams {
  organizationId: string;
  stockMovementTypeId: string;
}

export const getVerificationConfigService = async ({
  organizationId,
  stockMovementTypeId,
}: GetVerificationConfigParams): Promise<ApiResponse<VerificationConfigData>> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/verification-configs/${stockMovementTypeId}`,
  });
};
