"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { BellIcon, CheckCircle, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Notification } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function NotificationBellClient({
  initialNotifications,
  initialUnreadCount,
}: {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  useEffect(() => {
    const channel = supabase.channel("NOTIFICATION");
    channel
      .on("broadcast", { event: "new-notification" }, (payload) => {
        const newNotification = payload.payload;
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      })
      .subscribe();

    const incidentReadChannel = supabase.channel("INCIDENT_READ_STATUS");
    incidentReadChannel
      .on("broadcast", { event: "incident-read" }, (payload) => {
        const { incidentId } = payload.payload;
        // Assuming the current user is the one who read the incident
        // You might want to pass the current user's ID to this component
        // and check if userId === currentUser.id

        setNotifications((prev) =>
          prev.map((notif) => {
            if (
              notif.type === "INCIDENT" &&
              notif.url === `/incidents/${incidentId}` &&
              !notif.isRead
            ) {
              setUnreadCount((prevCount) => prevCount - 1);
              return { ...notif, isRead: true };
            }
            return notif;
          })
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(incidentReadChannel);
    };
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              You have no new notifications.
            </p>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem key={notif.id} asChild>
                <Link
                  href={notif.url || "#"}
                  className="flex items-start gap-3 p-2"
                >
                  {notif.isRead ? (
                    <CheckCircle className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <p className="text-sm leading-tight whitespace-normal">
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/notifications"
            className="flex items-center justify-center p-2"
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
