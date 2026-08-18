"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { OfferDocumentRequirement } from "@/lib/types";

/**
 * Édite la liste structurée des documents complémentaires exigés pour une
 * offre (nom, obligatoire/facultatif, description) — CV et Lettre de
 * motivation restent universels et gérés séparément, jamais dans cette
 * liste. Le formulaire de candidature construit ses champs directement à
 * partir de cette structure.
 */
export function DocumentRequirementsEditor({
  value,
  onChange,
}: {
  value: OfferDocumentRequirement[];
  onChange: (next: OfferDocumentRequirement[]) => void;
}) {
  function addRow() {
    onChange([...value, { nom: "", obligatoire: true, description: "" }]);
  }

  function updateRow(index: number, patch: Partial<OfferDocumentRequirement>) {
    onChange(value.map((doc, i) => (i === index ? { ...doc, ...patch } : doc)));
  }

  function removeRow(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-xs text-slate-400">
          Aucun document complémentaire — CV et Lettre de motivation restent
          exigés par défaut pour toutes les offres.
        </p>
      )}

      {value.map((doc, i) => (
        <div
          key={i}
          className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
        >
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              <Input
                value={doc.nom}
                onChange={(e) => updateRow(i, { nom: e.target.value })}
                placeholder="Nom du document (ex. Diplôme)"
                className="rounded-lg bg-white"
              />
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <Checkbox
                  checked={doc.obligatoire}
                  onCheckedChange={(c) => updateRow(i, { obligatoire: c === true })}
                />
                {doc.obligatoire ? "Obligatoire" : "Facultative"}
              </label>
              <Input
                value={doc.description ?? ""}
                onChange={(e) => updateRow(i, { description: e.target.value })}
                placeholder="Description / instruction (optionnel)"
                className="rounded-lg bg-white text-sm"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRow(i)}
              aria-label={`Retirer ${doc.nom || "ce document"}`}
              className="mt-1 shrink-0 text-slate-400 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addRow}
        className="gap-2 rounded-xl border-slate-200"
      >
        <Plus className="size-4" />
        Ajouter un document
      </Button>
    </div>
  );
}
