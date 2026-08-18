import type { Emploi, SupervisionNote } from "./types";

/** Dernière entrée de suivi (rapport/observation, hors évaluation), la plus récente. */
export function lastFollowUp(emploi: Emploi): SupervisionNote | null {
  const notes = (emploi.supervisionNotes ?? []).filter((n) => n.type !== "evaluation");
  return notes[0] ?? null;
}

/** Dernière évaluation enregistrée, la plus récente. */
export function lastEvaluation(emploi: Emploi): SupervisionNote | null {
  const notes = (emploi.supervisionNotes ?? []).filter((n) => n.type === "evaluation");
  return notes[0] ?? null;
}
