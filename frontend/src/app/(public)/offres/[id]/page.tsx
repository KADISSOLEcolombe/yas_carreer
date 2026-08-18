"use client";

import { use, useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  MapPin,
  Share2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ApiError,
  applicationsApi,
  candidateDocumentsApi,
  offersApi,
  type DocumentSelection,
} from "@/lib/api";
import { OFFER_TYPE_LABELS } from "@/lib/constants";
import {
  daysUntil,
  isOfferExpired,
  parseOfferSections,
  splitSkills,
} from "@/lib/offer-utils";
import { useAuthStore } from "@/lib/auth-store";
import { setPendingOffer, clearPendingOffer } from "@/lib/pending-application";
import type { CandidateDocument, OfferDocumentRequirement } from "@/lib/types";
import { cn } from "@/lib/utils";

type SlotValue =
  | { mode: "select"; documentId: number | null }
  | { mode: "upload"; file: File | null };

type DocCheckState =
  | { status: "idle" | "checking" | "valid" }
  | { status: "invalid"; message: string };

function isSlotResolved(slot: SlotValue): boolean {
  return slot.mode === "select" ? slot.documentId != null : slot.file != null;
}

function slotToSelection(slot: SlotValue): DocumentSelection {
  return slot.mode === "select"
    ? { documentId: slot.documentId as number }
    : { file: slot.file as File };
}

/** Clé stable dérivée du contenu réel du slot — sert de dépendance d'effet
 * sans redéclencher la vérification à chaque re-render (contrairement à
 * l'objet SlotValue, recréé à chaque appel de getSlot()). */
function slotKey(slot: SlotValue): string {
  return slot.mode === "select"
    ? `select:${slot.documentId ?? ""}`
    : `upload:${slot.file ? `${slot.file.name}:${slot.file.size}:${slot.file.lastModified}` : ""}`;
}

/** Choisir un document déjà enregistré dans le profil, ou en téléverser un nouveau propre à cette candidature. */
function DocumentSlotField({
  name,
  description,
  required = true,
  documents,
  value,
  onChange,
  checkState,
}: {
  name: string;
  description?: string | null;
  required?: boolean;
  documents: CandidateDocument[];
  value: SlotValue;
  onChange: (next: SlotValue) => void;
  checkState?: DocCheckState;
}) {
  const resolved = isSlotResolved(value);

  return (
    <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-yas-midnight">
            {name}
            {required && <span className="text-destructive">*</span>}
          </p>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
        {checkState?.status === "invalid" ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
            <XCircle className="size-3.5" />
            Document invalide
          </span>
        ) : checkState?.status === "checking" ? (
          <span className="text-xs font-medium text-slate-400">Vérification…</span>
        ) : resolved ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="size-3.5" />
            Fourni
          </span>
        ) : (
          <span className="text-xs font-medium text-amber-700">
            {required ? "Requis" : "Facultatif"}
          </span>
        )}
      </div>

      {documents.length > 0 && (
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-xs">
          <button
            type="button"
            onClick={() =>
              onChange({
                mode: "select",
                documentId: value.mode === "select" ? value.documentId : null,
              })
            }
            className={cn(
              "flex-1 rounded-md px-2 py-1 font-medium transition",
              value.mode === "select"
                ? "bg-white text-yas-midnight shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            Document du profil
          </button>
          <button
            type="button"
            onClick={() => onChange({ mode: "upload", file: null })}
            className={cn(
              "flex-1 rounded-md px-2 py-1 font-medium transition",
              value.mode === "upload"
                ? "bg-white text-yas-midnight shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            Nouveau fichier
          </button>
        </div>
      )}

      {value.mode === "select" && documents.length > 0 ? (
        <Select
          value={value.documentId != null ? String(value.documentId) : undefined}
          onValueChange={(v) => onChange({ mode: "select", documentId: Number(v) })}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Choisir un document…" />
          </SelectTrigger>
          <SelectContent>
            {documents.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <input
          type="file"
          accept=".pdf"
          onChange={(e) =>
            onChange({ mode: "upload", file: e.target.files?.[0] || null })
          }
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
      )}

      {checkState?.status === "invalid" && (
        <p className="text-xs font-medium text-destructive">{checkState.message}</p>
      )}
    </div>
  );
}

function OfferDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, hydrated } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [slotOverrides, setSlotOverrides] = useState<Record<string, SlotValue>>({});
  const autoOpenedRef = useRef(false);

  const { data: offer, isLoading } = useQuery({
    queryKey: ["offer", id],
    queryFn: () => offersApi.get(id),
  });

  const { data: myDocuments } = useQuery({
    queryKey: ["candidate-documents"],
    queryFn: candidateDocumentsApi.list,
    enabled: hydrated && user?.role === "candidat",
  });
  const documents = myDocuments ?? [];

  function findDocument(label: string) {
    return documents.find(
      (d) => d.label.trim().toLowerCase() === label.trim().toLowerCase()
    );
  }

  // "CV" et "Lettre de motivation" sont universels et toujours obligatoires
  // (toute offre les exige) ; les documents complémentaires — avec leur
  // propre statut obligatoire/facultatif — dépendent de l'offre (définis par
  // le RH via `documentsRequis`).
  const requiredDocs: OfferDocumentRequirement[] = [
    { nom: "CV", obligatoire: true },
    { nom: "Lettre de motivation", obligatoire: true },
    ...(offer?.documentsRequis ?? []),
  ];

  function defaultSlot(name: string): SlotValue {
    const match = findDocument(name);
    if (match) return { mode: "select", documentId: match.id };
    if (documents.length > 0) return { mode: "select", documentId: null };
    return { mode: "upload", file: null };
  }

  function getSlot(name: string): SlotValue {
    return slotOverrides[name] ?? defaultSlot(name);
  }

  function setSlot(name: string, value: SlotValue) {
    setSlotOverrides((prev) => ({ ...prev, [name]: value }));
  }

  const missingDocs = requiredDocs.filter(
    (d) => d.obligatoire && !isSlotResolved(getSlot(d.nom))
  );

  // Vérification immédiate (au dépôt/à la sélection du fichier, avant
  // l'envoi) que le CV et la lettre de motivation ressemblent bien à de
  // vrais documents du bon type — même heuristique que côté analyse IA,
  // appelée ici plus tôt dans le parcours pour bloquer à la source.
  const cvSlot = getSlot("CV");
  const coverSlot = getSlot("Lettre de motivation");
  const cvSlotKey = slotKey(cvSlot);
  const coverSlotKey = slotKey(coverSlot);
  const [cvCheck, setCvCheck] = useState<DocCheckState>({ status: "idle" });
  const [coverCheck, setCoverCheck] = useState<DocCheckState>({ status: "idle" });

  useEffect(() => {
    if (!isSlotResolved(cvSlot)) {
      setCvCheck({ status: "idle" });
      return;
    }
    let cancelled = false;
    setCvCheck({ status: "checking" });
    applicationsApi
      .validateDocument({ kind: "cv", ...slotToSelection(cvSlot) })
      .then((result) => {
        if (cancelled) return;
        setCvCheck(
          result.valid
            ? { status: "valid" }
            : { status: "invalid", message: result.message }
        );
      })
      .catch(() => {
        if (!cancelled) setCvCheck({ status: "idle" });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvSlotKey]);

  useEffect(() => {
    if (!isSlotResolved(coverSlot)) {
      setCoverCheck({ status: "idle" });
      return;
    }
    let cancelled = false;
    setCoverCheck({ status: "checking" });
    applicationsApi
      .validateDocument({ kind: "coverLetter", ...slotToSelection(coverSlot) })
      .then((result) => {
        if (cancelled) return;
        setCoverCheck(
          result.valid
            ? { status: "valid" }
            : { status: "invalid", message: result.message }
        );
      })
      .catch(() => {
        if (!cancelled) setCoverCheck({ status: "idle" });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverSlotKey]);

  const docChecksBlocking =
    cvCheck.status === "checking" ||
    cvCheck.status === "invalid" ||
    coverCheck.status === "checking" ||
    coverCheck.status === "invalid";

  useEffect(() => {
    if (autoOpenedRef.current) return;
    if (!hydrated || !offer) return;
    if (
      searchParams.get("apply") === "1" &&
      user?.role === "candidat" &&
      !isOfferExpired(offer.deadline)
    ) {
      setOpen(true);
      autoOpenedRef.current = true;
    }
  }, [hydrated, offer, user, searchParams]);

  const applyMutation = useMutation({
    mutationFn: () => {
      const extraDocs = offer!.documentsRequis;
      return applicationsApi.create({
        offerId: Number(id),
        coverLetterText: coverLetterText || undefined,
        cv: slotToSelection(getSlot("CV")),
        coverLetter: slotToSelection(getSlot("Lettre de motivation")),
        documents: Object.fromEntries(
          extraDocs
            .filter((d) => isSlotResolved(getSlot(d.nom)))
            .map((d) => [d.nom, slotToSelection(getSlot(d.nom))])
        ),
      });
    },
    onSuccess: () => {
      toast.success("Candidature envoyée avec succès !");
      setOpen(false);
      setSlotOverrides({});
      clearPendingOffer();
      router.push("/candidat/candidatures");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        clearPendingOffer();
      }
      toast.error(
        error instanceof ApiError ? error.message : "Erreur lors de l'envoi"
      );
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20">
        <div className="h-40 animate-pulse rounded-2xl bg-secondary" />
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-secondary/70" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="font-heading text-2xl font-semibold text-yas-midnight">
          Offre introuvable
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/offres">Retour aux offres</Link>
        </Button>
      </div>
    );
  }

  const skills = splitSkills(offer.requirements);
  const sections = parseOfferSections(offer.description);
  const days = daysUntil(offer.deadline);
  const expired = isOfferExpired(offer.deadline);

  async function shareOffer() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: offer!.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Lien copié dans le presse-papiers");
      }
    } catch {
      // cancelled
    }
  }

  return (
    <div>
      {/* Hero détail */}
      <div className="relative overflow-hidden bg-yas-midnight text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 30%, #FFD100 0%, transparent 40%), radial-gradient(circle at 15% 70%, #5F99D2 0%, transparent 45%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <Link
            href="/offres"
            className="inline-flex items-center gap-1.5 text-sm text-white/70 transition hover:text-yas-yellow"
          >
            <ArrowLeft className="size-4" />
            Toutes les offres
          </Link>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge className="bg-yas-yellow text-yas-midnight hover:bg-yas-yellow">
              {OFFER_TYPE_LABELS[offer.type]}
            </Badge>
            {expired && (
              <Badge
                variant="outline"
                className="border-white/30 bg-white/5 text-white"
              >
                Offre clôturée
              </Badge>
            )}
            {!expired && days !== null && days >= 0 && (
              <Badge
                variant="outline"
                className={
                  days <= 14
                    ? "border-yas-yellow/40 bg-yas-yellow/15 text-yas-yellow"
                    : "border-white/30 bg-white/5 text-white"
                }
              >
                {days === 0
                  ? "Clôture aujourd'hui"
                  : `${days} jour${days > 1 ? "s" : ""} restant${days > 1 ? "s" : ""}`}
              </Badge>
            )}
          </div>

          <h1 className="mt-4 max-w-3xl font-heading text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            {offer.title}
          </h1>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
            {offer.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 text-yas-yellow" />
                {offer.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="size-4 text-yas-yellow" />
              Yas Togo
            </span>
            {offer.deadline && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-4 text-yas-yellow" />
                Candidatures jusqu&apos;au{" "}
                {new Date(offer.deadline).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="size-4 text-yas-yellow" />
              {OFFER_TYPE_LABELS[offer.type]}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_300px]">
        {/* Contenu principal */}
        <div className="space-y-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="font-heading text-xl font-semibold text-yas-midnight">
                {section.title}
              </h2>
              <div className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">
                {section.body}
              </div>
            </section>
          ))}

          {skills.length > 0 && (
            <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-heading text-xl font-semibold text-yas-midnight">
                Compétences clés
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-yas-midnight/5 px-3 py-1.5 text-sm font-medium text-yas-midnight"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-yas-sky/20 bg-gradient-to-br from-[#f3f8fd] to-white p-6 sm:p-8">
            <h2 className="font-heading text-xl font-semibold text-yas-midnight">
              Pourquoi Yas Togo ?
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              {[
                "1er réseau internet mobile au Togo et dans l’UEMOA",
                "Certifié Top Employer — formation et mobilité interne",
                "Culture « Let’s grow together » : dignité, collaboration, impact",
                "Opportunités sur Lomé et en régions (Plateaux, Savanes…)",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-yas-sky" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Sidebar candidature */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md">
            <p className="font-heading text-lg font-semibold text-yas-midnight">
              Intéressé(e) ?
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {expired
                ? "Les candidatures pour cette offre sont closes. La date limite de candidature est dépassée."
                : user?.role === "candidat"
                  ? "Joignez votre CV et une lettre pour envoyer votre candidature."
                  : "Veuillez vous connecter ou créer un compte candidat pour postuler à cette offre et suivre votre dossier."}
            </p>

            {expired && (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-500">
                <XCircle className="size-4 shrink-0 text-slate-400" />
                Offre clôturée
              </div>
            )}

            {!expired && hydrated && !user && (
              <div className="mt-5 space-y-3">
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full rounded-xl bg-yas-yellow text-base font-semibold text-yas-midnight hover:bg-yas-yellow/90 border-none"
                >
                  <Link href={`/login?next=/offres/${id}`}>
                    Se connecter pour postuler
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 w-full rounded-xl border-slate-200 text-base text-yas-midnight hover:bg-slate-50"
                >
                  <Link
                    href={`/register?next=/offres/${id}`}
                    onClick={() => setPendingOffer(Number(id), offer.title)}
                  >
                    Créer un compte candidat
                  </Link>
                </Button>
                <p className="text-center text-xs text-slate-400">
                  La création de compte est requise pour postuler et suivre vos candidatures.
                </p>
              </div>
            )}

            {!expired && !hydrated && (
              <div className="mt-5 h-12 animate-pulse rounded-xl bg-slate-100" />
            )}

            {!expired && hydrated && user?.role === "candidat" && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="mt-5 h-12 w-full rounded-xl bg-yas-yellow text-base font-semibold text-yas-midnight hover:bg-yas-yellow/90"
                  >
                    Postuler maintenant
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Postuler — {offer.title}</DialogTitle>
                    <DialogDescription>
                      Pour chaque document demandé, utilisez un document déjà
                      enregistré dans votre profil ou téléversez-en un nouveau
                      pour cette candidature (PDF uniquement, max 5 Mo).
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="coverLetterText">
                        Message complémentaire (optionnel)
                      </Label>
                      <Textarea
                        id="coverLetterText"
                        rows={4}
                        value={coverLetterText}
                        onChange={(e) => setCoverLetterText(e.target.value)}
                        placeholder="Un mot pour accompagner votre candidature (min. 20 caractères)…"
                      />
                    </div>

                    {requiredDocs.map((doc) => (
                      <DocumentSlotField
                        key={doc.nom}
                        name={doc.nom}
                        description={doc.description}
                        required={doc.obligatoire}
                        documents={documents}
                        value={getSlot(doc.nom)}
                        onChange={(v) => setSlot(doc.nom, v)}
                        checkState={
                          doc.nom === "CV"
                            ? cvCheck
                            : doc.nom === "Lettre de motivation"
                              ? coverCheck
                              : undefined
                        }
                      />
                    ))}

                    {documents.length === 0 && (
                      <p className="text-xs text-slate-400">
                        Vous n&apos;avez encore aucun document enregistré —{" "}
                        <Link
                          href="/candidat/profil"
                          className="underline"
                          target="_blank"
                        >
                          ajoutez-en depuis votre profil
                        </Link>{" "}
                        ou téléversez directement les fichiers ci-dessus.
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="midnight"
                      onClick={() => applyMutation.mutate()}
                      disabled={
                        applyMutation.isPending ||
                        missingDocs.length > 0 ||
                        docChecksBlocking
                      }
                      className="w-full rounded-xl sm:w-auto"
                    >
                      {applyMutation.isPending
                        ? "Envoi…"
                        : missingDocs.length > 0
                          ? `${missingDocs.length} document${missingDocs.length > 1 ? "s" : ""} manquant${missingDocs.length > 1 ? "s" : ""}`
                          : cvCheck.status === "invalid" || coverCheck.status === "invalid"
                            ? "Document invalide — corrigez avant d'envoyer"
                            : cvCheck.status === "checking" || coverCheck.status === "checking"
                              ? "Vérification des documents…"
                              : "Envoyer ma candidature"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {!expired && hydrated && user && user.role !== "candidat" && (
              <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                Vous êtes connecté en tant que {user.role === "rh" ? "RH" : "admin"}.
                Utilisez un compte candidat pour postuler.
              </p>
            )}

            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full gap-2 rounded-xl border-slate-200"
              onClick={shareOffer}
            >
              <Share2 className="size-4" />
              Partager l&apos;offre
            </Button>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Type</span>
                <span className="font-medium text-yas-midnight">
                  {OFFER_TYPE_LABELS[offer.type]}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Lieu</span>
                <span className="text-right font-medium text-yas-midnight">
                  {offer.location || "—"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Date limite</span>
                <span className="font-medium text-yas-midnight">
                  {offer.deadline
                    ? new Date(offer.deadline).toLocaleDateString("fr-FR")
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="h-40 animate-pulse rounded-2xl bg-secondary" />
          <div className="mt-8 h-64 animate-pulse rounded-2xl bg-secondary/70" />
        </div>
      }
    >
      <OfferDetailContent params={params} />
    </Suspense>
  );
}
