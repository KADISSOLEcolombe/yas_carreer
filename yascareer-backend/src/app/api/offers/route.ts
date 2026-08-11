import { handler, ok } from "@/server/http";
import { currentUser, requireRole } from "@/server/auth";
import { query, readJson } from "@/server/body";
import { offerValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { NotificationService } from "@/server/services/notification";
import { ActivityLogService } from "@/server/services/activity-log";
import type { Prisma } from "@prisma/client";
import type { OfferStatus, OfferType } from "@/server/domain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req) => {
  const { type, location, q, status } = query(req);
  const user = await currentUser(req);

  const where: Prisma.OfferWhereInput = {};
  const and: Prisma.OfferWhereInput[] = [];

  if (!user || user.role === "candidat") {
    where.status = "publiee";
    // Une offre dont la deadline est dépassée n'est plus proposée aux
    // nouveaux visiteurs — elle reste accessible via son lien direct
    // (GET /offers/[id] n'applique pas ce filtre), seul le RH la voit encore
    // dans ses propres listes.
    const todayUTC = new Date(
      Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())
    );
    and.push({ OR: [{ deadline: null }, { deadline: { gte: todayUTC } }] });
  } else if (status) {
    where.status = status as OfferStatus;
  }
  if (type) where.type = type as OfferType;
  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }
  if (q) {
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { requirements: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (and.length > 0) where.AND = and;

  const offers = await prisma.offer.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return ok(offers);
});

export const POST = handler(async (req) => {
  const user = await requireRole(req, ["rh", "admin"]);
  const payload = offerValidator.parse(await readJson(req));

  const offer = await prisma.offer.create({
    data: {
      title: payload.title,
      type: payload.type,
      description: payload.description,
      requirements: payload.requirements || null,
      deadline: payload.deadline ? new Date(payload.deadline) : null,
      location: payload.location || null,
      status: payload.status || "brouillon",
      createdBy: user.id,
      aiAnalysisCriteria: payload.aiAnalysisCriteria?.trim() || null,
    },
  });

  if (offer.status === "publiee") {
    await NotificationService.notifyStaff(
      "offer_published",
      `Offre publiée : « ${offer.title} »${offer.location ? ` — ${offer.location}` : ""}.`,
      user.id
    );
  }

  void ActivityLogService.fromRequest(req, user, {
    action: "offer.create",
    category: "offer",
    summary: `Création de l’offre « ${offer.title} » (${offer.status})`,
    resourceType: "offer",
    resourceId: offer.id,
    metadata: { title: offer.title, status: offer.status, type: offer.type },
  });

  return ok(offer);
});
