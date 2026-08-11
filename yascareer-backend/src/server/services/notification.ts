import { prisma } from "@/server/db";

export type NotificationType =
  | "new_application"
  | "guest_application"
  | "application_status"
  | "interview"
  | "rh_email"
  | "offer_published"
  | "ai_analysis_ready"
  | "ai_ranking_ready"
  | "account_activated"
  | "availability_request"
  | "availability_response"
  | "emploi_assigned"
  | "supervision_note";

export const NotificationService = {
  notify(userId: number, type: NotificationType | string, content: string) {
    return prisma.notification.create({
      data: { userId, type, content, readAt: null },
    });
  },

  /**
   * Notifies all active RH and admin users (optionally excluding one).
   * Returns the staff records (id/email/fullName) so callers can also email
   * them without re-querying the same list.
   */
  async notifyStaff(
    type: NotificationType | string,
    content: string,
    exceptUserId?: number
  ): Promise<{ id: number; email: string; fullName: string | null }[]> {
    const staff = await prisma.user.findMany({
      where: {
        role: { in: ["rh", "admin"] },
        isActive: true,
        ...(exceptUserId ? { id: { not: exceptUserId } } : {}),
      },
      select: { id: true, email: true, fullName: true },
    });
    await Promise.all(
      staff.map((s) => this.notify(s.id, type, content))
    );
    return staff;
  },

  async markRead(id: number) {
    return prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  },

  async markAllRead(userId: number) {
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  },

  async unreadCount(userId: number): Promise<number> {
    return prisma.notification.count({
      where: { userId, readAt: null },
    });
  },
};
