"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

/**
 * Édite une liste de compétences sous forme de tags, tout en gardant le même
 * format de stockage que partout ailleurs dans l'app (texte séparé par des
 * virgules) — nécessaire pour rester compatible avec `splitSkills()` /
 * le matching offres-candidat, qui lisent ce champ tel quel.
 */
function parseSkills(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function SkillsTagInput({
  id,
  value,
  onChange,
  placeholder = "Ajouter une compétence…",
  suggestions,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Compétences suggérées (ex. par département) ; cliquer les ajoute directement. */
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");
  const skills = parseSkills(value);

  function commit(next: string[]) {
    onChange(next.join(", "));
  }

  function addSkill(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    commit([...skills, trimmed]);
    setDraft("");
  }

  function removeSkill(index: number) {
    commit(skills.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(draft);
    } else if (e.key === "Backspace" && draft === "" && skills.length > 0) {
      removeSkill(skills.length - 1);
    }
  }

  const remainingSuggestions = (suggestions ?? []).filter(
    (s) => !skills.some((sk) => sk.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-1.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        {skills.map((skill, i) => (
          <span
            key={`${skill}-${i}`}
            className="inline-flex items-center gap-1 rounded-full bg-yas-sky/15 py-1 pl-2.5 pr-1.5 text-xs font-medium text-yas-midnight"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(i)}
              aria-label={`Retirer ${skill}`}
              className="rounded-full p-0.5 text-yas-midnight/50 transition hover:bg-yas-midnight/10 hover:text-yas-midnight"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addSkill(draft)}
          placeholder={skills.length === 0 ? placeholder : ""}
          className="min-w-[8rem] flex-1 border-0 bg-transparent p-0.5 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {remainingSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">Suggestions :</span>
          {remainingSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addSkill(s)}
              className="rounded-full border border-dashed border-yas-sky/40 px-2.5 py-1 text-xs font-medium text-yas-midnight/80 transition hover:border-solid hover:bg-yas-sky/10"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
