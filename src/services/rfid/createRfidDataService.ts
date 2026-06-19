import { CreateRfidPayload, RfidCreateResponse } from "@/types/rfid";

import fetcher from "..";

interface CreateRfidDataParams {
  organizationId: string;
  payload: CreateRfidPayload;
}

export const createRfidDataService = async ({
  organizationId,
  payload,
}: CreateRfidDataParams): Promise<RfidCreateResponse> => {
  const url = `/v1/organizations/${organizationId}/rfids`;

  return fetcher({
    data: payload,
    method: "POST",
    url,
  });
};
