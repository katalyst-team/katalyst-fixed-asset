import type { InviteFAUserRequest } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type InviteFAUserResponse = ApiResponse<{
  email: string;
  status: string;
}>;

interface InviteFAUserParams {
  data: InviteFAUserRequest;
  organizationId: string;
}

export const inviteFAUserService = async ({
  data,
  organizationId,
}: InviteFAUserParams): Promise<InviteFAUserResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/users/invite`,
  });
};
