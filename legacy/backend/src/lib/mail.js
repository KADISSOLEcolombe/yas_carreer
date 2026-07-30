'use strict';

const nodemailer = require('nodemailer');

let transporter = null;

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

function getTransporter() {
  if (!isSmtpConfigured()) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
  return transporter;
}

function wrapHtml(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;padding:24px;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#00377D;padding:20px 24px;">
      <p style="margin:0;color:#FFD100;font-size:20px;font-weight:bold;">YAS Togo</p>
    </div>
    <div style="padding:24px;">
      <h1 style="margin:0 0 16px;font-size:18px;color:#00377D;">${title}</h1>
      ${bodyHtml}
      <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">
        Cet e-mail a été envoyé automatiquement par la plateforme YAS Career.
      </p>
    </div>
  </div>
</body>
</html>`;
}

async function sendMail({ to, subject, html, text }) {
  if (!to) return { sent: false, reason: 'no_recipient' };

  const transport = getTransporter();
  if (!transport) {
    console.log(`[mail:skip] SMTP non configuré — à: ${to} | ${subject}`);
    if (text) console.log(`[mail:body] ${text}`);
    return { sent: false, reason: 'smtp_not_configured' };
  }

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      text: text || subject,
    });
    return { sent: true };
  } catch (err) {
    console.error('[mail:error]', err.message || err);
    return { sent: false, reason: 'send_failed' };
  }
}

async function sendWelcomeEmail({ to, prenom, nom }) {
  const subject = 'Bienvenue sur YAS Career';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const html = wrapHtml(
    'Bienvenue sur YAS Career',
    `<p>Bonjour ${prenom || ''} ${nom || ''},</p>
     <p>Votre compte candidat a été créé avec succès. Vous pouvez dès maintenant consulter les offres et postuler en ligne.</p>
     <p><a href="${frontendUrl}/offres" style="display:inline-block;margin-top:12px;padding:10px 16px;background:#FFD100;color:#00377D;text-decoration:none;border-radius:8px;font-weight:bold;">Voir les offres</a></p>`
  );
  return sendMail({
    to,
    subject,
    html,
    text: `Bienvenue ${prenom || ''} ${nom || ''} sur YAS Career. Consultez les offres : ${frontendUrl}/offres`,
  });
}

async function sendCandidatureConfirmationEmail({ to, prenom, nom, titreOffre }) {
  const subject = `Candidature reçue — ${titreOffre}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const html = wrapHtml(
    'Candidature bien reçue',
    `<p>Bonjour ${prenom || ''} ${nom || ''},</p>
     <p>Nous avons bien reçu votre candidature pour l'offre <strong>${titreOffre}</strong>.</p>
     <p>Vous pouvez suivre l'avancement de votre dossier depuis votre espace candidat.</p>
     <p><a href="${frontendUrl}/profil" style="display:inline-block;margin-top:12px;padding:10px 16px;background:#FFD100;color:#00377D;text-decoration:none;border-radius:8px;font-weight:bold;">Suivre ma candidature</a></p>`
  );
  return sendMail({
    to,
    subject,
    html,
    text: `Candidature reçue pour ${titreOffre}. Suivi : ${frontendUrl}/profil`,
  });
}

async function sendStatutCandidatureEmail({ to, prenom, nom, titreOffre, statut, contenu }) {
  const labels = {
    EN_ATTENTE: 'En attente',
    EN_EXAMEN: "En cours d'examen",
    ENTRETIEN: 'Entretien',
    ACCEPTEE: 'Acceptée',
    REJETEE: 'Non retenue',
  };
  const label = labels[statut] || statut;
  const subject = `YAS Togo — Candidature ${label} : ${titreOffre}`;
  const html = wrapHtml(
    subject,
    `<p>Bonjour ${prenom || ''} ${nom || ''},</p>
     <p>${contenu}</p>
     <p><strong>Offre :</strong> ${titreOffre}<br/><strong>Nouveau statut :</strong> ${label}</p>`
  );
  return sendMail({ to, subject, html, text: contenu });
}

async function sendEntretienEmail({
  to,
  prenom,
  nom,
  titreOffre,
  dateLabel,
  typeLabel,
  subject,
  contenu,
  lienMeeting,
  plateforme,
}) {
  const meetingBlock =
    lienMeeting
      ? `<p style="margin-top:16px;padding:12px;background:#f0f7ff;border-radius:8px;border:1px solid #dbeafe;">
           <strong>Lien ${plateforme || 'visioconférence'} :</strong><br/>
           <a href="${lienMeeting}" style="color:#00377D;word-break:break-all;">${lienMeeting}</a>
         </p>`
      : '';
  const html = wrapHtml(
    subject,
    `<p>Bonjour ${prenom || ''} ${nom || ''},</p>
     <p>${contenu}</p>
     <p><strong>Offre :</strong> ${titreOffre}<br/>
     <strong>Date :</strong> ${dateLabel || '—'}<br/>
     <strong>Type :</strong> ${typeLabel || '—'}</p>
     ${meetingBlock}`
  );
  const text = `${contenu}${lienMeeting ? ` Lien : ${lienMeeting}` : ''}`;
  return sendMail({ to, subject, html, text });
}

async function sendAffectationEmail({ to, prenom, nom, sujet, role, dateDebut, dateFin }) {
  const subject =
    role === 'superviseur'
      ? `YAS Togo — Nouvelle personne à suivre : ${sujet}`
      : `YAS Togo — Affectation confirmée : ${sujet}`;
  const intro =
    role === 'superviseur'
      ? `Une nouvelle affectation vous a été confiée pour le suivi de stage / emploi.`
      : `Votre affectation a été créée. Un superviseur pourra suivre votre parcours.`;
  const html = wrapHtml(
    subject,
    `<p>Bonjour ${prenom || ''} ${nom || ''},</p>
     <p>${intro}</p>
     <p><strong>Sujet :</strong> ${sujet}<br/>
     <strong>Période :</strong> ${dateDebut || '—'} → ${dateFin || '—'}</p>`
  );
  return sendMail({ to, subject, html, text: intro });
}

module.exports = {
  sendMail,
  sendWelcomeEmail,
  sendCandidatureConfirmationEmail,
  sendStatutCandidatureEmail,
  sendEntretienEmail,
  sendAffectationEmail,
  isSmtpConfigured,
};
