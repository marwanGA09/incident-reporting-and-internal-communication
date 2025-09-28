'use client';
import { create } from 'zustand';
import { Notification } from '@prisma/client';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (url: string) => void;
  getUnreadCountByUrl: (url: string) => number;
  getUnreadCountByBaseUrl: (baseUrl: string) => number;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => {
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  },
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
  markAsRead: (url: string) => {
    set((state) => {
      const newNotifications = state.notifications.map((n) =>
        n.url === url && !n.isRead ? { ...n, isRead: true } : n
      );
      return {
        notifications: newNotifications,
        unreadCount: newNotifications.filter((n) => !n.isRead).length,
      };
    });
  },
  getUnreadCountByUrl: (url) => {
    return get().notifications.filter((n) => n.url === url && !n.isRead).length;
  },
  getUnreadCountByBaseUrl: (baseUrl) => {
    return get().notifications.filter(
      (n) => n.url?.startsWith(baseUrl) && !n.isRead
    ).length;
  },
}));
