"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ApiError,
  applicationsApi,
  fileUrl,
  interviewsApi,
  supervisionNotesApi,
  usersApi,
} from "@/lib/api";
import {
  APPLICATION_STATUS_LABELS,
  INTERVIEW_MODE_LABELS,
  RECOMMENDATION_LABELS,
  SUPERVISION_NOTE_TYPE_LABELS,
} from "@/lib/constants";
import type { InterviewMode } from "@/lib/types";
import { SoftCard, SoftStatusPill, statusTone } from "@/components/shared/soft-ui";
import { cn } from "@/lib/utils";

/**
 * `aiExtractedData.formations`/`experiences` sont censés être des tableaux de
 * texte (voir le prompt dans AiService.extractCv), mais rien ne garantit que
 * le modèle IA respecte ce format — il arrive qu'il renvoie des objets
 * structurés (ex. { nom, option, établissement, année_academique }). On
 * normalise donc chaque entrée en texte lisible avant de l'afficher, plutôt
 * que de rendre l'objet brut (ce que React refuse de faire).
 */
function formatExtractedEntry(entry: unknown): string {
  if (typeof entry === "string") return entry;
  if (entry && typeof entry === "object") {
    const o = entry as Record<string, unknown>;
    const parts = [
      o.nom ?? o.titre ?? o.poste,
      o.option,
      o.établissement ?? o.etablissement ?? o.entreprise,
      o.année_academique ?? o.annee_academique ?? o.periode ?? o.période,
    ].filter((p): p is string => typeof p === "string" && p.trim().length > 0);
    return parts.length > 0 ? parts.join(" — ") : JSON.stringify(o);
  }
  return String(entry);
}

export default function RhCandidatureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const applicationId = Number(id);
  const queryClient = useQueryClient();

  const [rejectNote, setRejectNote] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [confirmAction, setConfirmAction] = useState<"preselectionner" | "rejeter" | null>(null);

  const [interviewOpen, setInterviewOpen] = useState(false);
  const [supervisorId, setSupervisorId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [mode, setMode] = useState<InterviewMode>("distanciel");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");

  const [outcomeNotes, setOutcomeNotes] = useState("");

  const [docViewer, setDocViewer] = useState<"cv" | "coverLetter" | null>(null);
  const { data: docData, isLoading: docLoading } = useQuery({
    queryKey: ["application-document", applicationId, docViewer],
    queryFn: () => applicationsApi.document(applicationId, docViewer!),
    enabled: !!docViewer,
  });

  const { data: app, isLoading } = useQuery({
    queryKey: ["application", applicationId],
    queryFn: () => applicationsApi.get(applicationId),
  });

  const { data: supervisors } = useQuery({
    queryKey: ["users", "superviseur"],
    queryFn: () => usersApi.list("superviseur"),
  });

  const { data: reports } = useQuery({
    queryKey: ["supervision-notes", "application", applicationId],
    queryFn: () => supervisionNotesApi.list({ applicationId }),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
    queryClient.invalidateQueries({ queryKey: ["applications"] });
  }

  const transitionMutation = useMutation({
    mutationFn: ({ status, note }: { status: Parameters<typeof applicationsApi.updateStatus>[1]; note?: string }) =>
      applicationsApi.updateStatus(applicationId, status, { note }),
    onSuccess: () => {
      toast.success("Statut mis à jour");
      setRejectNote("");
      setConfirmAction(null);
      invalidate();
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Action impossible");
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: () => applicationsApi.notes.create(applicationId, noteContent.trim()),
    onSuccess: () => {
      setNoteContent("");
      toast.success("Note ajoutée");
      invalidate();
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Ajout impossible");
    },
  });

  const scheduleInterviewMutation = useMutation({
    mutationFn: () =>
      interviewsApi.create({
        applicationId,
        supervisorId: supervisorId ? Number(supervisorId) : undefined,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes,
        mode,
        location: mode === "presentiel" ? location.trim() : undefined,
        meetingLink: mode === "distanciel" ? meetingLink.trim() || undefined : undefined,
        notes: interviewNotes.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Entretien programmé");
      setInterviewOpen(false);
      setSupervisorId("");
      setScheduledAt("");
      setLocation("");
      setMeetingLink("");
      setInterviewNotes("");
      invalidate();
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Programmation impossible");
    },
  });

  const outcomeMutation = useMutation({
    mutationFn: (status: "termine" | "annule") =>
      interviewsApi.recordOutcome(app!.interview!.id, {
        status,
        notes: outcomeNotes.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Résultat enregistré");
      setOutcomeNotes("");
      invalidate();
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Enregistrement impossible");
    },
  });

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-slate-400">Chargement…</div>;
  }
  if (!app) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="font-heading text-lg font-semibold text-yas-midnight">
          Candidature introuvable
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/rh/candidatures">Retour aux candidatures</Link>
        </Button>
      </div>
    );
  }

  const name = app.user?.fullName || "Candidat";
  const extracted = app.profile?.aiExtractedData;
  const formations = extracted?.formations?.filter(Boolean) ?? [];
  const experiences = extracted?.experiences?.filter(Boolean) ?? [];
  const skills = app.profile?.skills
    ? app.profile.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div>
      <Link
        href={`/rh/candidatures${app.offerId ? `?offerId=${app.offerId}` : ""}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-yas-midnight"
      >
        <ArrowLeft className="size-4" />
        Retour aux candidatures
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-yas-midnight sm:text-2xl">
            {name}
          </h1>
          <p className="text-sm text-slate-500">
            Candidature pour « {app.offer?.title} »
          </p>
        </div>
        <SoftStatusPill tone={statusTone(app.status)}>
          {APPLICATION_STATUS_LABELS[app.status]}
        </SoftStatusPill>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Colonne principale */}
        <div className="space-y-5">
          <SoftCard>
            <h2 className="font-heading text-sm font-semibold text-yas-midnight">
              Candidat
            </h2>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="size-4 text-yas-sky" />
                {app.user?.email}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="size-4 text-yas-sky" />
                {app.user?.phone || "Non renseigné"}
              </div>
            </div>
            {app.profile?.bio && (
              <p className="mt-3 text-sm text-slate-600">{app.profile.bio}</p>
            )}
            {skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </SoftCard>

          <SoftCard>
            <h2 className="font-heading text-sm font-semibold text-yas-midnight">
              Formation &amp; expérience
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Extrait automatiquement du CV par l&apos;IA — non garanti exhaustif.
            </p>
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="flex items-center gap-1.5 font-medium text-slate-700">
                  <GraduationCap className="size-4 text-yas-sky" />
                  Formation
                </p>
                {formations.length > 0 ? (
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-slate-600">
                    {formations.map((f, i) => (
                      <li key={i}>{formatExtractedEntry(f)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-slate-400">Non renseigné</p>
                )}
              </div>
              <div>
                <p className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Briefcase className="size-4 text-yas-sky" />
                  Expérience
                </p>
                {experiences.length > 0 ? (
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-slate-600">
                    {experiences.map((e, i) => (
                      <li key={i}>{formatExtractedEntry(e)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-slate-400">Non renseigné</p>
                )}
              </div>
            </div>
          </SoftCard>

          {app.coverLetterText && (
            <SoftCard>
              <h2 className="font-heading text-sm font-semibold text-yas-midnight">
                Lettre de motivation
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                {app.coverLetterText}
              </p>
            </SoftCard>
          )}

          <SoftCard>
            <h2 className="font-heading text-sm font-semibold text-yas-midnight">
              Notes internes RH
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Jamais visibles du candidat.
            </p>
            <div className="mt-3 flex gap-2">
              <Textarea
                rows={2}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Ajouter une appréciation…"
                className="text-sm"
              />
              <Button
                variant="midnight"
                className="h-auto shrink-0 rounded-xl"
                disabled={noteContent.trim().length < 2 || addNoteMutation.isPending}
                onClick={() => addNoteMutation.mutate()}
              >
                Ajouter
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {app.notes.length === 0 && (
                <p className="text-sm text-slate-400">Aucune note pour l&apos;instant.</p>
              )}
              {app.notes.map((n) => (
                <div key={n.id} className="rounded-xl bg-slate-50/80 p-3 text-sm">
                  <p className="text-slate-700">{n.content}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {n.author?.fullName || n.author?.email} —{" "}
                    {new Date(n.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>
          </SoftCard>

          <SoftCard>
            <h2 className="font-heading text-sm font-semibold text-yas-midnight">
              Historique
            </h2>
            <div className="mt-3 space-y-3">
              {app.statusHistory.map((h) => (
                <div key={h.id} className="flex gap-3 text-sm">
                  <div className="mt-1 size-2 shrink-0 rounded-full bg-yas-sky" />
                  <div>
                    <p className="text-slate-700">
                      <span className="font-medium">
                        {APPLICATION_STATUS_LABELS[h.status]}
                      </span>{" "}
                      — {h.changer?.fullName || h.changer?.email || "Système"}
                    </p>
                    {h.note && (
                      <p className="text-slate-500">Motif : {h.note}</p>
                    )}
                    <p className="text-xs text-slate-400">
                      {new Date(h.changedAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SoftCard>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-5">
          <SoftCard>
            <h2 className="font-heading text-sm font-semibold text-yas-midnight">
              Actions
            </h2>
            <div className="mt-3 space-y-2">
              {app.status === "en_cours_analyse" && (
                <Button
                  variant="midnight"
                  className="w-full rounded-xl"
                  disabled={transitionMutation.isPending}
                  onClick={() => setConfirmAction("preselectionner")}
                >
                  Présélectionner
                </Button>
              )}
              {app.status === "preselectionnee" && (
                <Button
                  variant="midnight"
                  className="w-full rounded-xl"
                  onClick={() => setInterviewOpen(true)}
                >
                  Programmer un entretien
                </Button>
              )}
              {app.status === "entretien_programme" && app.interview && (
                <div className="space-y-2 rounded-xl bg-slate-50/80 p-3">
                  <p className="text-sm font-medium text-slate-700">
                    Entretien le{" "}
                    {new Date(app.interview.scheduledAt).toLocaleString("fr-FR")}
                  </p>
                  <Textarea
                    rows={2}
                    value={outcomeNotes}
                    onChange={(e) => setOutcomeNotes(e.target.value)}
                    placeholder="Notes sur l'entretien (optionnel)"
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="midnight"
                      className="flex-1 rounded-xl"
                      disabled={outcomeMutation.isPending}
                      onClick={() => outcomeMutation.mutate("termine")}
                    >
                      Marquer réalisé
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      disabled={outcomeMutation.isPending}
                      onClick={() => outcomeMutation.mutate("annule")}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
              {app.status === "entretien_realise" && (
                <Button
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-600/90"
                  disabled={transitionMutation.isPending}
                  onClick={() =>
                    window.confirm(`Retenir définitivement ${name} ?`) &&
                    transitionMutation.mutate({ status: "acceptee" })
                  }
                >
                  Retenir définitivement
                </Button>
              )}

              {["en_cours_analyse", "preselectionnee", "entretien_programme", "entretien_realise"].includes(
                app.status
              ) && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <Textarea
                    rows={2}
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Motif du rejet (optionnel)"
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
                    disabled={transitionMutation.isPending}
                    onClick={() => setConfirmAction("rejeter")}
                  >
                    Rejeter la candidature
                  </Button>
                </div>
              )}

              {(app.status === "acceptee" || app.status === "rejetee") && (
                <p className="text-sm text-slate-400">
                  Dossier clos — aucune action supplémentaire.
                </p>
              )}
            </div>
          </SoftCard>

          {app.aiMatchScore != null && (
            <SoftCard>
              <h2 className="flex items-center gap-1.5 font-heading text-sm font-semibold text-yas-midnight">
                <Sparkles className="size-4 text-yas-sky" />
                Analyse IA
              </h2>
              <p className="mt-2 text-2xl font-bold text-yas-midnight">
                {app.aiMatchScore}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </p>
              {app.aiSummary && (
                <p className="mt-2 text-sm text-slate-600">{app.aiSummary}</p>
              )}
              {app.aiAnalysisData?.recommendation && (
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Recommandation : {app.aiAnalysisData.recommendation}
                </p>
              )}
            </SoftCard>
          )}

          <SoftCard>
            <h2 className="font-heading text-sm font-semibold text-yas-midnight">
              Documents
            </h2>
            <div className="mt-3 space-y-2">
              {app.cvUrl ? (
                <button
                  type="button"
                  onClick={() => setDocViewer("cv")}
                  className="flex w-full items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-left text-sm text-yas-midnight hover:bg-slate-100"
                >
                  <FileText className="size-4 shrink-0 text-yas-sky" />
                  Lire le CV
                </button>
              ) : (
                <p className="text-sm text-slate-400">Aucun CV joint.</p>
              )}
              {app.coverLetterUrl && (
                <button
                  type="button"
                  onClick={() => setDocViewer("coverLetter")}
                  className="flex w-full items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-left text-sm text-yas-midnight hover:bg-slate-100"
                >
                  <FileText className="size-4 shrink-0 text-yas-sky" />
                  Lire la lettre de motivation (fichier)
                </button>
              )}
              {app.documentsUrls &&
                Object.entries(app.documentsUrls).map(([name, url]) => (
                  <a
                    key={name}
                    href={fileUrl(url) || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-left text-sm text-yas-midnight hover:bg-slate-100"
                  >
                    <FileText className="size-4 shrink-0 text-yas-sky" />
                    {name}
                  </a>
                ))}
            </div>
          </SoftCard>

          {reports && reports.length > 0 && (
            <SoftCard>
              <h2 className="font-heading text-sm font-semibold text-yas-midnight">
                Rapports
              </h2>
              <div className="mt-3 space-y-2">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-yas-midnight">
                        {SUPERVISION_NOTE_TYPE_LABELS[report.type]}
                      </span>
                      {report.recommendation && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {RECOMMENDATION_LABELS[report.recommendation]}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {report.author?.fullName || report.author?.email} —{" "}
                      {new Date(report.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    {report.fichierRapport ? (
                      <a
                        href={fileUrl(report.fichierRapport) || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-yas-midnight hover:underline"
                      >
                        <Download className="size-3.5" />
                        Télécharger
                      </a>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400">
                        Rapport en cours de génération.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </SoftCard>
          )}
        </div>
      </div>

      <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Programmer un entretien</DialogTitle>
            <DialogDescription>Pour {name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Superviseur (optionnel)</Label>
              <Select value={supervisorId} onValueChange={setSupervisorId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choisir un superviseur" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors?.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.fullName || s.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="interview-date">
                  <Calendar className="mr-1 inline size-3.5" />
                  Date et heure
                </Label>
                <Input
                  id="interview-date"
                  type="datetime-local"
                  className="rounded-xl"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interview-duration">Durée (min)</Label>
                <Input
                  id="interview-duration"
                  type="number"
                  min={5}
                  max={480}
                  className="rounded-xl"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as InterviewMode)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INTERVIEW_MODE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {mode === "presentiel" ? (
              <div className="space-y-2">
                <Label htmlFor="interview-location">
                  <MapPin className="mr-1 inline size-3.5" />
                  Lieu
                </Label>
                <Input
                  id="interview-location"
                  className="rounded-xl"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="interview-link">Lien visio (optionnel)</Label>
                <Input
                  id="interview-link"
                  className="rounded-xl"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="interview-notes">Notes (optionnel)</Label>
              <Textarea
                id="interview-notes"
                rows={2}
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="midnight"
              className="rounded-xl"
              disabled={
                !scheduledAt ||
                (mode === "presentiel" && !location.trim()) ||
                scheduleInterviewMutation.isPending
              }
              onClick={() => scheduleInterviewMutation.mutate()}
            >
              {scheduleInterviewMutation.isPending ? "Programmation…" : "Programmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!docViewer} onOpenChange={(open) => !open && setDocViewer(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {docViewer === "cv" ? "CV" : "Lettre de motivation"} — {name}
            </DialogTitle>
          </DialogHeader>
          {docLoading && (
            <p className="py-10 text-center text-sm text-slate-400">Chargement…</p>
          )}
          {!docLoading && docData?.extension === "pdf" && (
            <iframe
              src={fileUrl(docData.url) || undefined}
              className="h-[75vh] w-full rounded-lg border border-slate-200"
              title={docViewer === "cv" ? "CV" : "Lettre de motivation"}
            />
          )}
          {!docLoading && docData && docData.extension !== "pdf" && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">
                Aperçu texte — la mise en forme originale (.{docData.extension}) n&apos;est
                pas conservée.
              </p>
              <div className="max-h-[65vh] overflow-y-auto whitespace-pre-line rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-700">
                {docData.text?.trim() || "Aucun texte n'a pu être extrait de ce fichier."}
              </div>
              <a
                href={fileUrl(docData.url) || undefined}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs font-medium text-yas-midnight underline"
              >
                Télécharger le fichier original
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="items-center text-center">
            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-full",
                confirmAction === "rejeter" ? "bg-destructive/10" : "bg-yas-sky/15"
              )}
            >
              {confirmAction === "rejeter" ? (
                <XCircle className="size-6 text-destructive" />
              ) : (
                <CheckCircle2 className="size-6 text-yas-sky" />
              )}
            </div>
            <DialogTitle>
              {confirmAction === "rejeter" ? "Confirmer le rejet" : "Confirmer la présélection"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "rejeter"
                ? "Êtes-vous sûr de vouloir rejeter cette candidature ?"
                : "Êtes-vous sûr de vouloir présélectionner cette candidature ?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={transitionMutation.isPending}
              onClick={() => setConfirmAction(null)}
            >
              Annuler
            </Button>
            <Button
              variant={confirmAction === "rejeter" ? "destructive" : "midnight"}
              className="rounded-xl"
              disabled={transitionMutation.isPending}
              onClick={() =>
                confirmAction === "rejeter"
                  ? transitionMutation.mutate({
                      status: "rejetee",
                      note: rejectNote.trim() || undefined,
                    })
                  : transitionMutation.mutate({ status: "preselectionnee" })
              }
            >
              {transitionMutation.isPending
                ? "Traitement…"
                : confirmAction === "rejeter"
                  ? "Rejeter la candidature"
                  : "Présélectionner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
