import { useMutation } from "@tanstack/react-query";

import { getRfidsMapService } from "@/services/rfid/getRfidsMapService";
import { GetRfidsMapParams, GetRfidsMapPayload, RfidMapResponse } from "@/types/rfid";

export const KEY_USE_GET_RFIDS_MAP_MUTATION = (
  organizationID: string,
  storeID: string
) => ["rfidsMapMutation", organizationID, storeID];

const useGetRfidsMapMutation = ({
  organizationID,
  storeID,
}: GetRfidsMapParams) => {
  return useMutation<RfidMapResponse, Error, GetRfidsMapPayload>({
    mutationFn: (payload: GetRfidsMapPayload) => 
      getRfidsMapService({ organizationID, payload, storeID }),
    mutationKey: KEY_USE_GET_RFIDS_MAP_MUTATION(organizationID, storeID),
  });
};

export default useGetRfidsMapMutation;