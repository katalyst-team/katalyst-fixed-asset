import { useQuery } from "@tanstack/react-query";

import {
  GetNotificationTriggersResponse,
  getNotificationTriggersService,
} from "@/services/fixed-assets/getNotificationTriggersService";

interface UseGetNotificationTriggersQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_NOTIFICATION_TRIGGERS = (organizationId: string) => [
  "faNotificationTriggers",
  organizationId,
];

const useGetNotificationTriggersQuery = ({
  enabled = true,
  organizationId,
}: UseGetNotificationTriggersQueryParams) => {
  return useQuery<GetNotificationTriggersResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getNotificationTriggersService({ organizationId }),
    queryKey: KEY_USE_GET_FA_NOTIFICATION_TRIGGERS(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetNotificationTriggersQuery;
