import { useQuery } from "@tanstack/react-query";

import fetcher from "@/services";
import { GetRfidsMapPayload } from "@/types/rfid";

export const KEY_USE_GET_RFIDS_MAP_QUERY = (
  organizationID: string,
  storeID: string,
  payload?: GetRfidsMapPayload,
) => ["rfidsMap", organizationID, storeID, payload];

export const useGetRfidsMapQuery = ({
  enabled,
  organizationId,
  payload,
  storeId,
}: {
  enabled?: boolean;
  organizationId: string;
  payload?: GetRfidsMapPayload;
  storeId: string;
}) => {
  const query = useQuery({
    enabled,
    queryFn: () =>
      fetcher({
        data: payload,
        method: "POST",
        url: `/v1/organizations/${organizationId}/stores/${storeId}/rfids-map`,
      }),
    queryKey: KEY_USE_GET_RFIDS_MAP_QUERY(organizationId, storeId, payload),
  });

  return {
    ...query,
  };
};
