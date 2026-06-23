import type { FaTransferItem } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type ConfirmTransferReceiptResponse = ApiResponse<{
  received_at: string;
  transfer: FaTransferItem;
}>;

interface ConfirmTransferReceiptParams {
  organizationId: string;
  transferId: string;
}

export const confirmTransferReceiptService = async ({
  organizationId,
  transferId,
}: ConfirmTransferReceiptParams): Promise<ConfirmTransferReceiptResponse> => {
  return fetcher({
    method: "PUT",
    url: `/v1/organizations/${organizationId}/fa/transfers/${transferId}/confirm-receipt`,
  });
};
