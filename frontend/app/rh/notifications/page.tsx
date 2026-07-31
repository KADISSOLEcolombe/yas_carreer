'use client';

import React, { useEffect, useState } from 'react';
import { Send, Bell } from 'lucide-react';
import { COLORS } from '../../../lib/constants';
import { api, type ApiCandidature } from '../../../lib/api';

interface Destinataire {
  id: number;
  nom: string;
  prenom: string;
  jobTitle: string;
}

interface NotificationEnvoyee {
  id: number;
  titre: string;
  contenu: string;
  date_envoi: string;
  utilisateur: { id: number; nom: string; prenom: string };
}

export default function RHNotificationsPage() {
  const [destinataires, setDestinataires] = useState<Destinataire[]>([]);
  const [notifications, setNotifications] = useState<NotificationEnvoyee[]>([]);
  const [form, setForm] = useState({
    id_utilisateur: '',
    titre: '',
    contenu: '',
  });
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistorique = async () => {
    try {
      const data = await api.getSentNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Erreur chargement historique notifications:', err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const candidatures: ApiCandidature[] = await api.getAllApplications();
        const uniques = new Map<number, Destinataire>();
        candidatures.forEach((c) => {
          if (c.utilisateur && !uniques.has(c.utilisateur.id)) {
            uniques.set(c.utilisateur.id, {
              id: c.utilisateur.id,
              nom: c.utilisateur.nom,
              prenom: c.utilisateur.prenom,
              jobTitle: c.offre?.titre || 'Poste',
            });
          }
        });
        setDestinataires(Array.from(uniques.values()));
        await loadHistorique();
      } catch (err) {
        console.error('Erreur chargement destinataires:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.sendNotification({
        id_utilisateur: Number(form.id_utilisateur),
        titre: form.titre,
        contenu: form.contenu,
      });
      setForm({ id_utilisateur: '', titre: '', contenu: '' });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      await loadHistorique();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi de la notification");
    } finally {
      setIsSubmitting(false);
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
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destinataire *</label>
              <select
                required
                value={form.id_utilisateur}
                onChange={(e) => setForm({ ...form, id_utilisateur: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                disabled={isLoading}
              >
                <option value="">
                  {isLoading ? 'Chargement...' : destinataires.length === 0 ? 'Aucun candidat' : 'Sélectionner un candidat...'}
                </option>
                {destinataires.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.prenom} {d.nom} — {d.jobTitle}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                required
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                placeholder="Ex : Complément d'information demandé"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                required
                rows={4}
                value={form.contenu}
                onChange={(e) => setForm({ ...form, contenu: e.target.value })}
                placeholder="Rédigez votre message au candidat..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none text-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-md font-bold text-gray-900 hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: COLORS.yellow }}
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer'}
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
                    <p className="font-medium text-gray-900 text-sm">{n.titre}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {n.utilisateur.prenom} {n.utilisateur.nom}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{n.contenu}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(n.date_envoi).toLocaleString('fr-FR')}
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
