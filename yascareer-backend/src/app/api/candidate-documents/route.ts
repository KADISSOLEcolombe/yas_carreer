import { handler, ok, badRequest, forbidden } from "@/server/http";
import { requireRole } from "@/server/auth";
import { query } from "@/server/body";
import { prisma } from "@/server/db";
import { StorageService } from "@/server/services/storage";
import { candidateDocumentValidator } from "@/server/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Documents permanents du candidat (diplômes, certifications, lettre type…) —
// libellé libre + fichier PDF, réutilisables pour toutes les candidatures.
// Le candidat consulte toujours les siens ; un superviseur peut consulter
// ceux d'un collaborateur qui lui est réellement affecté (via Emploi).
export const GET = handler(async (req) => {
  const user = await requireRole(req, ["candidat", "superviseur"]);
  let targetUserId = user.id;

  if (user.role === "superviseur") {
    const { userId } = query(req);
    if (!userId) throw badRequest("userId requis");
    targetUserId = Number(userId);
    const owns = await prisma.emploi.findFirst({
      where: { supervisorId: user.id, userId: targetUserId },
    });
    if (!owns) throw forbidden("Ce collaborateur ne vous est pas affecté");
  }

  const documents = await prisma.candidateDocument.findMany({
    where: { userId: targetUserId },
    orderBy: { createdAt: "desc" },
  });
  return ok(documents);
});

export const POST = handler(async (req) => {
  const user = await requireRole(req, ["candidat"]);
  const form = await req.formData();
  const label = candidateDocumentValidator.parse({
    label: form.get("label"),
  }).label;
  const file = form.get("file");
  if (!(file instanceof File) || !file.size) throw badRequest("Fichier requis");

  const url = await StorageService.saveUpload(file, "documents");
  const document = await prisma.candidateDocument.create({
    data: { userId: user.id, label, url },
  });
  return ok(document);
});
