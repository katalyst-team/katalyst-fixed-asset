import fetcher, { ApiResponse } from "..";

export interface CreateLifecycleEventRequest {
  detail: string;
  event_type: string;
  from_stage?: string | null;
  notes?: string | null;
  stage: string;
}

export type CreateLifecycleEventResponse = ApiResponse<{ ext_id: string }>;

interface CreateLifecycleEventParams {
  assetId: string;
  data: CreateLifecycleEventRequest;
  organizationId: string;
}

export const createLifecycleEventService = async ({
  assetId,
  data,
  organizationId,
}: CreateLifecycleEventParams): Promise<CreateLifecycleEventResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/lifecycle/${assetId}/event`,
  });
};
