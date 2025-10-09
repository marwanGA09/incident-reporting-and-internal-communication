import { getNotifications } from "@/app/lib/actions";
import { NotificationBellClient } from "./NotificationBellClient";
import logger from "@/app/lib/logger";

export async function NotificationBell() {
  const { notifications, unreadCount, error } = await getNotifications();

  if (error) {
    logger.error({ error }, "Failed to fetch notifications for bell:");
    return null;
  }

  return (
    <div className="h-full">
      <NotificationBellClient
        initialNotifications={notifications}
        initialUnreadCount={unreadCount}
      />
    </div>
  );
}
