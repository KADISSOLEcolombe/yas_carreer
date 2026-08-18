import PDFDocument from "pdfkit";

const TYPE_LABELS: Record<string, string> = {
  rapport: "Rapport de suivi",
  evaluation: "Rapport d'évaluation d'entretien",
  observation: "Observation",
};

const RECOMMENDATION_LABELS: Record<string, string> = {
  favorable: "Favorable",
  a_revoir: "À revoir",
  defavorable: "Défavorable",
};

export interface SupervisionReportData {
  type: string;
  /** "Candidat" (évaluation d'entretien) ou "Collaborateur" (suivi post-embauche). */
  personLabel: string;
  personName: string;
  /** "Offre" (évaluation d'entretien) ou "Poste" (suivi). */
  contextLabel: string;
  contextValue: string | null;
  supervisorName: string;
  createdAt: Date;
  title: string | null;
  rating: number | null;
  recommendation: string | null;
  content: string;
}

/**
 * Génère, en mémoire, le PDF récapitulatif d'un rapport superviseur — aussi
 * bien une évaluation d'entretien (pré-embauche) qu'un rapport de suivi
 * (post-embauche). Appelé une seule fois à l'envoi du rapport, dont le
 * résultat est stocké (pas régénéré à chaque téléchargement).
 */
export function generateSupervisionReportPdf(data: SupervisionReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc
      .fontSize(18)
      .fillColor("#00377D")
      .text("YasCareer", { continued: false });
    doc
      .fontSize(14)
      .fillColor("#000")
      .text(TYPE_LABELS[data.type] ?? "Rapport");
    doc
      .fontSize(9)
      .fillColor("#666")
      .text(
        `Généré le ${data.createdAt.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`
      );
    doc.moveDown(1.5);

    function field(label: string, value: string) {
      doc.fontSize(11).fillColor("#00377D").text(label, { underline: true });
      doc.fontSize(11).fillColor("#000").text(value);
      doc.moveDown(0.8);
    }

    field(data.personLabel, data.personName);
    if (data.contextValue) field(data.contextLabel, data.contextValue);
    field("Superviseur", data.supervisorName);
    if (data.title) field("Appréciation", data.title);
    if (data.rating != null) field("Note", `${data.rating}/5`);
    if (data.recommendation) {
      field("Recommandation", RECOMMENDATION_LABELS[data.recommendation] ?? data.recommendation);
    }

    doc.fontSize(11).fillColor("#00377D").text("Compte-rendu", { underline: true });
    doc.fontSize(11).fillColor("#000").text(data.content, { align: "justify" });

    doc.end();
  });
}
