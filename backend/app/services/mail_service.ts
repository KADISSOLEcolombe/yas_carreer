import logger from '@adonisjs/core/services/logger'
import env from '#start/env'
import type User from '#models/user'

/**
 * Lightweight mailer: logs in development when SMTP is not configured.
 * Wire a real SMTP transport later via Adonis Mail / Nodemailer.
 */
export default class MailService {
  private static enabled() {
    return Boolean(env.get('SMTP_HOST'))
  }

  private static frontendBase() {
    return (env.get('FRONTEND_URL') || 'http://localhost:3000').replace(/\/$/, '')
  }

  private static logoUrl() {
    return `${this.frontendBase()}/logo_yas.png`
  }

  private static siteUrl() {
    return this.frontendBase()
  }

  private static async send(to: string, subject: string, html: string) {
    if (!this.enabled()) {
      logger.info({ to, subject }, '[mail:skip] SMTP non configuré')
      return
    }

    // Placeholder until @adonisjs/mail is configured
    logger.info({ to, subject, htmlLength: html.length }, '[mail:queued]')
  }

  private static wrap(title: string, body: string) {
    const logo = this.logoUrl()
    const site = this.siteUrl()
    const year = new Date().getFullYear()

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${title} — YasCareer</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef2f7;padding:28px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,55,125,0.08)">
          <!-- Header -->
          <tr>
            <td style="background:#00377D;padding:0">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:20px 24px 16px 24px">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:14px">
                          <a href="${site}" style="text-decoration:none">
                            <img src="${logo}" width="48" height="48" alt="Yas" style="display:block;border:0;width:48px;height:48px;border-radius:8px" />
                          </a>
                        </td>
                        <td style="vertical-align:middle">
                          <a href="${site}" style="text-decoration:none;color:#ffffff">
                            <div style="font-size:20px;font-weight:700;letter-spacing:-0.02em;line-height:1.2;color:#ffffff">YasCareer</div>
                            <div style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#5F99D2;margin-top:3px">Yas Togo</div>
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="height:4px;background:#FFD100;font-size:0;line-height:0">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 24px 8px 24px;color:#1a1a1a">
              <h1 style="font-size:18px;margin:0 0 16px 0;color:#00377D;font-weight:700;line-height:1.35">${title}</h1>
              <div style="font-size:15px;line-height:1.6;color:#333333">${body}</div>
            </td>
          </tr>

          <!-- CTA espace candidat -->
          <tr>
            <td style="padding:8px 24px 28px 24px">
              <a href="${site}/login" style="display:inline-block;background:#FFD100;color:#00377D;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
                Accéder à YasCareer
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f7f9fc;border-top:1px solid #e6ebf2;padding:20px 24px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;width:36px">
                    <img src="${logo}" width="32" height="32" alt="" style="display:block;border:0;width:32px;height:32px" />
                  </td>
                  <td style="vertical-align:middle">
                    <div style="font-size:13px;font-weight:700;color:#00377D">YasCareer — Yas Togo</div>
                    <div style="font-size:12px;color:#6b7c93;margin-top:2px;line-height:1.45">
                      Plateforme de recrutement · Let’s grow together
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:14px;font-size:11px;color:#9aa8bc;line-height:1.5">
                    © ${year} Yas Togo · Cet email a été envoyé automatiquement depuis YasCareer.<br />
                    <a href="${site}" style="color:#5F99D2;text-decoration:none">${site.replace(/^https?:\/\//, '')}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  }

  static async sendWelcomeEmail(user: User) {
    await this.send(
      user.email,
      'Bienvenue sur YasCareer',
      this.wrap(
        'Bienvenue !',
        `<p>Bonjour ${user.fullName || ''},</p><p>Votre compte candidat YasCareer est prêt. Consultez les offres et postulez en ligne.</p>`
      )
    )
  }

  /** Invitation RH / admin créée par le super-administrateur. */
  static async sendStaffInviteEmail(
    user: User,
    temporaryPassword: string,
    roleLabel: string
  ) {
    const loginUrl = `${this.frontendBase()}/login`
    await this.send(
      user.email,
      'Vos accès YasCareer — Yas Togo',
      this.wrap(
        'Bienvenue dans l’équipe YasCareer',
        `<p>Bonjour ${user.fullName || ''},</p>
         <p>Un compte <strong>${roleLabel}</strong> a été créé pour vous sur YasCareer.</p>
         <table role="presentation" style="width:100%;margin:16px 0;background:#f7f9fc;border-radius:8px">
           <tr><td style="padding:10px 14px;color:#6b7c93">Email</td><td style="padding:10px 14px;font-weight:600">${user.email}</td></tr>
           <tr><td style="padding:10px 14px;color:#6b7c93">Mot de passe temporaire</td><td style="padding:10px 14px;font-weight:700;font-family:monospace;letter-spacing:0.04em">${temporaryPassword}</td></tr>
         </table>
         <p><strong>Important :</strong> à votre première connexion, vous devrez obligatoirement définir un nouveau mot de passe.</p>
         <p style="margin:20px 0">
           <a href="${loginUrl}" style="background:#FFD100;color:#00377D;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">Se connecter</a>
         </p>`
      )
    )
  }

  static async sendApplicationConfirmationEmail(user: User, offerTitle: string) {
    await this.send(
      user.email,
      'Candidature reçue — YasCareer',
      this.wrap(
        'Candidature confirmée',
        `<p>Bonjour ${user.fullName || ''},</p><p>Nous avons bien reçu votre candidature pour <strong>${offerTitle}</strong>.</p>`
      )
    )
  }

  static async sendApplicationStatusEmail(user: User, offerTitle: string, statusLabel: string) {
    await this.send(
      user.email,
      `Mise à jour candidature — ${statusLabel}`,
      this.wrap(
        'Statut mis à jour',
        `<p>Bonjour ${user.fullName || ''},</p><p>Votre candidature pour <strong>${offerTitle}</strong> est maintenant : <strong>${statusLabel}</strong>.</p>`
      )
    )
  }

  static async sendInterviewEmail(
    user: User,
    offerTitle: string,
    scheduledAt: string,
    meetingLink: string | null,
    mode: string
  ) {
    const linkBlock = meetingLink
      ? `<p>Lien : <a href="${meetingLink}" style="color:#00377D">${meetingLink}</a></p>`
      : '<p>Le lieu / modalités vous seront communiqués par le RH.</p>'
    await this.send(
      user.email,
      'Convocation entretien — YasCareer',
      this.wrap(
        'Entretien programmé',
        `<p>Bonjour ${user.fullName || ''},</p>
         <p>Un entretien (${mode}) est prévu pour <strong>${offerTitle}</strong> le <strong>${scheduledAt}</strong>.</p>
         ${linkBlock}`
      )
    )
  }

  /**
   * Email RH → candidat sélectionné, avec le détail de la candidature / offre / entretien.
   */
  static async sendCandidateSelectionEmail(input: {
    user: User
    offerTitle: string
    offerType: string
    offerLocation: string | null
    offerDeadline: string | null
    statusLabel: string
    appliedAt: string | null
    interviewScheduledAt: string | null
    interviewMode: string | null
    interviewMeetingLink: string | null
    interviewNotes: string | null
    customMessage?: string | null
  }) {
    const {
      user,
      offerTitle,
      offerType,
      offerLocation,
      offerDeadline,
      statusLabel,
      appliedAt,
      interviewScheduledAt,
      interviewMode,
      interviewMeetingLink,
      interviewNotes,
      customMessage,
    } = input

    const rows: string[] = [
      `<tr><td style="padding:8px 0;color:#6b7c93;width:140px">Offre</td><td style="padding:8px 0;font-weight:600;color:#00377D">${offerTitle}</td></tr>`,
      `<tr><td style="padding:8px 0;color:#6b7c93">Type</td><td style="padding:8px 0">${offerType}</td></tr>`,
    ]
    if (offerLocation) {
      rows.push(
        `<tr><td style="padding:8px 0;color:#6b7c93">Lieu</td><td style="padding:8px 0">${offerLocation}</td></tr>`
      )
    }
    if (offerDeadline) {
      rows.push(
        `<tr><td style="padding:8px 0;color:#6b7c93">Date limite</td><td style="padding:8px 0">${offerDeadline}</td></tr>`
      )
    }
    rows.push(
      `<tr><td style="padding:8px 0;color:#6b7c93">Statut dossier</td><td style="padding:8px 0"><strong style="color:#00377D">${statusLabel}</strong></td></tr>`
    )
    if (appliedAt) {
      rows.push(
        `<tr><td style="padding:8px 0;color:#6b7c93">Candidature du</td><td style="padding:8px 0">${appliedAt}</td></tr>`
      )
    }
    if (interviewScheduledAt) {
      rows.push(
        `<tr><td style="padding:8px 0;color:#6b7c93">Entretien</td><td style="padding:8px 0">${interviewScheduledAt}${interviewMode ? ` (${interviewMode})` : ''}</td></tr>`
      )
      if (interviewMeetingLink) {
        rows.push(
          `<tr><td style="padding:8px 0;color:#6b7c93">Lien / lieu</td><td style="padding:8px 0"><a href="${interviewMeetingLink}" style="color:#00377D">${interviewMeetingLink}</a></td></tr>`
        )
      }
      if (interviewNotes) {
        rows.push(
          `<tr><td style="padding:8px 0;color:#6b7c93">Notes</td><td style="padding:8px 0">${interviewNotes}</td></tr>`
        )
      }
    }

    const messageBlock = customMessage?.trim()
      ? `<div style="margin:16px 0;padding:14px 16px;background:#f3f8fd;border-left:4px solid #5F99D2;border-radius:6px">
           <p style="margin:0 0 6px;font-size:11px;color:#5F99D2;font-weight:700;text-transform:uppercase;letter-spacing:0.06em">Message de l’équipe RH</p>
           <p style="margin:0;white-space:pre-line">${customMessage.trim().replace(/</g, '&lt;')}</p>
         </div>`
      : ''

    await this.send(
      user.email,
      `Information candidature — ${offerTitle}`,
      this.wrap(
        'Informations sur votre candidature',
        `<p>Bonjour ${user.fullName || ''},</p>
         <p>L’équipe RH Yas Togo vous contacte au sujet de votre candidature. Voici le récapitulatif :</p>
         ${messageBlock}
         <table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0;background:#f7f9fc;border-radius:8px;padding:4px 12px">${rows.join('')}</table>
         <p>Connectez-vous à votre espace YasCareer pour suivre l’évolution de votre dossier.</p>
         <p style="margin-top:20px;color:#6b7c93;font-size:13px">— Équipe RH Yas Togo</p>`
      )
    )
  }
}
