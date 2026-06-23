import type { CreateTransferRequest, FaTransferItem } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type CreateTransferResponse = ApiResponse<{ transfer: FaTransferItem }>;

interface CreateTransferParams {
  data: CreateTransferRequest;
  organizationId: string;
}

export const createTransferService = async ({
  data,
  organizationId,
}: CreateTransferParams): Promise<CreateTransferResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/transfers`,
  });
};
