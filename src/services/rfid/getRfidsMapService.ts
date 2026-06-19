import { GetRfidsMapParams, GetRfidsMapPayload, RfidMapResponse } from "@/types/rfid";

import fetcher from "..";

export const getRfidsMapService = async ({
  organizationID,
  storeID,
  payload,
}: GetRfidsMapParams & { payload: GetRfidsMapPayload }): Promise<RfidMapResponse> => {
  const url = `/v1/organizations/${organizationID}/stores/${storeID}/rfids-map`;

  return fetcher({
    data: payload,
    method: "POST",
    url,
  });
};