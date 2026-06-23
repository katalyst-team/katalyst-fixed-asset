import type { CreateWorkOrderRequest, FaWorkOrder } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type CreateWorkOrderResponse = ApiResponse<{ workOrder: FaWorkOrder }>;

interface CreateWorkOrderParams {
  data: CreateWorkOrderRequest;
  organizationId: string;
}

export const createWorkOrderService = async ({
  data,
  organizationId,
}: CreateWorkOrderParams): Promise<CreateWorkOrderResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/work-orders`,
  });
};
