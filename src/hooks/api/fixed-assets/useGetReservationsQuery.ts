import { useQuery } from "@tanstack/react-query";

import {
  GetReservationsResponse,
  getReservationsService,
} from "@/services/fixed-assets/getReservationsService";

interface UseGetReservationsQueryParams {
  cursor?: string;
  enabled?: boolean;
  limit?: number;
  organizationId: string;
}

export const KEY_USE_GET_FA_RESERVATIONS = (
  organizationId: string,
  filters?: { cursor?: string; limit?: number },
) => ["faReservations", organizationId, JSON.stringify(filters ?? {})];

const useGetReservationsQuery = ({
  cursor,
  enabled = true,
  limit,
  organizationId,
}: UseGetReservationsQueryParams) => {
  const filters = { cursor, limit };

  return useQuery<GetReservationsResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getReservationsService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_RESERVATIONS(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetReservationsQuery;
