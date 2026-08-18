"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Briefcase,
  CalendarClock,
  FileText,
  MapPin,
  Link as LinkIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { applicationsApi, fileUrl } from "@/lib/api";
import { APPLICATION_STATUS_LABELS, INTERVIEW_MODE_LABELS, INTERVIEW_STATUS_LABELS } from "@/lib/constants";

export default function SuperviseurCandidatureDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const applicationId = Number(id);
  const router = useRouter();

  const { data: application, isLoading } = useQuery({
    queryKey: ["applications", "superviseur", applicationId],
    queryFn: () => applicationsApi.getForSupervisor(applicationId),
    enabled: Boolean(applicationId),
  });

  const profile = application?.profile;
  const skills = profile?.skills
    ? profile.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-yas-midnight"
      >
        <ArrowLeft className="size-4" />
        Retour
      </button>

      {isLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}

      {application && (
        <>
          <div>
            <h1 className="font-heading text-2xl font-bold text-yas-midnight">
              {application.user?.fullName || application.user?.email}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {application.offer?.title && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="size-4 text-yas-sky" />
                  {application.offer.title}
                </span>
              )}
              <Badge variant="outline">{APPLICATION_STATUS_LABELS[application.status]}</Badge>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-yas-midnight">Candidat</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Email : </span>
                {application.user?.email}
              </p>
              <p>
                <span className="text-muted-foreground">Téléphone : </span>
                {application.user?.phone || "—"}
              </p>
              {profile?.ville && (
                <p>
                  <span className="text-muted-foreground">Ville : </span>
                  {profile.ville}
                  {profile.quartier ? ` — ${profile.quartier}` : ""}
                </p>
              )}
              {profile?.anneesEtude && (
                <p>
                  <span className="text-muted-foreground">Niveau d&apos;étude : </span>
                  {profile.anneesEtude}
                </p>
              )}
            </CardContent>
          </Card>

          {profile?.bio || skills.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-yas-midnight">Profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {profile?.bio && <p className="text-foreground/85">{profile.bio}</p>}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-yas-midnight">Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {application.cvUrl && (
                <a
                  href={fileUrl(application.cvUrl) || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm text-yas-midnight hover:bg-slate-100"
                >
                  <FileText className="size-4 shrink-0 text-yas-sky" />
                  CV
                </a>
              )}
              {application.coverLetterUrl && (
                <a
                  href={fileUrl(application.coverLetterUrl) || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm text-yas-midnight hover:bg-slate-100"
                >
                  <FileText className="size-4 shrink-0 text-yas-sky" />
                  Lettre de motivation
                </a>
              )}
              {application.documentsUrls &&
                Object.entries(application.documentsUrls).map(([name, url]) => (
                  <a
                    key={name}
                    href={fileUrl(url) || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm text-yas-midnight hover:bg-slate-100"
                  >
                    <FileText className="size-4 shrink-0 text-yas-sky" />
                    {name}
                  </a>
                ))}
              {!application.cvUrl &&
                !application.coverLetterUrl &&
                !(application.documentsUrls && Object.keys(application.documentsUrls).length > 0) && (
                  <p className="text-sm text-slate-400">Aucun document disponible.</p>
                )}
            </CardContent>
          </Card>

          {application.interview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-yas-midnight">Entretien</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-yas-sky" />
                  {new Date(application.interview.scheduledAt).toLocaleString("fr-FR", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
                <p className="text-muted-foreground">
                  Durée : {application.interview.durationMinutes} min ·{" "}
                  {INTERVIEW_STATUS_LABELS[application.interview.status]}
                </p>
                <p className="text-muted-foreground">
                  Mode : {INTERVIEW_MODE_LABELS[application.interview.mode]}
                </p>
                {application.interview.mode === "presentiel" && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4 text-yas-sky" />
                    Lieu : {application.interview.location || "Non renseigné"}
                  </p>
                )}
                {application.interview.mode === "distanciel" && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <LinkIcon className="size-4 text-yas-sky" />
                    {application.interview.meetingLink ? (
                      <a
                        href={application.interview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-yas-midnight underline"
                      >
                        Rejoindre l&apos;entretien
                      </a>
                    ) : (
                      "Lien non renseigné"
                    )}
                  </p>
                )}
                {application.interview.notes && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Notes de programmation
                    </p>
                    <p className="mt-1 whitespace-pre-line text-muted-foreground">
                      {application.interview.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
