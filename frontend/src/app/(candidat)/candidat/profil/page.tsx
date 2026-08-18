"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, Trash2, UploadCloud } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SkillsTagInput } from "@/components/shared/skills-tag-input";
import { ApiError, authApi, candidateDocumentsApi, fileUrl } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { NIVEAU_ETUDE_OPTIONS } from "@/lib/constants";

export default function CandidatProfilPage() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const { data } = useQuery({ queryKey: ["auth", "me"], queryFn: authApi.me });
  const { data: documents } = useQuery({
    queryKey: ["candidate-documents"],
    queryFn: candidateDocumentsApi.list,
  });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [anneesEtude, setAnneesEtude] = useState("");
  const [ville, setVille] = useState("");
  const [quartier, setQuartier] = useState("");
  const [docLabel, setDocLabel] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docInputKey, setDocInputKey] = useState(0);

  useEffect(() => {
    if (data) {
      setFullName(data.user.fullName || "");
      setPhone(data.user.phone || "");
      setBio(data.profile?.bio || "");
      setSkills(data.profile?.skills || "");
      setAnneesEtude(data.profile?.anneesEtude || "");
      setVille(data.profile?.ville || "");
      setQuartier(data.profile?.quartier || "");
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      authApi.updateProfile({ fullName, phone, bio, skills, anneesEtude, ville, quartier }),
    onSuccess: (result) => {
      setUser(result.user);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Profil mis à jour !");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Erreur");
    },
  });

  const addDocumentMutation = useMutation({
    mutationFn: () => {
      if (!docFile || !docLabel.trim()) throw new Error("Libellé et fichier requis");
      return candidateDocumentsApi.create(docLabel.trim(), docFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-documents"] });
      setDocLabel("");
      setDocFile(null);
      setDocInputKey((k) => k + 1);
      toast.success("Document ajouté !");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Envoi impossible");
    },
  });

  const removeDocumentMutation = useMutation({
    mutationFn: (id: number) => candidateDocumentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-documents"] });
      toast.success("Document supprimé");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Suppression impossible");
    },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-yas-midnight">
          Mon profil
        </h1>
        <p className="text-muted-foreground">
          Votre dossier permanent : informations et documents réutilisables
          pour toutes vos candidatures.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg text-yas-midnight">
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Compétences</Label>
            <SkillsTagInput id="skills" value={skills} onChange={setSkills} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anneesEtude">Niveau d&apos;étude</Label>
            <Select value={anneesEtude} onValueChange={setAnneesEtude}>
              <SelectTrigger id="anneesEtude">
                <SelectValue placeholder="Sélectionner un niveau" />
              </SelectTrigger>
              <SelectContent>
                {NIVEAU_ETUDE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <Input id="ville" value={ville} onChange={(e) => setVille(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quartier">Quartier (optionnel)</Label>
              <Input
                id="quartier"
                value={quartier}
                onChange={(e) => setQuartier(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="bg-yas-yellow text-yas-midnight hover:bg-yas-yellow/90"
          >
            {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg text-yas-midnight">
            Mes documents
          </CardTitle>
          <CardDescription>
            CV, diplômes, certifications, attestations, lettres de
            motivation… Ajoutez-en autant que vous voulez (plusieurs CV selon
            les métiers visés, par exemple). Format PDF uniquement. À chaque
            candidature, vous choisirez lesquels utiliser — rien n&apos;est
            réutilisé automatiquement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {(documents ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aucun document ajouté pour l&apos;instant.
              </p>
            )}
            {(documents ?? []).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm"
              >
                <a
                  href={fileUrl(doc.url) || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-2 text-yas-midnight hover:underline"
                >
                  <FileText className="size-4 shrink-0 text-yas-sky" />
                  <span className="truncate">{doc.label}</span>
                </a>
                <button
                  type="button"
                  onClick={() => removeDocumentMutation.mutate(doc.id)}
                  disabled={removeDocumentMutation.isPending}
                  className="shrink-0 text-slate-400 hover:text-destructive"
                  aria-label={`Supprimer ${doc.label}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Libellé (ex. CV Développement Web)"
              value={docLabel}
              onChange={(e) => setDocLabel(e.target.value)}
              className="sm:max-w-xs"
            />
            <input
              key={docInputKey}
              type="file"
              accept=".pdf"
              onChange={(e) => setDocFile(e.target.files?.[0] || null)}
              className="block flex-1 text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
            <Button
              variant="outline"
              onClick={() => addDocumentMutation.mutate()}
              disabled={
                !docFile || !docLabel.trim() || addDocumentMutation.isPending
              }
              className="shrink-0 gap-2"
            >
              <UploadCloud className="size-4" />
              {addDocumentMutation.isPending ? "Envoi..." : "Ajouter"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
