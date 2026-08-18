import "dotenv/config";
import { AiService, InvalidCvDocumentError } from "@/server/services/ai";

const GARBAGE_TEXT = `
Rapport trimestriel de ventes — Yas Togo

Ce document présente les résultats commerciaux du dernier trimestre.
Le chiffre d'affaires a progressé de 12% par rapport à la période précédente.
Les ventes de forfaits mobiles ont été particulièrement dynamiques dans la
région de Lomé, tandis que la zone des Savanes a connu une légère baisse.
Nous recommandons de renforcer les actions commerciales au prochain trimestre
et de suivre de près l'évolution de la concurrence sur le marché télécom.
`.repeat(2);

const REAL_CV_TEXT = `
Afi KOFFI
Email: afi.koffi@example.tg — Téléphone: +228 90 11 22 33

Profil
Développeuse web junior passionnée par le digital.

Formation
2023-2024 — Licence Informatique, Université de Lomé

Expérience professionnelle
2024 — Stage développement web, Yas Togo — React, Node.js

Compétences
JavaScript, React, Git, Communication

Langues
Français (natif), Anglais (intermédiaire)
`;

async function main() {
  console.log("--- extractCv sur texte non-CV (attendu: rejet) ---");
  try {
    await AiService.extractCv(GARBAGE_TEXT);
    console.log("FAIL: aucune erreur levée");
  } catch (e) {
    if (e instanceof InvalidCvDocumentError) {
      console.log("OK: InvalidCvDocumentError —", e.message);
    } else {
      console.log("FAIL: mauvaise erreur —", e);
    }
  }

  console.log("\n--- extractCv sur texte CV réel (attendu: extraction OK) ---");
  try {
    const result = await AiService.extractCv(REAL_CV_TEXT);
    console.log("OK:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.log("FAIL: rejeté à tort —", e);
  }

  console.log("\n--- analyzeApplication avec cvText non-CV (attendu: score 0 / ecarter) ---");
  const fakeApplication = {
    id: 1,
    coverLetterText: null,
    cvUrl: "/uploads/cv/fake.pdf",
  } as any;
  const fakeOffer = {
    title: "Poste test",
    type: "emploi",
    location: "Lomé",
    description: "Description test",
    requirements: "React",
    aiAnalysisCriteria: null,
  } as any;
  const result = await AiService.analyzeApplication(
    fakeApplication,
    fakeOffer,
    "dossier text peu importe",
    undefined,
    undefined,
    GARBAGE_TEXT
  );
  console.log("Résultat:", JSON.stringify(result, null, 2));
  if (result.score === 0 && result.recommendation === "ecarter") {
    console.log("OK: analyse refusée comme attendu");
  } else {
    console.log("FAIL: analyse aurait dû être refusée");
  }

  console.log("\n--- analyzeApplication avec cvText CV réel (attendu: scoring normal, pas de rejet) ---");
  const result2 = await AiService.analyzeApplication(
    fakeApplication,
    fakeOffer,
    "dossier text peu importe",
    undefined,
    undefined,
    REAL_CV_TEXT
  );
  console.log("Résultat:", JSON.stringify(result2, null, 2));
  if (
    result2.summary ===
    "Ce document ne semble pas être un CV valide. Veuillez vérifier le fichier téléversé."
  ) {
    console.log("FAIL: rejeté à tort");
  } else {
    console.log("OK: pas rejeté");
  }
}

main();
