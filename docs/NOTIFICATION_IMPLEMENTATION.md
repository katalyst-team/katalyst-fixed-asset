# Notification System Implementation

## Overview
Implemented a complete notification system with REST API polling for real-time alerts.

## Components Created

### 1. Types (`src/types/notification.ts`)
```typescript
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
```

### 2. Services (`src/services/notification/getNotificationsService.ts`)
- `getNotificationsService` - Fetch notifications with filters
- `markNotificationAsReadService` - Mark single notification as read
- `deleteNotificationService` - Delete notification

### 3. React Query Hooks (`src/hooks/api/notification/useNotificationsQuery.ts`)
- `useGetNotificationsQuery` - Query hook with 60s polling
- `useMarkNotificationAsReadMutation` - Mark as read mutation
- `useDeleteNotificationMutation` - Delete mutation

### 4. Notification Component (`src/components/layouts/dashboard-layout/Notification.tsx`)

**Features:**
- 📊 Real-time polling every 60 seconds
- 🔔 Unread count badge (shows 9+ if > 9)
- ✅ Mark all as read button
- 🗑️ Delete individual notifications
- 📌 Click to mark as read and navigate to action_url
- 🎨 Type-based icons (danger, warning, success, info)
- ⏰ Relative time display (e.g., "2 menit yang lalu")
- 📱 Responsive design with max-height scrolling
- 💾 Loading skeleton states
- 🈚 Empty state when no notifications

**Notification Types:**
- **Danger** (XCircle icon): Errors, critical issues
- **Warning** (AlertCircle icon): Alerts, warnings
- **Success** (CheckCircle2 icon): Successful operations
- **Info** (Info icon): General information

## API Endpoints Used

```
GET  /v1/users/{user_id}/notifications?unread_only={bool}&limit={number}
PATCH /v1/users/{user_id}/notifications/{notification_id}/read
DELETE /v1/users/{user_id}/notifications/{notification_id}
```

## Translations Added

**Indonesian (`public/locales/id/common.json`):**
```json
{
  "notification": {
    "title": "Notifikasi",
    "unreadMessages": "Anda memiliki {{count}} pesan yang belum dibaca.",
    "markAllAsRead": "Tandai semua telah dibaca",
    "noUnreadMessages": "Tidak ada pesan yang belum dibaca",
    "noNotifications": "Tidak ada notifikasi"
  }
}
```

**English (`public/locales/en/common.json`):**
```json
{
  "notification": {
    "title": "Notification",
    "unreadMessages": "You have {{count}} unread messages.",
    "markAllAsRead": "Mark all as read",
    "noUnreadMessages": "No unread messages",
    "noNotifications": "No notifications"
  }
}
```

## Integration

Already integrated in `DashboardLayout.tsx` (line 40):
```tsx
<div className="flex items-center gap-2 px-6">
  <ColorThemeSwitcher />
  <DensitySwitcher />
  <ThemeSwitcher />
  <NotificationPopover />
</div>
```

## Polling Configuration

- **Interval**: 60 seconds (`refetchInterval: 60000`)
- **Stale Time**: 60 seconds
- **Auto-fetch**: Enabled when user is logged in

## Future Enhancements

1. **WebSocket Integration**: Upgrade from polling to real-time WebSocket
2. **Sound Notifications**: Add optional sound alerts for new notifications
3. **Notification Preferences**: Allow users to customize notification types
4. **Filter by Type**: Add filter dropdown for notification types
5. **Notification Groups**: Group similar notifications together
6. **Desktop Notifications**: Request browser notification permissions

## Testing Checklist

- [x] Notifications fetch correctly from API
- [x] Unread count badge displays correctly
- [x] Mark as read works on individual notifications
- [x] Mark all as read works
- [x] Delete notification works
- [x] Click notification marks as read and navigates
- [x] Polling refreshes notifications every 60s
- [x] Loading state displays correctly
- [x] Empty state displays correctly
- [x] Translations work for both languages
- [x] Responsive design works on mobile
- [x] Linting passes

## Files Created/Modified

**Created:**
- `src/types/notification.ts`
- `src/services/notification/getNotificationsService.ts`
- `src/hooks/api/notification/useNotificationsQuery.ts`

**Modified:**
- `src/components/layouts/dashboard-layout/Notification.tsx` (complete rewrite)
- `public/locales/id/common.json` (added notification translations)
- `public/locales/en/common.json` (added notification translations)

## Dependencies Used

- **date-fns**: For time formatting with Indonesian locale
- **lucide-react**: Icons (Bell, AlertCircle, CheckCircle2, Info, XCircle, X)
- **@tanstack/react-query**: Query and mutation hooks
- Existing UI components (Popover, Button, Card, Skeleton)
