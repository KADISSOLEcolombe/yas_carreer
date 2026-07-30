"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ApiError, authApi, applicationsApi, fileUrl } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export default function CandidatProfilPage() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const { data } = useQuery({ queryKey: ["auth", "me"], queryFn: authApi.me });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    if (data) {
      setFullName(data.user.fullName || "");
      setPhone(data.user.phone || "");
      setBio(data.profile?.bio || "");
      setSkills(data.profile?.skills || "");
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: () => authApi.updateProfile({ fullName, phone, bio, skills }),
    onSuccess: (result) => {
      setUser(result.user);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Profil mis à jour !");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Erreur");
    },
  });

  const extractCvMutation = useMutation({
    mutationFn: () => {
      if (!cvFile) throw new Error("Aucun fichier sélectionné");
      return applicationsApi.extractCv(cvFile);
    },
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      if (profile.bio) setBio(profile.bio);
      if (profile.skills) setSkills(profile.skills);
      toast.success("CV analysé et profil enrichi par l'IA !");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Analyse impossible");
    },
  });

  const cvUrl = fileUrl(data?.profile?.cvUrl);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-yas-midnight">
          Mon profil
        </h1>
        <p className="text-muted-foreground">
          Complétez vos informations pour de meilleures candidatures.
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
            <Label htmlFor="skills">Compétences (séparées par des virgules)</Label>
            <Textarea
              id="skills"
              rows={2}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
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
            CV &amp; analyse IA
          </CardTitle>
          <CardDescription>
            Importez votre CV : l&apos;IA extrait automatiquement votre bio et vos
            compétences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {cvUrl && (
            <a
              href={cvUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-yas-midnight underline"
            >
              Voir mon CV actuel
            </a>
          )}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
          <Button
            variant="outline"
            onClick={() => extractCvMutation.mutate()}
            disabled={!cvFile || extractCvMutation.isPending}
            className="gap-2"
          >
            {extractCvMutation.isPending ? (
              <>
                <UploadCloud className="size-4 animate-pulse" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Analyser avec l&apos;IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
