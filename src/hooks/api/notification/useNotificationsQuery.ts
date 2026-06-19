import { useMutation, UseMutationResult,useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import {
  deleteNotificationService,
  GetNotificationsResponse,
  getNotificationsService,
  markNotificationAsReadService,
} from "@/services/notification/getNotificationsService";

export const KEY_USE_GET_NOTIFICATIONS = (userId: string, unreadOnly?: boolean) => [
  "notifications",
  userId,
  unreadOnly,
];

interface UseGetNotificationsQueryParams {
  userId: string;
  unreadOnly?: boolean;
  limit?: number;
}

const useGetNotificationsQuery = ({
  userId,
  unreadOnly = false,
  limit = 10,
}: UseGetNotificationsQueryParams) => {
  return useQuery<ApiResponse<GetNotificationsResponse>, Error>({
    enabled: Boolean(userId),
    queryFn: () => getNotificationsService({ limit, unread_only: unreadOnly, userId }),
    queryKey: KEY_USE_GET_NOTIFICATIONS(userId, unreadOnly),
    refetchInterval: 60000,
    staleTime: 60000,
  });
};

export const USE_MARK_NOTIFICATION_AS_READ_MUTATION_KEY = () => [
  "markNotificationAsRead",
];

interface MarkNotificationAsReadParams {
  userId: string;
  notificationId: string;
}

const useMarkNotificationAsReadMutation = (): UseMutationResult<
  unknown,
  Error,
  MarkNotificationAsReadParams,
  unknown
> => {
  return useMutation({
    mutationFn: markNotificationAsReadService,
    mutationKey: USE_MARK_NOTIFICATION_AS_READ_MUTATION_KEY(),
  });
};

export const USE_DELETE_NOTIFICATION_MUTATION_KEY = () => ["deleteNotification"];

const useDeleteNotificationMutation = (): UseMutationResult<
  unknown,
  Error,
  MarkNotificationAsReadParams,
  unknown
> => {
  return useMutation({
    mutationFn: deleteNotificationService,
    mutationKey: USE_DELETE_NOTIFICATION_MUTATION_KEY(),
  });
};

export {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
};
