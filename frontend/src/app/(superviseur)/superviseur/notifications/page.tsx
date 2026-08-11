"use client";

import { NotificationsCenter } from "@/components/shared/notifications-center";

export default function SuperviseurNotificationsPage() {
  return (
    <NotificationsCenter
      title="Mes notifications"
      description="Demandes de disponibilité, entretiens et nouvelles affectations."
    />
  );
}
