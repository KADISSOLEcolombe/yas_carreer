// Calcule un score de compatibilité entre un candidat et une offre.
// Basé sur des règles : compétences communes (80% du score) + localisation (20%).

function normaliser(valeur) {
  if (!valeur) return '';
  return String(valeur)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function parseCompetences(valeur) {
  if (!valeur) return [];
  return valeur
    .split(',')
    .map((s) => normaliser(s))
    .filter(Boolean);
}

/** Conserve les libellés d'origine pour l'affichage RH. */
function parseCompetencesRaw(valeur) {
  if (!valeur) return [];
  return valeur
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function localisationMatch(villeCandidat, localisationOffre) {
  if (!villeCandidat?.trim() || !localisationOffre?.trim()) return false;
  const ville = normaliser(villeCandidat);
  const localisation = normaliser(localisationOffre);
  return ville === localisation || ville.includes(localisation) || localisation.includes(ville);
}

/**
 * Analyse détaillée pour le triage RH.
 * @returns {{ score: number|null, competencesMatch: string[], competencesManquantes: string[], localisationOk: boolean, detail: string }}
 */
function analyserCorrespondance({ competencesCandidat, competencesOffre, villeCandidat, localisationOffre }) {
  const offreRaw = parseCompetencesRaw(competencesOffre);
  const offreNorm = offreRaw.map(normaliser);
  const candidatNorm = parseCompetences(competencesCandidat);

  if (offreNorm.length === 0) {
    return {
      score: null,
      competencesMatch: [],
      competencesManquantes: [],
      localisationOk: localisationMatch(villeCandidat, localisationOffre),
      detail: "L'offre n'a pas de compétences renseignées — score indisponible.",
    };
  }

  const competencesMatch = [];
  const competencesManquantes = [];
  offreRaw.forEach((label, i) => {
    if (candidatNorm.includes(offreNorm[i])) competencesMatch.push(label);
    else competencesManquantes.push(label);
  });

  const scoreCompetences = (competencesMatch.length / offreNorm.length) * 80;
  const localisationOk = localisationMatch(villeCandidat, localisationOffre);
  const scoreLocalisation = localisationOk ? 20 : 0;
  const score = Math.round(scoreCompetences + scoreLocalisation);

  const parts = [
    `${competencesMatch.length}/${offreNorm.length} compétence(s) en commun`,
    localisationOk ? 'localisation correspondante (+20)' : 'localisation non correspondante',
  ];

  return {
    score,
    competencesMatch,
    competencesManquantes,
    localisationOk,
    detail: parts.join(' · '),
  };
}

function calculerScore(params) {
  return analyserCorrespondance(params).score;
}

module.exports = {
  calculerScore,
  analyserCorrespondance,
  parseCompetences,
  normaliser,
};
