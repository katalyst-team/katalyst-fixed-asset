import type { FaNotificationTrigger } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type UpdateNotificationTriggersResponse = ApiResponse<{
  triggers: FaNotificationTrigger[];
}>;

interface UpdateNotificationTriggersParams {
  data: { triggers: FaNotificationTrigger[] };
  organizationId: string;
}

export const updateNotificationTriggersService = async ({
  data,
  organizationId,
}: UpdateNotificationTriggersParams): Promise<UpdateNotificationTriggersResponse> => {
  return fetcher({
    data,
    method: "PUT",
    url: `/v1/organizations/${organizationId}/fa/settings/notifications/triggers`,
  });
};
