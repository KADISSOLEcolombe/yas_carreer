'use client';

import React, { useEffect, useState } from 'react';
import { Send, Bell } from 'lucide-react';
import { COLORS } from '../../../lib/constants';
import { getNotifications, sendNotification, type Notification } from '../../../lib/notifications';
import { getApplications } from '../../../lib/applications';

export default function RHNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [form, setForm] = useState({
    applicationId: '',
    title: '',
    message: '',
  });
  const [sent, setSent] = useState(false);

  const load = () => {
    setNotifications(
      getNotifications().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  };

  useEffect(() => {
    load();
  }, []);

  const applications = getApplications();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const app = applications.find((a) => a.id === form.applicationId);
    if (!app) return;

    sendNotification({
      userId: app.userId,
      title: form.title,
      message: form.message,
      type: 'GENERAL',
    });

    setForm({ applicationId: '', title: '', message: '' });
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    load();
  };

  const typeLabel = (type: Notification['type']) => {
    switch (type) {
      case 'APPLICATION': return 'Candidature';
      case 'INTERVIEW': return 'Entretien';
      case 'STATUS': return 'Statut';
      default: return 'Général';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: COLORS.midnight }}>
          Notifications
        </h1>
        <p className="text-gray-600">Envoyer des messages aux candidats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: COLORS.midnight }}>
            <Send size={18} />
            Envoyer une notification
          </h2>

          {sent && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3">
              Notification envoyée avec succès !
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destinataire *</label>
              <select
                required
                value={form.applicationId}
                onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Sélectionner un candidat...</option>
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nom} — {a.jobTitle}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex : Complément d'information demandé"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Rédigez votre message au candidat..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-md font-bold text-gray-900 hover:opacity-90"
              style={{ backgroundColor: COLORS.yellow }}
            >
              Envoyer
            </button>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: COLORS.midnight }}>
            <Bell size={18} />
            Historique ({notifications.length})
          </h2>

          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">Aucune notification envoyée</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="border border-gray-100 rounded-md p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {typeLabel(n.type)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{n.message}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
