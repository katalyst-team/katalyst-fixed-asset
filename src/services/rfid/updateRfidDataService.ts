import { RfidCreateResponse, UpdateRfidPayload } from "@/types/rfid";

import fetcher from "..";

interface UpdateRfidDataParams {
  organizationId: string;
  payload: UpdateRfidPayload;
}

export const updateRfidDataService = async ({
  organizationId,
  payload,
}: UpdateRfidDataParams): Promise<RfidCreateResponse> => {
  const url = `/v1/organizations/${organizationId}/rfids`;

  return fetcher({
    data: payload,
    method: "PATCH",
    url,
  });
};
