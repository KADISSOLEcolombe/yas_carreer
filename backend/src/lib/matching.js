// Calcule un score de compatibilité entre un candidat et une offre.
// Basé sur des règles simples : compétences communes (80% du score) + localisation (20%).

function normaliser(valeur) {
  return valeur
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // retire les accents (Lomé -> lome)
}

function parseCompetences(valeur) {
  if (!valeur) return [];
  return valeur
    .split(',')
    .map((s) => normaliser(s))
    .filter(Boolean);
}

function calculerScore({ competencesCandidat, competencesOffre, villeCandidat, localisationOffre }) {
  const competencesOffreListe = parseCompetences(competencesOffre);

  // Sans compétences renseignées sur l'offre, impossible de comparer
  if (competencesOffreListe.length === 0) {
    return null;
  }

  const competencesCandidatListe = parseCompetences(competencesCandidat);
  const communes = competencesOffreListe.filter((c) => competencesCandidatListe.includes(c));
  const scoreCompetences = (communes.length / competencesOffreListe.length) * 80;

  let scoreLocalisation = 0;
  if (villeCandidat?.trim() && localisationOffre?.trim()) {
    const ville = normaliser(villeCandidat);
    const localisation = normaliser(localisationOffre);
    if (ville === localisation || ville.includes(localisation) || localisation.includes(ville)) {
      scoreLocalisation = 20;
    }
  }

  return Math.round(scoreCompetences + scoreLocalisation);
}

module.exports = { calculerScore, parseCompetences };
