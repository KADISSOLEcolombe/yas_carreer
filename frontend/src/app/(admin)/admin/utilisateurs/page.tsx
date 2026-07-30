"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ApiError, usersApi } from "@/lib/api";
import { ROLE_LABELS } from "@/lib/constants";
import type { UserRole } from "@/lib/types";
import {
  SoftCard,
  SoftPageHeader,
  SoftSearch,
  SoftStatusPill,
  SoftTabs,
  SoftToolbar,
} from "@/components/shared/soft-ui";

export default function AdminUtilisateursPage() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.list(),
  });

  const [roleTab, setRoleTab] = useState<UserRole | "all">("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "rh">("rh");
  const [phone, setPhone] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {
      all: users?.length ?? 0,
      admin: 0,
      rh: 0,
      candidat: 0,
    };
    for (const u of users ?? []) map[u.role] = (map[u.role] || 0) + 1;
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    let list = users ?? [];
    if (roleTab !== "all") list = list.filter((u) => u.role === roleTab);
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter(
        (u) =>
          (u.fullName || "").toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      );
    }
    return list;
  }, [users, roleTab, q]);

  const createMutation = useMutation({
    mutationFn: () =>
      usersApi.create({
        fullName,
        email,
        role,
        phone: phone || undefined,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(
        data.message ||
          "Compte créé — un email avec les accès a été envoyé"
      );
      setOpen(false);
      setFullName("");
      setEmail("");
      setPhone("");
      setRole("rh");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Création impossible"
      );
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) =>
      usersApi.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Rôle mis à jour");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Mise à jour impossible"
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      usersApi.updateStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Statut mis à jour");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Mise à jour impossible"
      );
    },
  });

  return (
    <div>
      <SoftPageHeader
        title="Utilisateurs"
        description="Le super-admin crée les comptes RH (et admin). Un email d’invitation est envoyé automatiquement."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="midnight" className="h-10 gap-2 rounded-xl">
                <Plus className="size-4" />
                Inviter un RH
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Inviter un collaborateur</DialogTitle>
                <DialogDescription>
                  Un mot de passe temporaire sera généré et envoyé par email.
                  L’utilisateur devra le changer à la première connexion.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    className="rounded-xl"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel</Label>
                  <Input
                    id="email"
                    type="email"
                    className="rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    className="rounded-xl"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select
                    value={role}
                    onValueChange={(v) => setRole(v as "admin" | "rh")}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rh">Ressources humaines</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="midnight"
                  onClick={() => createMutation.mutate()}
                  disabled={
                    createMutation.isPending ||
                    fullName.length < 2 ||
                    !email.includes("@")
                  }
                  className="rounded-xl"
                >
                  {createMutation.isPending
                    ? "Envoi…"
                    : "Créer et envoyer l’email"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <SoftToolbar>
        <SoftTabs
          items={[
            { value: "all", label: "Tous", count: counts.all },
            { value: "admin", label: "Admin", count: counts.admin },
            { value: "rh", label: "RH", count: counts.rh },
            { value: "candidat", label: "Candidats", count: counts.candidat },
          ]}
          value={roleTab}
          onChange={(v) => setRoleTab(v as UserRole | "all")}
        />
        <SoftSearch
          value={q}
          onChange={setQ}
          placeholder="Nom ou email…"
        />
      </SoftToolbar>

      <SoftCard className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs text-slate-500">
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={
                      filtered.length > 0 &&
                      filtered.every((u) => selected.includes(u.id))
                    }
                    onCheckedChange={(c) =>
                      setSelected(c === true ? filtered.map((u) => u.id) : [])
                    }
                  />
                </th>
                <th className="px-3 py-3 font-medium">Utilisateur</th>
                <th className="px-3 py-3 font-medium">Rôle</th>
                <th className="px-3 py-3 font-medium">Statut</th>
                <th className="px-3 py-3 font-medium">Actif</th>
                <th className="w-12 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-16 text-center text-slate-400"
                  >
                    Chargement…
                  </td>
                </tr>
              )}
              {filtered.map((u) => {
                const name = u.fullName || u.email;
                const ini = name
                  .split(/\s+/)
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3.5">
                      <Checkbox
                        checked={selected.includes(u.id)}
                        onCheckedChange={(c) =>
                          setSelected((prev) =>
                            c === true
                              ? [...prev, u.id]
                              : prev.filter((id) => id !== u.id)
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-yas-sky/15 text-xs font-semibold text-yas-midnight">
                            {ini}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {u.fullName || "—"}
                          </p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <Select
                        value={u.role}
                        onValueChange={(v) =>
                          roleMutation.mutate({
                            id: u.id,
                            role: v as UserRole,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-44 rounded-full border-0 bg-slate-100 px-3 text-xs font-medium shadow-none">
                          <SelectValue>{ROLE_LABELS[u.role]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {u.role === "candidat" ? (
                            <SelectItem value="candidat" disabled>
                              Candidat
                            </SelectItem>
                          ) : null}
                          <SelectItem value="rh">RH</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-3.5">
                      <SoftStatusPill tone={u.isActive ? "success" : "danger"}>
                        {u.isActive ? "Actif" : "Désactivé"}
                      </SoftStatusPill>
                    </td>
                    <td className="px-3 py-3.5">
                      <Checkbox
                        checked={Boolean(u.isActive)}
                        onCheckedChange={(checked) =>
                          statusMutation.mutate({
                            id: u.id,
                            isActive: Boolean(checked),
                          })
                        }
                      />
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              statusMutation.mutate({
                                id: u.id,
                                isActive: !u.isActive,
                              })
                            }
                          >
                            {u.isActive ? "Désactiver" : "Activer"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SoftCard>
    </div>
  );
}
