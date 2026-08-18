import { handler, ok, badRequest } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";
import { StorageService } from "@/server/services/storage";
import { DocumentReaderService } from "@/server/services/document-reader";
import { AiService, InvalidCvDocumentError } from "@/server/services/ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handler(async (req) => {
  const user = await requireRole(req, ["candidat"]);
  const form = await req.formData();
  const cv = form.get("cv");
  if (!(cv instanceof File) || !cv.size) throw badRequest("Fichier CV requis");

  const cvUrl = await StorageService.saveUpload(cv, "cv");
  const read = await DocumentReaderService.readUpload(cvUrl);
  const text = read?.text || "";

  let extracted;
  try {
    extracted = text
      ? await AiService.extractCv(text)
      : { bio: null, skills: [] as string[], experiences: [], formations: [] };
  } catch (error) {
    if (error instanceof InvalidCvDocumentError) throw badRequest(error.message);
    throw error;
  }

  const profile = await prisma.candidateProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      cvUrl,
      aiExtractedData: extracted as object,
      bio: extracted.bio || null,
      skills: extracted.skills?.length ? extracted.skills.join(", ") : null,
    },
    update: {
      cvUrl,
      aiExtractedData: extracted as object,
      ...(extracted.bio ? { bio: extracted.bio } : {}),
      ...(extracted.skills?.length ? { skills: extracted.skills.join(", ") } : {}),
    },
  });

  return ok(profile);
});
