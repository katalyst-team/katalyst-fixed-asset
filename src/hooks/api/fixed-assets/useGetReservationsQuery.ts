import { useQuery } from "@tanstack/react-query";

import {
  GetReservationsResponse,
  getReservationsService,
} from "@/services/fixed-assets/getReservationsService";

interface UseGetReservationsQueryParams {
  enabled?: boolean;
  limit?: number;
  organizationId: string;
  page?: number;
}

export const KEY_USE_GET_FA_RESERVATIONS = (
  organizationId: string,
  filters?: { limit?: number; page?: number },
) => ["faReservations", organizationId, JSON.stringify(filters ?? {})];

const useGetReservationsQuery = ({
  enabled = true,
  limit,
  organizationId,
  page,
}: UseGetReservationsQueryParams) => {
  const filters = { limit, page };

  return useQuery<GetReservationsResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getReservationsService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_RESERVATIONS(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetReservationsQuery;
