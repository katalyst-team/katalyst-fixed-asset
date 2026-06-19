import { DeleteRfidPayload, RfidDeleteResponse } from "@/types/rfid";

import fetcher from "..";

interface DeleteRfidDataParams {
  organizationId: string;
  payload: DeleteRfidPayload;
}

export const deleteRfidDataService = async ({
  organizationId,
  payload,
}: DeleteRfidDataParams): Promise<RfidDeleteResponse> => {
  const url = `/v1/organizations/${organizationId}/rfids`;

  return fetcher({
    data: payload,
    method: "DELETE",
    url,
  });
};
