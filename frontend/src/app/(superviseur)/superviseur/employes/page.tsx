"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, MoreHorizontal, NotebookPen, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, emploisApi, supervisionNotesApi } from "@/lib/api";
import { EMPLOI_STATUS_LABELS } from "@/lib/constants";
import { lastEvaluation, lastFollowUp } from "@/lib/emploi-utils";
import type { Emploi } from "@/lib/types";

export default function SuperviseurEmployesPage() {
  const queryClient = useQueryClient();
  const [reportTarget, setReportTarget] = useState<Emploi | null>(null);
  const [reportType, setReportType] = useState<"rapport" | "observation">("rapport");
  const [reportContent, setReportContent] = useState("");

  const { data: emplois, isLoading } = useQuery({
    queryKey: ["emplois", "me"],
    queryFn: emploisApi.me,
  });

  const createReportMutation = useMutation({
    mutationFn: () =>
      supervisionNotesApi.create({
        emploiId: reportTarget!.id,
        type: reportType,
        content: reportContent.trim(),
      }),
    onSuccess: () => {
      toast.success("Rapport de suivi ajouté");
      setReportTarget(null);
      setReportContent("");
      queryClient.invalidateQueries({ queryKey: ["emplois", "me"] });
      queryClient.invalidateQueries({ queryKey: ["supervision-notes"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Erreur lors de l'ajout");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-yas-midnight">
          Mes collaborateurs
        </h1>
        <p className="text-muted-foreground">
          Stagiaires, CDD et CDI qui vous sont affectés pour le suivi.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}
      {!isLoading && emplois?.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Aucun collaborateur ne vous est affecté pour le moment.
          </CardContent>
        </Card>
      )}

      {!isLoading && emplois && emplois.length > 0 && (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Affecté(e) depuis</TableHead>
                <TableHead>Dernier suivi</TableHead>
                <TableHead>Évaluation</TableHead>
                <TableHead className="text-right">Statut</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {emplois.map((emploi) => {
                const followUp = lastFollowUp(emploi);
                const evaluation = lastEvaluation(emploi);
                return (
                  <TableRow key={emploi.id}>
                    <TableCell className="font-medium text-yas-midnight">
                      {emploi.user?.fullName || emploi.user?.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {emploi.application?.offer?.title ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {emploi.department ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(emploi.startDate).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {followUp
                        ? new Date(followUp.createdAt).toLocaleDateString("fr-FR")
                        : "Aucun"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {evaluation ? (
                        <span className="inline-flex items-center gap-1">
                          {evaluation.rating != null && (
                            <>
                              <Star className="size-3.5 fill-yas-yellow text-yas-yellow" />
                              {evaluation.rating}/5
                            </>
                          )}
                          {evaluation.rating == null && "Évalué"}
                        </span>
                      ) : (
                        "Aucune"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{EMPLOI_STATUS_LABELS[emploi.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/superviseur/candidature/${emploi.applicationId}`}>
                              <Eye className="size-4" />
                              Voir le dossier
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setReportTarget(emploi);
                              setReportType("rapport");
                              setReportContent("");
                            }}
                          >
                            <NotebookPen className="size-4" />
                            Faire un rapport de suivi
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={Boolean(reportTarget)} onOpenChange={(open) => !open && setReportTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rapport de suivi</DialogTitle>
            <DialogDescription>
              {reportTarget?.user?.fullName || reportTarget?.user?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={reportType}
                onValueChange={(v) => setReportType(v as "rapport" | "observation")}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rapport">Rapport de suivi</SelectItem>
                  <SelectItem value="observation">Observation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="report-content">Contenu</Label>
              <Textarea
                id="report-content"
                rows={4}
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                placeholder="Observations, progrès, points d'attention…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (reportContent.trim().length < 2) {
                  toast.error("Ajoutez un contenu pour ce rapport");
                  return;
                }
                createReportMutation.mutate();
              }}
              disabled={createReportMutation.isPending}
            >
              {createReportMutation.isPending ? "Ajout…" : "Ajouter le rapport"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
