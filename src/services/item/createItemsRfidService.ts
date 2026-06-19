import type {
  CreateItemsRfidParams,
  CreateItemsRfidResponse,
} from "@/types/addRemoveRfid";

import fetcher from "..";

export const createItemsRfidService = async ({
  organizationId,
  storeId,
  data,
}: CreateItemsRfidParams): Promise<CreateItemsRfidResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/items-rfid`,
  });
};
