import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  markAsRead: (id) => set((state) => {
    const updated = state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    return { notifications: updated, unreadCount: updated.filter(n => !n.isRead).length };
  }),
  clearAll: () => set({ notifications: [], unreadCount: 0 })
}));
