import { handler, ok, badRequest } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";
import { DocumentReaderService } from "@/server/services/document-reader";
import { assessCvText, assessCoverLetterText } from "@/server/services/ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Vérification immédiate (au dépôt du fichier, avant l'envoi de la
// candidature) qu'un document ressemble bien à un CV / une lettre de
// motivation — même heuristique que celle utilisée avant l'analyse IA,
// simplement appelée plus tôt dans le parcours.
export const POST = handler(async (req) => {
  const user = await requireRole(req, ["candidat"]);
  const form = await req.formData();

  const kind = form.get("kind");
  if (kind !== "cv" && kind !== "coverLetter") {
    throw badRequest("Type de document invalide");
  }

  const file = form.get("file");
  const documentIdRaw = form.get("documentId");

  let text = "";
  if (file instanceof File && file.size) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const read = await DocumentReaderService.readBuffer(buffer, file.name);
    text = read.text;
  } else if (documentIdRaw) {
    const doc = await prisma.candidateDocument.findUnique({
      where: { id: Number(documentIdRaw) },
    });
    if (!doc || doc.userId !== user.id) throw badRequest("Document introuvable");
    const read = await DocumentReaderService.readUpload(doc.url);
    text = read?.text || "";
  } else {
    throw badRequest("Fichier ou document requis");
  }

  const result = kind === "cv" ? assessCvText(text) : assessCoverLetterText(text);
  return ok(result);
});
