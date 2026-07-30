"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApiError, applicationsApi, offersApi } from "@/lib/api";
import { OFFER_TYPE_LABELS } from "@/lib/constants";
import {
  daysUntil,
  parseOfferSections,
  splitSkills,
} from "@/lib/offer-utils";
import { useAuthStore } from "@/lib/auth-store";
import { GuestApplyDialog } from "@/components/shared/guest-apply-dialog";

export default function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [letterFile, setLetterFile] = useState<File | null>(null);

  const { data: offer, isLoading } = useQuery({
    queryKey: ["offer", id],
    queryFn: () => offersApi.get(id),
  });

  const applyMutation = useMutation({
    mutationFn: () =>
      applicationsApi.create({
        offerId: Number(id),
        coverLetterText: coverLetterText || undefined,
        cv: cvFile,
        coverLetter: letterFile,
      }),
    onSuccess: () => {
      toast.success("Candidature envoyée avec succès !");
      setOpen(false);
      router.push("/candidat/candidatures");
    },
    onError: (error) => {
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
            {days !== null && days >= 0 && (
              <Badge
                variant="outline"
                className="border-white/30 bg-white/5 text-white"
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
              {user?.role === "candidat"
                ? "Joignez votre CV et une lettre pour envoyer votre candidature."
                : "Déposez votre CV pour préremplir le formulaire (nom, email…). Un email vous permettra ensuite de suivre votre dossier."}
            </p>

            {hydrated && !user && (
              <div className="mt-5 space-y-2">
                <GuestApplyDialog
                  offerId={Number(id)}
                  offerTitle={offer.title}
                />
                <p className="text-center text-xs text-slate-400">
                  Déjà un compte ?{" "}
                  <Link
                    href={`/login?next=/offres/${id}`}
                    className="font-medium text-yas-sky underline-offset-2 hover:underline"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            )}

            {!hydrated && (
              <div className="mt-5 h-12 animate-pulse rounded-xl bg-slate-100" />
            )}

            {hydrated && user?.role === "candidat" && (
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
                      Joignez votre CV et une lettre de motivation (PDF, DOC,
                      DOCX — max 5 Mo).
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="coverLetterText">
                        Lettre de motivation
                      </Label>
                      <Textarea
                        id="coverLetterText"
                        rows={6}
                        value={coverLetterText}
                        onChange={(e) => setCoverLetterText(e.target.value)}
                        placeholder="Expliquez votre motivation pour Yas Togo et ce poste (min. 20 caractères)…"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cv">CV</Label>
                      <input
                        id="cv"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coverLetter">
                        Lettre (fichier, optionnel)
                      </Label>
                      <input
                        id="coverLetter"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                          setLetterFile(e.target.files?.[0] || null)
                        }
                        className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => applyMutation.mutate()}
                      disabled={applyMutation.isPending}
                      className="w-full rounded-xl bg-yas-midnight hover:bg-yas-midnight/90 sm:w-auto"
                    >
                      {applyMutation.isPending
                        ? "Envoi…"
                        : "Envoyer ma candidature"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {hydrated && user && user.role !== "candidat" && (
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

          <p className="mt-4 text-center text-xs text-slate-400">
            Processus : CV / formulaire → candidature → suivi par email → entretien
          </p>
        </aside>
      </div>
    </div>
  );
}
