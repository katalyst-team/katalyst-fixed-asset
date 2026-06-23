import type { FaNotificationTrigger } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetNotificationTriggersResponse = ApiResponse<{
  triggers: FaNotificationTrigger[];
}>;

interface GetNotificationTriggersParams {
  organizationId: string;
}

export const getNotificationTriggersService = async ({
  organizationId,
}: GetNotificationTriggersParams): Promise<GetNotificationTriggersResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/settings/notifications/triggers`,
  });
};
