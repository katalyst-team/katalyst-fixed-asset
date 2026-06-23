import type { CreateReservationRequest, FaReservation } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type CreateReservationResponse = ApiResponse<{
  reservation: FaReservation;
}>;

interface CreateReservationParams {
  data: CreateReservationRequest;
  organizationId: string;
}

export const createReservationService = async ({
  data,
  organizationId,
}: CreateReservationParams): Promise<CreateReservationResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/reservations`,
  });
};
