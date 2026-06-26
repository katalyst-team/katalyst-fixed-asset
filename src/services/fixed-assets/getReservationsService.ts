import type { FaReservation } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetReservationsResponse = ApiResponse<{
  reservations: FaReservation[];
}>;

interface GetReservationsParams {
  limit?: number;
  organizationId: string;
  page?: number;
}

export const getReservationsService = async ({
  limit,
  organizationId,
  page,
}: GetReservationsParams): Promise<GetReservationsResponse> => {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/reservations${queryString}`,
  });
};
