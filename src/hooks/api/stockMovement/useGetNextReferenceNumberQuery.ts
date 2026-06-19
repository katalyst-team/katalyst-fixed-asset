import { useQuery } from "@tanstack/react-query";

import {
  getNextReferenceNumberService,
  NextReferenceNumberResponse,
} from "@/services/stockMovement/getNextReferenceNumberService";

interface UseGetNextReferenceNumberQueryParams {
  enabled?: boolean;
  organizationId: string;
  storeId: string;
}

export const KEY_USE_GET_NEXT_REFERENCE_NUMBER = (
  organizationId: string,
  storeId: string,
) => ["nextReferenceNumber", organizationId, storeId];

const useGetNextReferenceNumberQuery = ({
  enabled = true,
  organizationId,
  storeId,
}: UseGetNextReferenceNumberQueryParams) => {
  return useQuery<NextReferenceNumberResponse, Error>({
    enabled: enabled && Boolean(organizationId) && Boolean(storeId),
    queryFn: async () => {
      const response = await getNextReferenceNumberService({
        organizationId,
        storeId,
      });
      return response.data;
    },
    queryKey: KEY_USE_GET_NEXT_REFERENCE_NUMBER(organizationId, storeId),
    staleTime: 60 * 1000,
  });
};

export default useGetNextReferenceNumberQuery;
