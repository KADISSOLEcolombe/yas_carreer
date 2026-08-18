"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star } from "lucide-react";
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
import { ApiError, supervisionNotesApi } from "@/lib/api";
import { RECOMMENDATION_LABELS } from "@/lib/constants";
import type { SupervisionNote, SupervisionNoteRecommendation } from "@/lib/types";

export function InterviewEvaluationDialog({
  applicationId,
  candidateName,
  offerTitle,
  existingNote,
  open,
  onOpenChange,
}: {
  applicationId: number;
  candidateName: string;
  offerTitle: string;
  /** Si présent, affiche l'évaluation déjà envoyée en lecture seule. */
  existingNote?: SupervisionNote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState("");
  const [recommendation, setRecommendation] = useState<SupervisionNoteRecommendation | "">("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setRating("");
    setRecommendation("");
    setContent("");
  }, [open]);

  const submitMutation = useMutation({
    mutationFn: () =>
      supervisionNotesApi.create({
        applicationId,
        type: "evaluation",
        title: title.trim() || undefined,
        content: content.trim(),
        rating: rating ? Number(rating) : undefined,
        recommendation: recommendation || undefined,
      }),
    onSuccess: () => {
      toast.success("Évaluation envoyée");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["supervision-notes"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Erreur lors de l'envoi");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {existingNote ? "Évaluation d'entretien" : "Faire l'évaluation"}
          </DialogTitle>
          <DialogDescription>
            {candidateName} — {offerTitle}
          </DialogDescription>
        </DialogHeader>

        {existingNote ? (
          <div className="space-y-3 text-sm">
            {existingNote.title && (
              <p className="font-medium text-yas-midnight">{existingNote.title}</p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              {existingNote.rating != null && (
                <span className="inline-flex items-center gap-1 font-medium text-yas-midnight">
                  <Star className="size-4 fill-yas-yellow text-yas-yellow" />
                  {existingNote.rating}/5
                </span>
              )}
              {existingNote.recommendation && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {RECOMMENDATION_LABELS[existingNote.recommendation]}
                </span>
              )}
            </div>
            <p className="whitespace-pre-line text-foreground/85">{existingNote.content}</p>
            <p className="text-xs text-slate-400">
              Envoyée le{" "}
              {new Date(existingNote.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              — cette évaluation n&apos;est plus modifiable.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="eval-title">Appréciation</Label>
                <Input
                  id="eval-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex. Bon profil technique"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Note</Label>
                <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Aucune note" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}/5
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Recommandation</Label>
              <Select
                value={recommendation}
                onValueChange={(v) => setRecommendation(v as SupervisionNoteRecommendation)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choisir une recommandation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="favorable">Favorable</SelectItem>
                  <SelectItem value="a_revoir">À revoir</SelectItem>
                  <SelectItem value="defavorable">Défavorable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="eval-content">Commentaire</Label>
              <Textarea
                id="eval-content"
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Compte-rendu de l'entretien, points forts, réserves…"
              />
            </div>
            <p className="text-xs text-slate-400">
              Une fois envoyée, l&apos;évaluation ne sera plus modifiable.
            </p>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (content.trim().length < 2) {
                    toast.error("Ajoutez un commentaire pour cette évaluation");
                    return;
                  }
                  submitMutation.mutate();
                }}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? "Envoi…" : "Envoyer l'évaluation"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
