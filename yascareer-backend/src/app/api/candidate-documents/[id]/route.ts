import { handler, ok, notFound, forbidden } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const DELETE = handler(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    const user = await requireRole(req, ["candidat"]);
    const { id } = await ctx.params;
    const document = await prisma.candidateDocument.findUnique({
      where: { id: Number(id) },
    });
    if (!document) throw notFound("Document introuvable");
    if (document.userId !== user.id) throw forbidden();

    await prisma.candidateDocument.delete({ where: { id: document.id } });
    return ok({ message: "Document supprimé" });
  }
);
