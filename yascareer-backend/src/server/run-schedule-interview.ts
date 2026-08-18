import type { Application, Offer, User } from "@prisma/client";
import { prisma } from "@/server/db";
import { ApplicationStatusService } from "@/server/services/application-status";
import { NotificationService } from "@/server/services/notification";
import { MailService } from "@/server/services/mail";

export type ScheduleInterviewInput = {
  supervisorId?: number;
  scheduledAt: string;
  durationMinutes: number;
  mode: "presentiel" | "distanciel";
  location?: string;
  meetingLink?: string;
  notes?: string;
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} à ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Programme (ou reprogramme) un entretien pour une candidature — logique
 * partagée entre la programmation individuelle (POST /interviews) et la
 * confirmation d'un planning généré en masse, pour ne jamais dupliquer ce
 * comportement (upsert, transition de statut forcée, notifications/emails).
 */
export async function scheduleInterview(
  application: Application & { user: User; offer: Offer },
  payload: ScheduleInterviewInput,
  actor: User
) {
  const existing = await prisma.interview.findUnique({
    where: { applicationId: application.id },
  });
  const wasUpdate = Boolean(existing);

  const data = {
    scheduledAt: new Date(payload.scheduledAt),
    durationMinutes: payload.durationMinutes,
    supervisorId: payload.supervisorId || null,
    mode: payload.mode,
    location: payload.mode === "presentiel" ? payload.location || null : null,
    meetingLink: payload.mode === "distanciel" ? payload.meetingLink || null : null,
    notes: payload.notes || null,
    status: "planifie" as const,
  };

  await prisma.interview.upsert({
    where: { applicationId: application.id },
    create: { applicationId: application.id, ...data },
    update: data,
  });

  if (application.status !== "entretien_programme") {
    try {
      await ApplicationStatusService.changeStatus(
        application,
        "entretien_programme",
        actor,
        { force: true, silent: true }
      );
    } catch {
      // ignore invalid transition — force handles admin path
    }
  }

  const when = formatWhen(payload.scheduledAt);
  const supervisor = payload.supervisorId
    ? await prisma.user.findUnique({ where: { id: payload.supervisorId } })
    : null;
  const action = wasUpdate ? "modifié" : "programmé";

  await NotificationService.notify(
    application.userId,
    "interview",
    `Entretien ${action} pour « ${application.offer.title} » le ${when}${payload.mode === "distanciel" ? " (distanciel)" : " (présentiel)"}.`
  );
  MailService.sendInterviewEmail(application.user, application.offer.title, when, {
    mode: payload.mode,
    durationMinutes: payload.durationMinutes,
    location: data.location,
    meetingLink: data.meetingLink,
    supervisorName: supervisor?.fullName || supervisor?.email || null,
    isReschedule: wasUpdate,
  });
  if (supervisor) {
    await NotificationService.notify(
      supervisor.id,
      "interview",
      `Entretien ${action} le ${when} avec ${application.user.fullName || application.user.email} — « ${application.offer.title} ».`
    );
    MailService.sendInterviewEmail(supervisor, application.offer.title, when, {
      mode: payload.mode,
      durationMinutes: payload.durationMinutes,
      location: data.location,
      meetingLink: data.meetingLink,
      isReschedule: wasUpdate,
    });
  }

  return { wasUpdate, when };
}
