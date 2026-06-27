import fetcher, { ApiResponse } from "..";

export interface CreatePredictiveModelRequest {
  asset_scope: string;
  features: string[];
  is_active?: boolean;
  model_type: string;
  name: string;
  version: string;
}

export type CreatePredictiveModelResponse = ApiResponse<{ ext_id: string }>;

interface CreatePredictiveModelParams {
  data: CreatePredictiveModelRequest;
  organizationId: string;
}

export const createPredictiveModelService = async ({
  data,
  organizationId,
}: CreatePredictiveModelParams): Promise<CreatePredictiveModelResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/predictive/models`,
  });
};
