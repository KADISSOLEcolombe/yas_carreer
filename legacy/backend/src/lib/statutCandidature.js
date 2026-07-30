'use strict';

/**
 * Transitions de statut candidature autorisées (RH).
 * ADMIN peut forcer via flag force=true.
 */
const TRANSITIONS = {
  EN_ATTENTE: ['EN_EXAMEN', 'ENTRETIEN', 'REJETEE', 'ACCEPTEE'],
  EN_EXAMEN: ['ENTRETIEN', 'REJETEE', 'ACCEPTEE', 'EN_ATTENTE'],
  ENTRETIEN: ['ACCEPTEE', 'REJETEE', 'EN_EXAMEN'],
  ACCEPTEE: [], // terminal sauf force admin
  REJETEE: [], // terminal sauf force admin
};

function peutChangerStatut(ancien, nouveau, { force = false } = {}) {
  if (ancien === nouveau) return true;
  if (force) return true;
  const allowed = TRANSITIONS[ancien];
  if (!allowed) return false;
  return allowed.includes(nouveau);
}

module.exports = { TRANSITIONS, peutChangerStatut };
