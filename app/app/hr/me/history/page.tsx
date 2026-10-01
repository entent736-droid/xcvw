"use client";

import { useStaffSelfData } from "@/lib/hooks/use-staff-self-data";
import { useAuth } from "@/components/auth/auth-provider";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, LogIn, LogOut, CalendarOff, Briefcase, Building2 } from "lucide-react";

const LEAVE_TYPES: Record<string, string> = {
  vacation: "Congé payé",
  sick: "Maladie",
  personal: "Affaire personnelle",
  unpaid: "Congé sans solde",
  other: "Autre",
};

const LEAVE_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Refusé",
  cancelled: "Annulé",
};

const LEAVE_STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  cancelled: "outline",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  on_leave: "En congé",
  terminated: "Licencié",
  retired: "Retraité",
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  cdi: "CDI",
  cdd: "CDD",
  internship: "Stage",
  consultant: "Consultant",
};

export default function MyHrHistoryPage() {
  const { hasStaffRecord } = useAuth();
  const { staff, assignments, recentEvents, leaveRequests, loading } = useStaffSelfData();

  if (loading) {
    return (
      <div>
        <PageHeader title="Mon historique RH" description="Historique de mon pointage et de mes congés" />
        <LoadingState />
      </div>
    );
  }

  if (!hasStaffRecord || !staff) {
    return (
      <div>
        <PageHeader title="Mon historique RH" />
        <Card className="p-6">
          <EmptyState
            title="Aucun enregistrement de personnel lié"
            message="Votre compte n'est pas lié à un enregistrement de personnel. Contactez un administrateur RH."
          />
        </Card>
      </div>
    );
  }

  const primaryAssignment = assignments.find((a) => a.is_primary && !a.end_date) ?? assignments[0];

  return (
    <div>
      <PageHeader title="Mon historique RH" description="Historique de mon pointage, congés et affectations" />

      <div className="space-y-6">
        <Card className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Matricule</p>
              <p className="text-sm font-medium mt-0.5">{staff.staff_number}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Statut</p>
              <p className="text-sm font-medium mt-0.5">
                <Badge variant={staff.status === "active" ? "default" : "secondary"}>
                  {STATUS_LABELS[staff.status] ?? staff.status}
                </Badge>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Type d'emploi</p>
              <p className="text-sm font-medium mt-0.5">
                {staff.employment_type ? EMPLOYMENT_LABELS[staff.employment_type] ?? staff.employment_type : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date d'embauche</p>
              <p className="text-sm font-medium mt-0.5">{new Date(staff.hire_date).toLocaleDateString("fr-FR")}</p>
            </div>
            {primaryAssignment?.hr_departments?.name && (
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Direction
                </p>
                <p className="text-sm font-medium mt-0.5">{primaryAssignment.hr_departments.name}</p>
              </div>
            )}
            {primaryAssignment?.hr_positions?.name && (
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Poste
                </p>
                <p className="text-sm font-medium mt-0.5">{primaryAssignment.hr_positions.name}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Historique de pointage (30 derniers jours)</h3>
          </div>
          {!recentEvents || recentEvents.length === 0 ? (
            <EmptyState title="Aucun pointage" message="Aucun pointage enregistré sur les 30 derniers jours." />
          ) : (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Heure</TableHead>
                    <TableHead>Méthode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEvents.slice(0, 50).map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        {e.event_type === "clock_in" ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <LogIn className="w-3 h-3 mr-1" /> Entrée
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                            <LogOut className="w-3 h-3 mr-1" /> Sortie
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(e.server_timestamp).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {new Date(e.server_timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{e.method}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarOff className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold">Historique des congés</h3>
          </div>
          {leaveRequests.length === 0 ? (
            <EmptyState title="Aucune demande" message="Aucune demande de congé enregistrée." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Début</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Badge variant="outline">{LEAVE_TYPES[r.leave_type] ?? r.leave_type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(r.start_date).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell className="text-sm">{new Date(r.end_date).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{r.reason ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={LEAVE_STATUS_VARIANTS[r.status] ?? "outline"}>
                          {LEAVE_STATUS_LABELS[r.status] ?? r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {assignments.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Mes affectations</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Direction</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Début</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a) => {
                    const isActive = !a.end_date;
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.hr_departments?.name ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{a.hr_positions?.name ?? "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(a.start_date).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{a.end_date ? new Date(a.end_date).toLocaleDateString("fr-FR") : "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "En cours" : "Terminée"}</Badge>
                            {a.is_primary && <Badge variant="outline">Principale</Badge>}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
