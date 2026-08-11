import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { User } from "@prisma/client";
import { env } from "@/server/env";

/**
 * Real SMTP mailer (Gmail-compatible). Same public interface as the previous
 * stub — every method stays synchronous/void from the caller's point of view
 * (fire-and-forget, never throws) so no call site needs to change.
 */
function enabled(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USERNAME && env.SMTP_PASSWORD);
}

let transporter: Transporter | null = null;
function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      // 465 = TLS implicite ; 587 (Gmail) = STARTTLS négocié après connexion.
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USERNAME,
        pass: env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!enabled()) {
    console.info(`[mail:skip] SMTP non configuré → ${subject} (${to})`);
    return;
  }
  try {
    await getTransporter().sendMail({ from: env.SMTP_FROM, to, subject, html });
    console.info(`[mail:sent] ${subject} → ${to}`);
  } catch (error) {
    const err = error as {
      code?: string;
      command?: string;
      response?: string;
      message?: string;
    };
    console.error(
      `[mail:error] ${subject} → ${to} — code=${err.code ?? "?"} command=${err.command ?? "?"} ${
        err.response ?? err.message ?? "erreur inconnue"
      }`
    );
  }
}

function wrap(title: string, bodyHtml: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f5f7fa;padding:32px 0">
    <table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr><td style="background:#00377D;padding:20px 28px">
        <span style="color:#FFD100;font-weight:700;font-size:18px">YasCareer</span>
        <span style="color:#ffffff;opacity:.7;font-size:12px;margin-left:8px">Yas Togo</span>
      </td></tr>
      <tr><td style="padding:28px">
        <h1 style="font-size:18px;color:#00377D;margin:0 0 14px">${title}</h1>
        <div style="font-size:14px;line-height:1.6;color:#1e293b">${bodyHtml}</div>
      </td></tr>
      <tr><td style="padding:16px 28px;background:#f8fafc;font-size:11px;color:#94a3b8">
        YasCareer — plateforme de recrutement Yas Togo
      </td></tr>
    </table>
  </div>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:20px 0"><a href="${href}" style="background:#FFD100;color:#00377D;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">${label}</a></p>`;
}

export const MailService = {
  sendStaffInviteEmail(user: User, tempPassword: string, roleLabel: string) {
    const loginUrl = `${env.FRONTEND_URL.replace(/\/$/, "")}/login`;
    void send(
      user.email,
      `Invitation ${roleLabel} — YasCareer`,
      wrap(
        `Bienvenue sur YasCareer, ${user.fullName || ""}`,
        `<p>Un compte <strong>${roleLabel}</strong> a été créé pour vous.</p>
         <table style="margin:14px 0">
           <tr><td style="padding:8px 14px;color:#64748b">Email</td><td style="padding:8px 14px;font-weight:600">${user.email}</td></tr>
           <tr><td style="padding:8px 14px;color:#64748b">Mot de passe temporaire</td><td style="padding:8px 14px;font-family:monospace;font-weight:700">${tempPassword}</td></tr>
         </table>
         <p><strong>Important :</strong> vous devrez définir un nouveau mot de passe à la première connexion.</p>
         ${button(loginUrl, "Se connecter")}`
      )
    );
  },

  sendAvailabilityRequestEmail(supervisor: User, candidateName: string, offerTitle: string) {
    const url = `${env.FRONTEND_URL.replace(/\/$/, "")}/superviseur/disponibilites`;
    void send(
      supervisor.email,
      `Disponibilité demandée — entretien avec ${candidateName}`,
      wrap(
        "Demande de disponibilité",
        `<p>Bonjour ${supervisor.fullName || ""},</p>
         <p>Le RH souhaite organiser un entretien avec <strong>${candidateName}</strong> pour « ${offerTitle} » et vous sollicite comme superviseur.</p>
         ${button(url, "Répondre à la demande")}`
      )
    );
  },

  sendApplicationConfirmationEmail(user: User, offerTitle: string) {
    void send(
      user.email,
      "Candidature reçue — YasCareer",
      wrap(
        "Candidature confirmée",
        `<p>Bonjour ${user.fullName || ""},</p><p>Nous avons bien reçu votre candidature pour <strong>${offerTitle}</strong>.</p>`
      )
    );
  },

  sendApplicationStatusEmail(user: User, offerTitle: string, statusLabel: string) {
    void send(
      user.email,
      `Mise à jour candidature — ${statusLabel}`,
      wrap(
        "Statut mis à jour",
        `<p>Bonjour ${user.fullName || ""},</p><p>Votre candidature pour <strong>${offerTitle}</strong> est maintenant : <strong>${statusLabel}</strong>.</p>`
      )
    );
  },

  sendInterviewEmail(
    user: User,
    offerTitle: string,
    when: string,
    options: {
      mode: string;
      durationMinutes: number;
      location?: string | null;
      meetingLink?: string | null;
      supervisorName?: string | null;
      isReschedule?: boolean;
    }
  ) {
    const { mode, durationMinutes, location, meetingLink, supervisorName, isReschedule } =
      options;
    const modeLabel = mode === "presentiel" ? "Présentiel" : "Visioconférence";
    const title = isReschedule ? "Entretien modifié" : "Entretien programmé";
    void send(
      user.email,
      `${title} — ${offerTitle}`,
      wrap(
        title,
        `<p>Bonjour ${user.fullName || ""},</p>
         <p>Votre entretien pour <strong>${offerTitle}</strong> est ${isReschedule ? "désormais programmé" : "programmé"} :</p>
         <table style="margin:14px 0">
           <tr><td style="padding:6px 14px;color:#64748b">Date</td><td style="padding:6px 14px;font-weight:600">${when}</td></tr>
           <tr><td style="padding:6px 14px;color:#64748b">Durée</td><td style="padding:6px 14px;font-weight:600">${durationMinutes} minutes</td></tr>
           <tr><td style="padding:6px 14px;color:#64748b">Type</td><td style="padding:6px 14px;font-weight:600">${modeLabel}</td></tr>
           ${location ? `<tr><td style="padding:6px 14px;color:#64748b">Lieu</td><td style="padding:6px 14px;font-weight:600">${location}</td></tr>` : ""}
           ${supervisorName ? `<tr><td style="padding:6px 14px;color:#64748b">Interlocuteur</td><td style="padding:6px 14px;font-weight:600">${supervisorName}</td></tr>` : ""}
         </table>
         ${
           meetingLink
             ? `<p>Rejoignez la réunion via le lien ci-dessous à l'heure indiquée :</p>${button(meetingLink, "Rejoindre l'entretien")}`
             : ""
         }`
      )
    );
  },

  sendInterviewCancelledEmail(user: User, offerTitle: string, when: string) {
    void send(
      user.email,
      `Entretien annulé — ${offerTitle}`,
      wrap(
        "Entretien annulé",
        `<p>Bonjour ${user.fullName || ""},</p>
         <p>Votre entretien du <strong>${when}</strong> pour <strong>${offerTitle}</strong> a été annulé.</p>
         <p>L'équipe RH reviendra vers vous si un nouveau créneau est proposé.</p>`
      )
    );
  },

  sendNewApplicationStaffEmail(staff: { email: string; fullName: string | null }, candidateName: string, offerTitle: string) {
    void send(
      staff.email,
      `Nouvelle candidature — « ${offerTitle} »`,
      wrap(
        "Nouvelle candidature reçue",
        `<p>Bonjour ${staff.fullName || ""},</p>
         <p><strong>${candidateName}</strong> vient de postuler pour <strong>${offerTitle}</strong>.</p>`
      )
    );
  },

  sendAvailabilityResponseEmail(
    rhUser: { email: string; fullName: string | null },
    supervisorName: string,
    offerTitle: string,
    status: "disponible" | "indisponible"
  ) {
    void send(
      rhUser.email,
      `Réponse de disponibilité — ${supervisorName}`,
      wrap(
        "Réponse à une demande de disponibilité",
        `<p>Bonjour ${rhUser.fullName || ""},</p>
         <p><strong>${supervisorName}</strong> a répondu <strong>${
           status === "disponible" ? "disponible" : "indisponible"
         }</strong> pour l'entretien concernant <strong>${offerTitle}</strong>.</p>`
      )
    );
  },

  sendEmploiAssignedEmail(
    supervisor: User,
    candidateName: string,
    contractType: string,
    offerTitle: string
  ) {
    void send(
      supervisor.email,
      `Nouveau suivi — ${candidateName}`,
      wrap(
        "Nouvelle affectation de suivi",
        `<p>Bonjour ${supervisor.fullName || ""},</p>
         <p><strong>${candidateName}</strong> vous est affecté(e) en suivi (${contractType}) suite à son recrutement pour <strong>${offerTitle}</strong>.</p>`
      )
    );
  },

  sendSupervisionNoteEmail(
    recipient: { email: string; fullName: string | null },
    authorName: string,
    typeLabel: string,
    collaboratorName: string
  ) {
    void send(
      recipient.email,
      `Nouveau suivi — ${collaboratorName}`,
      wrap(
        "Nouvelle entrée de suivi",
        `<p>Bonjour ${recipient.fullName || ""},</p>
         <p><strong>${authorName}</strong> a ajouté ${typeLabel === "Évaluation" ? "une" : "un"} <strong>${typeLabel.toLowerCase()}</strong> concernant <strong>${collaboratorName}</strong>.</p>`
      )
    );
  },

  sendCandidateSelectionEmail(input: {
    user: User;
    offerTitle: string;
    [key: string]: unknown;
  }) {
    const {
      user,
      offerTitle,
      offerLocation,
      offerDeadline,
      statusLabel,
      interviewMode,
      interviewMeetingLink,
      interviewNotes,
      customMessage,
    } = input as {
      user: User;
      offerTitle: string;
      offerLocation?: string | null;
      offerDeadline?: string | null;
      statusLabel?: string;
      interviewMode?: string | null;
      interviewMeetingLink?: string | null;
      interviewNotes?: string | null;
      customMessage?: string | null;
    };
    void send(
      user.email,
      `À propos de « ${offerTitle} »`,
      wrap(
        "Message de l'équipe RH",
        `<p>Bonjour ${user.fullName || ""},</p>
         <p>Concernant votre candidature pour <strong>${offerTitle}</strong>${
           offerLocation ? ` (${offerLocation})` : ""
         } :</p>
         ${statusLabel ? `<p>Statut : <strong>${statusLabel}</strong></p>` : ""}
         ${offerDeadline ? `<p>Date limite : ${offerDeadline}</p>` : ""}
         ${interviewMode ? `<p>Entretien : ${interviewMode}</p>` : ""}
         ${interviewMeetingLink ? button(interviewMeetingLink, "Lien de l'entretien") : ""}
         ${interviewNotes ? `<p>${interviewNotes}</p>` : ""}
         ${customMessage ? `<p>${customMessage}</p>` : ""}`
      )
    );
  },
};
