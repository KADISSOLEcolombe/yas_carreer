export type NotificationType = 'APPLICATION' | 'INTERVIEW' | 'STATUS' | 'GENERAL';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'yas_notifications';

export function getNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function getNotificationsForUser(userId: string): Notification[] {
  return getNotifications()
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function sendNotification(
  data: Omit<Notification, 'id' | 'read' | 'createdAt'>
): Notification {
  const notification: Notification = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    read: false,
    createdAt: new Date().toISOString(),
  };
  const notifications = getNotifications();
  notifications.push(notification);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  return notification;
}

export function markAsRead(id: string): void {
  const notifications = getNotifications();
  const index = notifications.findIndex((n) => n.id === id);
  if (index !== -1) {
    notifications[index].read = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }
}

export function getUnreadCount(userId: string): number {
  return getNotificationsForUser(userId).filter((n) => !n.read).length;
}
