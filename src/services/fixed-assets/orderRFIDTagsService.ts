import type { OrderRFIDTagsRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type OrderRFIDTagsResponse = ApiResponse<{
  order_id: string;
  status: string;
}>;

interface OrderRFIDTagsParams {
  data: OrderRFIDTagsRequest;
  organizationId: string;
}

export const orderRFIDTagsService = async ({
  data,
  organizationId,
}: OrderRFIDTagsParams): Promise<OrderRFIDTagsResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/rfid-tags/order`,
  });
};
