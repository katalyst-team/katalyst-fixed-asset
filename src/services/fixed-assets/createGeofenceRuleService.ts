import type { GeofenceRuleRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type CreateGeofenceRuleResponse = ApiResponse<Record<string, unknown>>;

interface CreateGeofenceRuleParams {
  data: GeofenceRuleRequest;
  organizationId: string;
}

export const createGeofenceRuleService = async ({
  data,
  organizationId,
}: CreateGeofenceRuleParams): Promise<CreateGeofenceRuleResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/security/geofence-rules`,
  });
};
