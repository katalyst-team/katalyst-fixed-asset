import fetcher, { ApiResponse } from "..";

export type RetrainPredictiveModelResponse = ApiResponse<{
  estimated_minutes: number;
  ext_id: string;
  status: string;
}>;

interface RetrainPredictiveModelParams {
  modelId: string;
  organizationId: string;
}

export const retrainPredictiveModelService = async ({
  modelId,
  organizationId,
}: RetrainPredictiveModelParams): Promise<RetrainPredictiveModelResponse> => {
  return fetcher({
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/predictive/models/${modelId}/retrain`,
  });
};
