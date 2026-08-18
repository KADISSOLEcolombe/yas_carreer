"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

/**
 * Champ de recherche avec suggestions en direct (type-to-search), pour
 * remplacer un <Select> classique quand la liste peut être longue. `options`
 * est le pool principal (ex. offres actives) ; `fallbackOptions`, optionnel,
 * n'est utilisé que si une recherche non vide ne trouve rien dans `options`
 * — permet de retrouver un élément plus ancien/inactif par recherche
 * explicite sans l'afficher par défaut.
 */
export function SearchCombobox({
  value,
  onValueChange,
  options,
  fallbackOptions,
  placeholder = "Rechercher…",
  emptyMessage = "Aucun résultat",
  disabled = false,
  maxResults = 50,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: ComboboxOption[];
  fallbackOptions?: ComboboxOption[];
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  maxResults?: number;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ??
    fallbackOptions?.find((o) => o.value === value);

  useEffect(() => {
    if (!value) setQuery("");
  }, [value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const term = query.trim().toLowerCase();
  const matches = (o: ComboboxOption) => o.label.toLowerCase().includes(term);
  let results = term ? options.filter(matches) : options;
  if (term && results.length === 0 && fallbackOptions) {
    results = fallbackOptions.filter(matches);
  }
  results = results.slice(0, maxResults);

  function pick(option: ComboboxOption) {
    onValueChange(option.value);
    setQuery(option.label);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="rounded-xl pl-9"
          placeholder={placeholder}
          disabled={disabled}
          value={open ? query : selected?.label ?? ""}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value) onValueChange("");
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && results.length > 0) {
              e.preventDefault();
              pick(results[0]);
            }
          }}
        />
      </div>
      {open && !disabled && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-400">{emptyMessage}</p>
          ) : (
            results.map((o) => (
              <button
                key={o.value}
                type="button"
                className={cn(
                  "flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50",
                  o.value === value && "bg-yas-sky/10"
                )}
                onClick={() => pick(o)}
              >
                <span className="font-medium text-slate-700">{o.label}</span>
                {o.sublabel && <span className="text-xs text-slate-400">{o.sublabel}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
