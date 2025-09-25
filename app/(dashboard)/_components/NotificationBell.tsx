import { getNotifications } from "@/app/lib/actions";
import { NotificationBellClient } from "./NotificationBellClient";

export async function NotificationBell() {
  const { notifications, unreadCount, error } = await getNotifications();

  if (error) {
    console.error("Failed to fetch notifications for bell:", error);
    return null; 
  }

  return (
    <NotificationBellClient
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
    />
  );
}
