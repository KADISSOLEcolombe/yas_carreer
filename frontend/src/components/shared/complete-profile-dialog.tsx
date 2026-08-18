"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CompleteProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complétez votre profil 👋🏽</DialogTitle>
          <DialogDescription>
            Renseignez vos informations une seule fois afin de faciliter vos
            prochaines candidatures. Ces informations pourront ensuite être
            réutilisées automatiquement.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Plus tard
          </Button>
          <Button
            className="rounded-xl bg-yas-yellow text-yas-midnight hover:bg-yas-yellow/90"
            onClick={() => {
              onOpenChange(false);
              router.push("/candidat/profil");
            }}
          >
            Compléter mon profil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
