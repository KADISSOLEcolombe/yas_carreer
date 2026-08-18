"use client";

import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
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
import { departementsApi } from "@/lib/api";
import type { OfferDocumentRequirement, OfferStatus, OfferType } from "@/lib/types";
import { getSuggestedSkills } from "@/lib/departement-skills";
import { SkillsTagInput } from "@/components/shared/skills-tag-input";
import { DocumentRequirementsEditor } from "@/components/shared/document-requirements-editor";
import { cn } from "@/lib/utils";

export type OfferFormValues = {
  title: string;
  type: OfferType;
  description: string;
  requirements: string;
  deadline: string;
  location: string;
  status: OfferStatus;
  documentsRequis: OfferDocumentRequirement[];
  departementId: string;
};

export const EMPTY_OFFER_FORM: OfferFormValues = {
  title: "",
  type: "emploi",
  description: "",
  requirements: "",
  deadline: "",
  location: "",
  status: "brouillon",
  documentsRequis: [],
  departementId: "",
};

export type AiFilledMap = Partial<Record<keyof OfferFormValues, boolean>>;

export function isOfferFormValid(form: OfferFormValues) {
  return (
    form.title.trim().length >= 3 &&
    form.description.trim().length >= 20 &&
    form.departementId.trim().length > 0
  );
}

function FieldHint({ active }: { active?: boolean }) {
  if (!active) return null;
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-yas-sky/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-yas-midnight">
      <Sparkles className="size-2.5" />
      IA
    </span>
  );
}

export function OfferFieldsForm({
  form,
  onChange,
  aiFilled,
  touched,
  onTouch,
}: {
  form: OfferFormValues;
  onChange: (patch: Partial<OfferFormValues>) => void;
  aiFilled?: AiFilledMap;
  touched: { title?: boolean; description?: boolean; departement?: boolean };
  onTouch: (field: "title" | "description" | "departement") => void;
}) {
  const { data: departements } = useQuery({
    queryKey: ["departements"],
    queryFn: departementsApi.list,
  });

  const titleError = form.title.trim().length < 3;
  const descriptionError = form.description.trim().length < 20;
  const departementError = form.departementId.trim().length === 0;
  const selectedDepartement = (departements ?? []).find(
    (d) => String(d.id) === form.departementId
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="offer-title">
          Titre
          <FieldHint active={aiFilled?.title} />
        </Label>
        <Input
          id="offer-title"
          className={cn("rounded-xl", aiFilled?.title && "ring-1 ring-yas-sky/40")}
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          onBlur={() => onTouch("title")}
          placeholder="Ex. Stage — Développement Web"
        />
        {touched.title && titleError && (
          <p className="text-xs text-destructive">
            Le titre doit contenir au moins 3 caractères.
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>
            Type
            <FieldHint active={aiFilled?.type} />
          </Label>
          <Select
            value={form.type}
            onValueChange={(v) => onChange({ type: v as OfferType })}
          >
            <SelectTrigger
              className={cn("rounded-xl", aiFilled?.type && "ring-1 ring-yas-sky/40")}
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
            onValueChange={(v) => onChange({ status: v as OfferStatus })}
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

      <div className="space-y-2">
        <Label htmlFor="offer-departement">Département</Label>
        <Select
          value={form.departementId}
          onValueChange={(v) => {
            onChange({ departementId: v });
            onTouch("departement");
          }}
        >
          <SelectTrigger id="offer-departement" className="rounded-xl">
            <SelectValue placeholder="Sélectionner un département" />
          </SelectTrigger>
          <SelectContent>
            {(departements ?? []).map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {touched.departement && departementError && (
          <p className="text-xs text-destructive">
            Le département est obligatoire.
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="offer-location">
            Lieu
            <FieldHint active={aiFilled?.location} />
          </Label>
          <Input
            id="offer-location"
            className={cn("rounded-xl", aiFilled?.location && "ring-1 ring-yas-sky/40")}
            value={form.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="Lomé"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="offer-deadline">
            Date limite
            <FieldHint active={aiFilled?.deadline} />
          </Label>
          <Input
            id="offer-deadline"
            type="date"
            className={cn("rounded-xl", aiFilled?.deadline && "ring-1 ring-yas-sky/40")}
            value={form.deadline}
            onChange={(e) => onChange({ deadline: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="offer-description">
          Description
          <FieldHint active={aiFilled?.description} />
        </Label>
        <Textarea
          id="offer-description"
          rows={7}
          className={cn("rounded-xl", aiFilled?.description && "ring-1 ring-yas-sky/40")}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          onBlur={() => onTouch("description")}
          placeholder="À propos, missions, profil…"
        />
        {touched.description && descriptionError && (
          <p className="text-xs text-destructive">
            La description doit contenir au moins 20 caractères.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="offer-requirements">
          Compétences
          <FieldHint active={aiFilled?.requirements} />
        </Label>
        <SkillsTagInput
          id="offer-requirements"
          value={form.requirements}
          onChange={(v) => onChange({ requirements: v })}
          suggestions={getSuggestedSkills(selectedDepartement?.nom)}
        />
      </div>

      <div className="space-y-2">
        <Label>Documents requis pour cette offre</Label>
        <p className="text-xs text-slate-400">
          CV et Lettre de motivation restent exigés automatiquement pour
          toutes les offres. Ajoutez ici les documents complémentaires
          propres à cette offre (diplôme, certification…), en précisant s&apos;ils
          sont obligatoires ou facultatifs.
        </p>
        <DocumentRequirementsEditor
          value={form.documentsRequis}
          onChange={(v) => onChange({ documentsRequis: v })}
        />
      </div>
    </div>
  );
}
