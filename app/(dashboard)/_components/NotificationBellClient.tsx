'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { BellIcon, CheckCircle, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { Notification } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBellClient({
  initialNotifications,
  initialUnreadCount,
}: {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {initialUnreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {initialUnreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-96">
          {initialNotifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              You have no new notifications.
            </p>
          ) : (
            initialNotifications.map((notif) => (
              <DropdownMenuItem key={notif.id} asChild>
                <Link
                  href={notif.url || '#'}
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
