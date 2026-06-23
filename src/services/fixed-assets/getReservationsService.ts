import type { FaReservation } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetReservationsResponse = ApiResponse<{
  reservations: FaReservation[];
}>;

interface GetReservationsParams {
  cursor?: string;
  limit?: number;
  organizationId: string;
}

export const getReservationsService = async ({
  cursor,
  limit,
  organizationId,
}: GetReservationsParams): Promise<GetReservationsResponse> => {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/reservations${queryString}`,
  });
};
