import type { UpdateWorkOrderStatusRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type UpdateWorkOrderStatusResponse = ApiResponse<Record<string, unknown>>;

interface UpdateWorkOrderStatusParams {
  data: UpdateWorkOrderStatusRequest;
  organizationId: string;
  workOrderId: string;
}

export const updateWorkOrderStatusService = async ({
  data,
  organizationId,
  workOrderId,
}: UpdateWorkOrderStatusParams): Promise<UpdateWorkOrderStatusResponse> => {
  return fetcher({
    data,
    method: "PUT",
    url: `/v1/organizations/${organizationId}/fa/work-orders/${workOrderId}/status`,
  });
};
