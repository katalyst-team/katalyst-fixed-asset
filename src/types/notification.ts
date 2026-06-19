export interface NotificationItemType {
  id: string;
  type: "warning" | "info" | "success" | "danger";
  title: string;
  message: string;
  count?: number;
  timestamp: string;
  is_read: boolean;
  action_url?: string;
}

export interface GetNotificationsParams {
  userId: string;
  unread_only?: boolean;
  limit?: number;
}

export interface GetNotificationsResponse {
  notifications: NotificationItemType[];
}
