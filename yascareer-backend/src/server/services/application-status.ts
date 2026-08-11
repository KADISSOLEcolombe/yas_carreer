import type { Application, User } from "@prisma/client";
import { prisma } from "@/server/db";
import {
  APPLICATION_STATUS_LABELS,
  canTransitionStatus,
  type ApplicationStatus,
} from "@/server/domain";
import { badRequest } from "@/server/http";
import { NotificationService } from "@/server/services/notification";
import { MailService } from "@/server/services/mail";

export const ApplicationStatusService = {
  async changeStatus(
    application: Application,
    nextStatus: ApplicationStatus,
    changedBy: User,
    options: { force?: boolean; silent?: boolean } = {}
  ): Promise<Application> {
    const current = application.status as ApplicationStatus;
    if (
      !canTransitionStatus(
        current,
        nextStatus,
        options.force === true || changedBy.role === "admin"
      )
    ) {
      throw badRequest(`Transition invalide : ${current} → ${nextStatus}`);
    }

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: { status: nextStatus },
    });

    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        status: nextStatus,
        changedBy: changedBy.id,
        changedAt: new Date(),
      },
    });

    if (options.silent) return updated;

    const full = await prisma.application.findUnique({
      where: { id: application.id },
      include: { user: true, offer: true },
    });
    if (!full) return updated;

    const label = APPLICATION_STATUS_LABELS[nextStatus];
    await NotificationService.notify(
      full.userId,
      "application_status",
      `Votre candidature pour « ${full.offer.title} » est maintenant : ${label}.`
    );
    MailService.sendApplicationStatusEmail(full.user, full.offer.title, label);

    return updated;
  },

  async recordInitial(application: Application, userId: number) {
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        status: application.status,
        changedBy: userId,
        changedAt: new Date(),
      },
    });
  },
};
