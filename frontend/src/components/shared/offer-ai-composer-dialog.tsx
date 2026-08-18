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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import {
  EMPTY_OFFER_FORM,
  isOfferFormValid,
  OfferFieldsForm,
  type AiFilledMap,
  type OfferFormValues,
} from "@/components/shared/offer-fields-form";

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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving?: boolean;
  onSave: (values: OfferFormValues) => void;
};

export function OfferAiComposerDialog({ open, onOpenChange, saving, onSave }: Props) {
  const [step, setStep] = useState<"brief" | "review">("brief");
  const [brief, setBrief] = useState("");
  const [form, setForm] = useState<OfferFormValues>(EMPTY_OFFER_FORM);
  const [aiFilled, setAiFilled] = useState<AiFilledMap>({});
  const [genStep, setGenStep] = useState(0);
  const [touched, setTouched] = useState<{
    title?: boolean;
    description?: boolean;
    departement?: boolean;
  }>({});

  const { supported, listening, toggle, stop } = useSpeechDictation((text) => {
    setBrief(text);
  });

  useEffect(() => {
    if (!open) {
      stop();
      return;
    }
    setStep("brief");
    setBrief("");
    setForm(EMPTY_OFFER_FORM);
    setAiFilled({});
    setGenStep(0);
    setTouched({});
  }, [open, stop]);

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
      setStep("review");
      toast.success("Offre générée — vérifiez puis enregistrez");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Génération impossible"
      );
    },
  });

  useEffect(() => {
    if (!aiAssistMutation.isPending) return;
    setGenStep(0);
    const timers = GEN_STEPS.map((_, i) =>
      window.setTimeout(() => setGenStep(i), i * 700)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [aiAssistMutation.isPending]);

  function handleSave() {
    if (!isOfferFormValid(form)) {
      setTouched({ title: true, description: true, departement: true });
      return;
    }
    onSave(form);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
          <DialogTitle className="flex items-center gap-2 font-heading text-xl text-yas-midnight">
            <Sparkles className="size-5 text-yas-sky" />
            Créer une offre avec l&apos;IA
          </DialogTitle>
          <DialogDescription>
            Décrivez le besoin à voix haute ou par écrit — l&apos;IA remplit
            titre, description, compétences, lieu et date limite.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {step === "brief" && (
            <div className="space-y-4 rounded-2xl border border-yas-sky/30 bg-gradient-to-br from-[#00377D] via-[#00377D] to-[#0a4a9e] p-4 text-white shadow-lg">
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
                    className={`absolute bottom-2 right-2 size-10 rounded-full text-white hover:bg-white/15 ${
                      listening ? "animate-pulse bg-red-500/90 hover:bg-red-500" : ""
                    }`}
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
                disabled={brief.trim().length < 10 || aiAssistMutation.isPending}
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

          {step === "review" && !aiAssistMutation.isPending && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <p>
                  Champs préremplis par l&apos;IA. Relisez, ajustez si besoin,
                  choisissez le département, puis enregistrez.
                </p>
              </div>

              <OfferFieldsForm
                form={form}
                onChange={(patch) => {
                  setForm((prev) => ({ ...prev, ...patch }));
                  setAiFilled((p) => {
                    const next = { ...p };
                    for (const key of Object.keys(patch)) {
                      delete next[key as keyof OfferFormValues];
                    }
                    return next;
                  });
                }}
                aiFilled={aiFilled}
                touched={touched}
                onTouch={(field) => setTouched((t) => ({ ...t, [field]: true }))}
              />

              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-slate-200"
                onClick={() => setStep("brief")}
              >
                ← Modifier le brief et régénérer
              </Button>
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
          {step === "review" && (
            <Button
              onClick={handleSave}
              disabled={saving || aiAssistMutation.isPending}
              className="rounded-xl bg-yas-midnight hover:bg-yas-midnight/90"
            >
              {saving ? "Enregistrement…" : "Créer l'offre"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
