"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  EMPTY_OFFER_FORM,
  isOfferFormValid,
  OfferFieldsForm,
  type OfferFormValues,
} from "@/components/shared/offer-fields-form";

export { EMPTY_OFFER_FORM };
export type { OfferFormValues };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialValues?: OfferFormValues;
  saving?: boolean;
  onSave: (values: OfferFormValues) => void;
};

export function OfferComposerDialog({
  open,
  onOpenChange,
  mode,
  initialValues,
  saving,
  onSave,
}: Props) {
  const [form, setForm] = useState<OfferFormValues>(
    initialValues ?? EMPTY_OFFER_FORM
  );
  const [touched, setTouched] = useState<{
    title?: boolean;
    description?: boolean;
    departement?: boolean;
  }>({});

  useEffect(() => {
    if (!open) return;
    setForm(initialValues ?? EMPTY_OFFER_FORM);
    setTouched({});
  }, [open, initialValues]);

  function handleSave() {
    if (!isOfferFormValid(form)) {
      setTouched({ title: true, description: true, departement: true });
      return;
    }
    onSave(form);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
          <DialogTitle className="font-heading text-xl text-yas-midnight">
            {mode === "edit" ? "Modifier l'offre" : "Nouvelle offre"}
          </DialogTitle>
          <DialogDescription>
            Renseignez les informations de l&apos;offre à publier.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <OfferFieldsForm
            form={form}
            onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
            touched={touched}
            onTouch={(field) => setTouched((t) => ({ ...t, [field]: true }))}
          />
        </div>

        <DialogFooter className="border-t border-slate-100 px-6 py-4 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-yas-midnight hover:bg-yas-midnight/90"
          >
            {saving
              ? "Enregistrement…"
              : mode === "edit"
                ? "Enregistrer"
                : "Créer l'offre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
