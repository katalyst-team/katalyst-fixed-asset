import { GetNotificationsParams, GetNotificationsResponse } from "@/types/notification";

import fetcher, { ApiResponse } from "..";

export type { GetNotificationsParams, GetNotificationsResponse };

export const getNotificationsService = async ({
  userId,
  unread_only = false,
  limit = 10,
}: GetNotificationsParams): Promise<ApiResponse<GetNotificationsResponse>> => {
  const queryParams = new URLSearchParams();
  if (unread_only) queryParams.append("unread_only", "true");
  if (limit) queryParams.append("limit", limit.toString());

  return fetcher({
    method: "GET",
    url: `/v1/users/${userId}/notifications?${queryParams.toString()}`,
  });
};

export const markNotificationAsReadService = async ({
  userId,
  notificationId,
}: {
  userId: string;
  notificationId: string;
}): Promise<ApiResponse<null>> => {
  return fetcher({
    method: "PATCH",
    url: `/v1/users/${userId}/notifications/${notificationId}/read`,
  });
};

export const deleteNotificationService = async ({
  userId,
  notificationId,
}: {
  userId: string;
  notificationId: string;
}): Promise<ApiResponse<null>> => {
  return fetcher({
    method: "DELETE",
    url: `/v1/users/${userId}/notifications/${notificationId}`,
  });
};
