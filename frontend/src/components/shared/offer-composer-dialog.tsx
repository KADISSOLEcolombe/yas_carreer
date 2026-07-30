"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
  Mic,
  MicOff,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { ApiError, offersApi } from "@/lib/api";
import { useSpeechDictation } from "@/hooks/use-speech-dictation";
import type { OfferStatus, OfferType } from "@/lib/types";
import { cn } from "@/lib/utils";

export type OfferFormValues = {
  title: string;
  type: OfferType;
  description: string;
  requirements: string;
  deadline: string;
  location: string;
  status: OfferStatus;
};

export const EMPTY_OFFER_FORM: OfferFormValues = {
  title: "",
  type: "emploi",
  description: "",
  requirements: "",
  deadline: "",
  location: "",
  status: "brouillon",
};

const EXAMPLES = [
  "On cherche un stage développement web React 3 mois à Lomé, profil Bac+3/4.",
  "Poste CDI ingénieur réseau radio RAN, expérience 3 ans, basé à Lomé, clôture fin du mois.",
  "Recruter un conseiller clientèle boutique à Kara, orientation vente et relation client.",
  "Stage marketing digital et réseaux sociaux, 4 mois, équipe communication Yas.",
];

const GEN_STEPS = [
  "Analyse du brief…",
  "Titre & type de contrat…",
  "Description structurée…",
  "Compétences, lieu & date limite…",
];

function FieldHint({ active }: { active?: boolean }) {
  if (!active) return null;
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-yas-sky/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-yas-midnight">
      <Sparkles className="size-2.5" />
      IA
    </span>
  );
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialValues?: OfferFormValues;
  saving?: boolean;
  onSave: (values: OfferFormValues) => void;
};

export function OfferComposerDialog({
  open,
  onOpenChange,
  mode,
  initialValues,
  saving,
  onSave,
}: Props) {
  const [form, setForm] = useState<OfferFormValues>(
    initialValues ?? EMPTY_OFFER_FORM
  );
  const [brief, setBrief] = useState("");
  const [aiFilled, setAiFilled] = useState<
    Partial<Record<keyof OfferFormValues, boolean>>
  >({});
  const [genStep, setGenStep] = useState(0);
  const [composerOpen, setComposerOpen] = useState(mode === "create");

  const { supported, listening, toggle, stop } = useSpeechDictation((text) => {
    setBrief(text);
  });

  const aiAssistMutation = useMutation({
    mutationFn: () => offersApi.aiAssist({ brief }),
    onSuccess: (result) => {
      stop();
      setForm((prev) => ({
        ...prev,
        title: result.title,
        type: result.type,
        description: result.description,
        requirements: result.requirements,
        location: result.location,
        deadline: result.deadline?.slice(0, 10) || prev.deadline,
      }));
      setAiFilled({
        title: true,
        type: true,
        description: true,
        requirements: true,
        location: true,
        deadline: true,
      });
      setComposerOpen(false);
      setGenStep(0);
      toast.success("Offre générée — vérifiez puis enregistrez");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Génération impossible"
      );
    },
  });

  useEffect(() => {
    if (!open) {
      stop();
      return;
    }
    setForm(initialValues ?? EMPTY_OFFER_FORM);
    setBrief("");
    setAiFilled({});
    setGenStep(0);
    setComposerOpen(mode === "create");
  }, [open, initialValues, mode, stop]);

  useEffect(() => {
    if (!aiAssistMutation.isPending) return;
    setGenStep(0);
    const timers = GEN_STEPS.map((_, i) =>
      window.setTimeout(() => setGenStep(i), i * 700)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [aiAssistMutation.isPending]);

  const canSave =
    form.title.trim().length >= 3 && form.description.trim().length >= 20;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
          <DialogTitle className="font-heading text-xl text-yas-midnight">
            {mode === "edit" ? "Modifier l'offre" : "Nouvelle offre"}
          </DialogTitle>
          <DialogDescription>
            Décrivez le besoin à voix haute ou par écrit — l&apos;IA remplit
            titre, description, compétences, lieu et date limite.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div
            className={cn(
              "overflow-hidden rounded-2xl border transition",
              composerOpen
                ? "border-yas-sky/30 bg-gradient-to-br from-[#00377D] via-[#00377D] to-[#0a4a9e] text-white shadow-lg"
                : "border-slate-200 bg-slate-50"
            )}
          >
            <button
              type="button"
              className={cn(
                "flex w-full items-center justify-between gap-3 px-4 py-3 text-left",
                !composerOpen && "text-yas-midnight"
              )}
              onClick={() => setComposerOpen((v) => !v)}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Wand2
                  className={cn(
                    "size-4",
                    composerOpen ? "text-yas-yellow" : "text-yas-sky"
                  )}
                />
                Assistant IA YasCareer
              </span>
              <span
                className={cn(
                  "text-xs",
                  composerOpen ? "text-white/60" : "text-slate-400"
                )}
              >
                {composerOpen ? "Réduire" : "Ouvrir"}
              </span>
            </button>

            {composerOpen && (
              <div className="space-y-4 px-4 pb-4">
                <p className="text-sm text-white/75">
                  Parlez naturellement : métier, type (stage/CDI), lieu, durée,
                  compétences… L&apos;IA structure tout.
                </p>

                <div className="relative">
                  <Textarea
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    rows={4}
                    placeholder="Ex. : On a besoin d’un stage data analyst 3 mois à Lomé, Excel et Power BI…"
                    className="resize-none rounded-xl border-0 bg-white/10 pr-14 text-white placeholder:text-white/40 focus-visible:ring-yas-yellow/50"
                  />
                  {supported && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={toggle}
                      className={cn(
                        "absolute bottom-2 right-2 size-10 rounded-full text-white hover:bg-white/15",
                        listening &&
                          "animate-pulse bg-red-500/90 hover:bg-red-500"
                      )}
                      title={listening ? "Arrêter" : "Dicter"}
                    >
                      {listening ? (
                        <MicOff className="size-4" />
                      ) : (
                        <Mic className="size-4" />
                      )}
                    </Button>
                  )}
                </div>

                {listening && (
                  <p className="flex items-center gap-2 text-xs text-yas-yellow">
                    <span className="size-2 animate-pulse rounded-full bg-yas-yellow" />
                    Écoute en cours — parlez clairement…
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setBrief(ex)}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-left text-[11px] leading-snug text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                      {ex.length > 64 ? `${ex.slice(0, 64)}…` : ex}
                    </button>
                  ))}
                </div>

                <Button
                  type="button"
                  disabled={
                    brief.trim().length < 10 || aiAssistMutation.isPending
                  }
                  onClick={() => aiAssistMutation.mutate()}
                  className="h-11 w-full gap-2 rounded-xl bg-yas-yellow font-semibold text-yas-midnight hover:bg-yas-yellow/90"
                >
                  {aiAssistMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {GEN_STEPS[genStep]}
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Générer tous les champs
                    </>
                  )}
                </Button>

                {!supported && (
                  <p className="text-[11px] text-white/50">
                    Dictée vocale non disponible sur ce navigateur — saisissez le
                    brief à l&apos;écrit.
                  </p>
                )}
              </div>
            )}
          </div>

          {aiAssistMutation.isPending && (
            <div className="rounded-2xl border border-dashed border-yas-sky/40 bg-yas-sky/5 px-4 py-6 text-center">
              <Loader2 className="mx-auto size-6 animate-spin text-yas-sky" />
              <p className="mt-3 font-heading text-sm font-semibold text-yas-midnight">
                {GEN_STEPS[genStep]}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                L&apos;IA prépare une offre prête à publier.
              </p>
            </div>
          )}

          {!aiAssistMutation.isPending && (
            <div className="space-y-4">
              {Object.values(aiFilled).some(Boolean) && (
                <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                  <p>
                    Champs préremplis par l&apos;IA. Relisez, ajustez si besoin,
                    puis enregistrez.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="offer-title">
                  Titre
                  <FieldHint active={aiFilled.title} />
                </Label>
                <Input
                  id="offer-title"
                  className={cn(
                    "rounded-xl",
                    aiFilled.title && "ring-1 ring-yas-sky/40"
                  )}
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    setAiFilled((p) => ({ ...p, title: false }));
                  }}
                  placeholder="Ex. Stage — Développement Web"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Type
                    <FieldHint active={aiFilled.type} />
                  </Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => {
                      setForm({ ...form, type: v as OfferType });
                      setAiFilled((p) => ({ ...p, type: false }));
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        "rounded-xl",
                        aiFilled.type && "ring-1 ring-yas-sky/40"
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stage">Stage</SelectItem>
                      <SelectItem value="emploi">Emploi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm({ ...form, status: v as OfferStatus })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brouillon">Brouillon</SelectItem>
                      <SelectItem value="publiee">Publiée</SelectItem>
                      <SelectItem value="fermee">Fermée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="offer-location">
                    Lieu
                    <FieldHint active={aiFilled.location} />
                  </Label>
                  <Input
                    id="offer-location"
                    className={cn(
                      "rounded-xl",
                      aiFilled.location && "ring-1 ring-yas-sky/40"
                    )}
                    value={form.location}
                    onChange={(e) => {
                      setForm({ ...form, location: e.target.value });
                      setAiFilled((p) => ({ ...p, location: false }));
                    }}
                    placeholder="Lomé"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer-deadline">
                    Date limite
                    <FieldHint active={aiFilled.deadline} />
                  </Label>
                  <Input
                    id="offer-deadline"
                    type="date"
                    className={cn(
                      "rounded-xl",
                      aiFilled.deadline && "ring-1 ring-yas-sky/40"
                    )}
                    value={form.deadline}
                    onChange={(e) => {
                      setForm({ ...form, deadline: e.target.value });
                      setAiFilled((p) => ({ ...p, deadline: false }));
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer-description">
                  Description
                  <FieldHint active={aiFilled.description} />
                </Label>
                <Textarea
                  id="offer-description"
                  rows={7}
                  className={cn(
                    "rounded-xl",
                    aiFilled.description && "ring-1 ring-yas-sky/40"
                  )}
                  value={form.description}
                  onChange={(e) => {
                    setForm({ ...form, description: e.target.value });
                    setAiFilled((p) => ({ ...p, description: false }));
                  }}
                  placeholder="À propos, missions, profil…"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer-requirements">
                  Compétences
                  <FieldHint active={aiFilled.requirements} />
                </Label>
                <Textarea
                  id="offer-requirements"
                  rows={2}
                  className={cn(
                    "rounded-xl",
                    aiFilled.requirements && "ring-1 ring-yas-sky/40"
                  )}
                  value={form.requirements}
                  onChange={(e) => {
                    setForm({ ...form, requirements: e.target.value });
                    setAiFilled((p) => ({ ...p, requirements: false }));
                  }}
                  placeholder="React, Communication, Excel…"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-slate-100 px-6 py-4 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            onClick={() => onSave(form)}
            disabled={saving || !canSave || aiAssistMutation.isPending}
            className="rounded-xl bg-yas-midnight hover:bg-yas-midnight/90"
          >
            {saving
              ? "Enregistrement…"
              : mode === "edit"
                ? "Enregistrer"
                : "Créer l'offre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
