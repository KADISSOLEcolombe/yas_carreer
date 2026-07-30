"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileUp, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ApiError, applicationsApi } from "@/lib/api";
import { cn } from "@/lib/utils";

type Props = {
  offerId: number;
  offerTitle: string;
  triggerClassName?: string;
};

export function GuestApplyDialog({
  offerId,
  offerTitle,
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [letterFile, setLetterFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function reset() {
    setCvFile(null);
    setLetterFile(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setSkills("");
    setBio("");
    setCoverLetterText("");
    setSuccessMessage(null);
  }

  const extractMutation = useMutation({
    mutationFn: (file: File) => applicationsApi.extractCvPublic(file),
    onSuccess: (data) => {
      if (data.fullName) setFullName(data.fullName);
      if (data.email) setEmail(data.email);
      if (data.phone) setPhone(data.phone);
      if (data.bio) setBio(data.bio);
      if (data.skills?.length) setSkills(data.skills.join(", "));
      if (data.warning) toast.message(data.warning);
      else toast.success("Champs préremplis — vérifiez avant d’envoyer");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Extraction du CV impossible"
      );
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => {
      if (!cvFile) throw new Error("CV requis");
      return applicationsApi.guestCreate({
        offerId,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        coverLetterText: coverLetterText.trim() || undefined,
        skills: skills.trim() || undefined,
        bio: bio.trim() || undefined,
        cv: cvFile,
        coverLetter: letterFile,
      });
    },
    onSuccess: (data) => {
      setSuccessMessage(
        data.message ||
          "Candidature envoyée — vérifiez votre email pour suivre votre dossier"
      );
      toast.success(
        "Candidature envoyée — vérifiez votre email pour suivre votre dossier"
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Erreur lors de l'envoi"
      );
    },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  function handleExtract() {
    if (!cvFile) {
      toast.error("Ajoutez votre CV (PDF, DOC ou DOCX)");
      return;
    }
    extractMutation.mutate(cvFile);
  }

  function handleSubmit() {
    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error("Indiquez votre nom complet");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Indiquez un email valide");
      return;
    }
    if (!cvFile) {
      toast.error("Joignez votre CV pour envoyer la candidature");
      return;
    }
    if (coverLetterText.trim() && coverLetterText.trim().length < 20) {
      toast.error("La lettre doit faire au moins 20 caractères");
      return;
    }
    submitMutation.mutate();
  }

  const busy = extractMutation.isPending || submitMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className={cn(
            "h-12 w-full rounded-xl text-base font-semibold",
            triggerClassName
          )}
        >
          Postuler
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        {successMessage ? (
          <div className="space-y-4 p-5 sm:p-6">
            <DialogHeader>
              <DialogTitle>Candidature envoyée</DialogTitle>
              <DialogDescription>{successMessage}</DialogDescription>
            </DialogHeader>
            <p className="text-sm leading-relaxed text-slate-600">
              Un email de confirmation vous a été envoyé. Pour suivre votre
              dossier, activez votre espace via le lien reçu ou connectez-vous
              avec votre email.
            </p>
            <DialogFooter>
              <Button
                variant="midnight"
                className="h-11 w-full rounded-xl sm:w-auto"
                onClick={() => handleOpenChange(false)}
              >
                Fermer
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="space-y-1 border-b border-slate-100 px-5 py-4 sm:px-6">
              <DialogHeader>
                <DialogTitle className="pr-8">Postuler — {offerTitle}</DialogTitle>
                <DialogDescription className="text-[13px] leading-relaxed">
                  Remplissez les champs ci-dessous. Déposez votre CV pour
                  préremplir automatiquement (extraction des infos uniquement).
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-6">
              <div className="space-y-2.5">
                <Label
                  htmlFor="guest-cv"
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center transition",
                    cvFile
                      ? "border-yas-sky/40 bg-yas-sky/5"
                      : "border-slate-200 bg-slate-50/90 hover:border-yas-sky/40 hover:bg-slate-50"
                  )}
                >
                  <FileUp
                    className={cn(
                      "size-7",
                      cvFile ? "text-yas-sky" : "text-slate-400"
                    )}
                  />
                  <span className="mt-2 text-sm font-medium text-yas-midnight">
                    {cvFile
                      ? cvFile.name
                      : "Choisir un CV (PDF, DOC, DOCX — max 5 Mo)"}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    Obligatoire pour envoyer la candidature
                  </span>
                </Label>
                <input
                  id="guest-cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExtract}
                  disabled={!cvFile || busy}
                  className="h-10 w-full gap-2 rounded-xl border-slate-200 text-yas-midnight"
                >
                  {extractMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Extraction en cours…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4 text-yas-sky" />
                      Préremplir avec mon CV
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-5">
                <p className="text-sm font-semibold text-yas-midnight">
                  Vos informations
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="guest-name">Nom complet</Label>
                    <Input
                      id="guest-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Prénom Nom"
                      disabled={busy}
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="guest-email">Email</Label>
                    <Input
                      id="guest-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@email.com"
                      disabled={busy}
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="guest-phone">Téléphone</Label>
                    <Input
                      id="guest-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+228 …"
                      disabled={busy}
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="guest-skills">Compétences</Label>
                  <Input
                    id="guest-skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Ex. React, communication, Excel…"
                    disabled={busy}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="guest-bio">Présentation (optionnel)</Label>
                  <Textarea
                    id="guest-bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Quelques lignes sur votre parcours…"
                    disabled={busy}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="guest-letter">Lettre de motivation</Label>
                  <Textarea
                    id="guest-letter"
                    rows={4}
                    value={coverLetterText}
                    onChange={(e) => setCoverLetterText(e.target.value)}
                    placeholder="Votre motivation pour Yas Togo et ce poste…"
                    disabled={busy}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="guest-letter-file">
                    Lettre (fichier, optionnel)
                  </Label>
                  <input
                    id="guest-letter-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    disabled={busy}
                    onChange={(e) =>
                      setLetterFile(e.target.files?.[0] || null)
                    }
                    className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-yas-midnight hover:file:bg-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
              <Button
                variant="midnight"
                onClick={handleSubmit}
                disabled={busy}
                className="h-11 w-full rounded-xl text-base font-semibold"
              >
                {submitMutation.isPending
                  ? "Envoi en cours…"
                  : "Envoyer ma candidature"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
