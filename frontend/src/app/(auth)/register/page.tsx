"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/** Inscription publique désactivée. */
export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-heading text-2xl text-yas-midnight">
          Inscription fermée
        </CardTitle>
        <CardDescription>
          Les comptes RH sont créés par l&apos;administrateur. Les candidats
          postulent directement depuis une offre.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button asChild variant="midnight" className="rounded-xl">
          <Link href="/login">Se connecter</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/offres">Voir les offres</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
