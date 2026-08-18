import { extname } from "node:path";
import { handler, ok, notFound, badRequest } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";
import { DocumentReaderService } from "@/server/services/document-reader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// RH/admin: resolve a candidature document for in-app reading (not a forced
// download). PDFs are rendered directly by the browser via an iframe on the
// stored URL; DOC/DOCX have no native browser renderer, so we return
// extracted text as a fallback preview.
export const GET = handler(
  async (req, ctx: { params: Promise<{ id: string; kind: string }> }) => {
    await requireRole(req, ["rh", "admin"]);
    const { id, kind } = await ctx.params;
    if (kind !== "cv" && kind !== "coverLetter") {
      throw badRequest("Type de document invalide");
    }

    const application = await prisma.application.findUnique({
      where: { id: Number(id) },
    });
    if (!application) throw notFound("Candidature introuvable");

    const url = kind === "cv" ? application.cvUrl : application.coverLetterUrl;
    if (!url) throw notFound("Document introuvable");

    const extension = extname(url).toLowerCase().replace(".", "");
    const text =
      extension === "pdf" ? null : (await DocumentReaderService.readUpload(url))?.text || "";

    return ok({ url, extension, text });
  }
);
