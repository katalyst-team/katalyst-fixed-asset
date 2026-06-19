"use client";

import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { AlertCircle, Bell, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import { useDeleteNotificationMutation, useGetNotificationsQuery, useMarkNotificationAsReadMutation } from "@/hooks/api/notification/useNotificationsQuery";
import { type NotificationItemType } from "@/types/notification";

export default function NotificationPopover() {
  const { t } = useTranslation("common");
  const { tokenPayload } = useUser();
  const [isOpen, setIsOpen] = React.useState(false);

  const { data: notificationsData, isLoading, refetch } = useGetNotificationsQuery({
    limit: 10,
    unreadOnly: false,
    userId: tokenPayload?.account_id ?? "",
  });

  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const deleteMutation = useDeleteNotificationMutation();

  const unreadCount = notificationsData?.data?.notifications.filter((n: NotificationItemType) => !n.is_read).length ?? 0;

  const markAllAsRead = async () => {
    const unreadNotifications = notificationsData?.data?.notifications.filter((n: NotificationItemType) => !n.is_read) ?? [];
    await Promise.all(
      unreadNotifications.map((notification: NotificationItemType) =>
        markAsReadMutation.mutateAsync({
          notificationId: notification.id,
          userId: tokenPayload?.account_id ?? "",
        })
      )
    );
    refetch();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsReadMutation.mutateAsync({
      notificationId,
      userId: tokenPayload?.account_id ?? "",
    });
    refetch();
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteMutation.mutateAsync({
      notificationId,
      userId: tokenPayload?.account_id ?? "",
    });
    refetch();
  };

  const getNotificationIcon = (type: NotificationItemType["type"]) => {
    switch (type) {
      case "danger":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "info":
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationTypeLabel = (type: NotificationItemType["type"]) => {
    switch (type) {
      case "danger":
        return "Error";
      case "warning":
        return "Peringatan";
      case "success":
        return "Berhasil";
      case "info":
      default:
        return "Informasi";
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: id,
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className="relative rounded-full" size="icon" variant="outline">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white grid place-items-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 max-h-[500px] overflow-hidden">
        <Card className="border-0 rounded-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{t("notification.title")}</CardTitle>
                <CardDescription>
                  {unreadCount > 0
                    ? t("notification.unreadMessages", { count: unreadCount })
                    : t("notification.noUnreadMessages")}
                </CardDescription>
              </div>
              {unreadCount > 0 && (
                <Button
                  className="h-8 text-xs"
                  size="sm"
                  variant="ghost"
                  onClick={markAllAsRead}
                >
                  {t("notification.markAllAsRead")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 overflow-y-auto max-h-[350px] px-0">
            {isLoading ? (
              <div className="flex flex-col gap-3 p-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notificationsData?.data?.notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  {t("notification.noNotifications")}
                </p>
              </div>
            ) : (
              notificationsData?.data?.notifications.map((notification: NotificationItemType) => (
                <button
                  key={notification.id}
                  className={`w-full text-left p-3 hover:bg-muted transition-colors relative group ${
                    !notification.is_read ? "bg-muted/50" : ""
                  }`}
                  type="button"
                  onClick={() => {
                    if (!notification.is_read) {
                      handleMarkAsRead(notification.id);
                    }
                    if (notification.action_url) {
                      window.location.href = notification.action_url;
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              {getNotificationTypeLabel(notification.type)}
                            </span>
                            {!notification.is_read && (
                              <span className="h-2 w-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                          <p className="text-sm font-medium leading-none mb-1">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          {notification.count && notification.count > 1 && (
                            <span className="text-xs text-muted-foreground mt-1 inline-block">
                              +{notification.count - 1} lainnya
                            </span>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                        <Button
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          size="icon"
                          variant="ghost"
                          onClick={(e) => handleDelete(notification.id, e)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
