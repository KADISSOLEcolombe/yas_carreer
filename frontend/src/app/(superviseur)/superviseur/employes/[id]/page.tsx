"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Building2, CalendarClock, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ApiError, emploisApi, supervisionNotesApi } from "@/lib/api";
import { CONTRACT_TYPE_LABELS, EMPLOI_STATUS_LABELS } from "@/lib/constants";

export default function SuperviseurEmployeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const emploiId = Number(id);
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: emplois } = useQuery({
    queryKey: ["emplois", "me"],
    queryFn: emploisApi.me,
  });
  const emploi = emplois?.find((e) => e.id === emploiId);

  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ["supervision-notes", emploiId],
    queryFn: () => supervisionNotesApi.list(emploiId),
    enabled: Boolean(emploiId),
  });

  const createNoteMutation = useMutation({
    mutationFn: () =>
      supervisionNotesApi.create({
        emploiId,
        type: "rapport",
        title: title.trim() || undefined,
        content: content.trim(),
      }),
    onSuccess: () => {
      toast.success("Entrée de suivi ajoutée");
      setTitle("");
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["supervision-notes", emploiId] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Erreur lors de l'ajout");
    },
  });

  function handleSubmit() {
    if (content.trim().length < 2) {
      toast.error("Ajoutez un contenu pour cette entrée");
      return;
    }
    createNoteMutation.mutate();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/superviseur/employes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-yas-midnight"
      >
        <ArrowLeft className="size-4" />
        Mes collaborateurs
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold text-yas-midnight">
          {emploi?.user?.fullName || emploi?.user?.email || "Collaborateur"}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {emploi && (
            <>
              <Badge>{CONTRACT_TYPE_LABELS[emploi.contractType]}</Badge>
              <Badge variant="outline">{EMPLOI_STATUS_LABELS[emploi.status]}</Badge>
              {emploi.department && (
                <span className="inline-flex items-center gap-1">
                  <Building2 className="size-4 text-yas-sky" />
                  {emploi.department}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-4 text-yas-sky" />
                Depuis le {new Date(emploi.startDate).toLocaleDateString("fr-FR")}
                {emploi.endDate &&
                  ` — jusqu'au ${new Date(emploi.endDate).toLocaleDateString("fr-FR")}`}
              </span>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg text-yas-midnight">
            Nouvelle entrée de suivi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="note-title">Titre (optionnel)</Label>
            <Input id="note-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note-content">Contenu</Label>
            <Textarea
              id="note-content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Observations, progrès, points d'attention…"
            />
          </div>
          <Button onClick={handleSubmit} disabled={createNoteMutation.isPending}>
            {createNoteMutation.isPending ? "Ajout…" : "Ajouter au suivi"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-yas-midnight">
          Historique du suivi
        </h2>
        {notesLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}
        {!notesLoading && notes?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucune entrée de suivi pour le moment.
            </CardContent>
          </Card>
        )}
        {notes?.map((note) => (
          <Card key={note.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
              <div className="flex items-center gap-2">
                {note.title && (
                  <CardTitle className="text-base text-yas-midnight">{note.title}</CardTitle>
                )}
              </div>
              {note.rating != null && (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-yas-midnight">
                  <Star className="size-4 fill-yas-yellow text-yas-yellow" />
                  {note.rating}/5
                </span>
              )}
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm text-foreground/85">{note.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(note.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
