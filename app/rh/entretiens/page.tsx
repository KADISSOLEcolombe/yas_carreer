'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Calendar, MapPin, List, AlertTriangle } from 'lucide-react';
import { COLORS } from '../../../lib/constants';
import { getInterviews, saveInterview, updateInterview, type Interview } from '../../../lib/interviews';
import { getApplications, updateApplicationStatus } from '../../../lib/applications';
import { sendNotification } from '../../../lib/notifications';
import InterviewCalendar from '../../../components/InterviewCalendar';
import { hasTimeConflict, INTERVIEW_STATUS_STYLES } from '../../../lib/interviewCalendar';

type ViewMode = 'list' | 'calendar';

export default function RHEntretiensPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [conflictWarning, setConflictWarning] = useState('');
  const [form, setForm] = useState({
    applicationId: '',
    dateTime: '',
    location: '',
    notes: '',
  });

  const load = () => {
    setInterviews(
      getInterviews().sort(
        (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      )
    );
  };

  useEffect(() => {
    load();
  }, []);

  const applications = getApplications().filter(
    (a) => a.status === 'PENDING' || a.status === 'IN_REVIEW' || a.status === 'INTERVIEW'
  );

  const handleDateTimeChange = (dateTime: string) => {
    setForm({ ...form, dateTime });
    if (dateTime) {
      const conflict = hasTimeConflict(interviews, dateTime);
      setConflictWarning(
        conflict
          ? `Attention : un entretien existe déjà avec ${conflict.candidateName} à un créneau proche.`
          : ''
      );
    } else {
      setConflictWarning('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const app = getApplications().find((a) => a.id === form.applicationId);
    if (!app) return;

    saveInterview({
      applicationId: app.id,
      candidateName: app.nom,
      candidateEmail: app.email,
      jobTitle: app.jobTitle,
      dateTime: form.dateTime,
      location: form.location,
      notes: form.notes,
    });

    updateApplicationStatus(app.id, 'INTERVIEW');

    const dateFormatted = new Date(form.dateTime).toLocaleString('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    sendNotification({
      userId: app.userId,
      title: 'Entretien programmé',
      message: `Votre entretien pour « ${app.jobTitle} » est prévu le ${dateFormatted} à ${form.location}.`,
      type: 'INTERVIEW',
    });

    setForm({ applicationId: '', dateTime: '', location: '', notes: '' });
    setConflictWarning('');
    setShowForm(false);
    load();
    setViewMode('calendar');
    setCurrentMonth(new Date(form.dateTime));
    setSelectedDate(new Date(form.dateTime));
  };

  const handleStatusChange = (id: string, status: Interview['status']) => {
    updateInterview(id, { status });
    load();
    if (selectedInterview?.id === id) {
      setSelectedInterview({ ...selectedInterview, status });
    }
  };

  const renderInterviewCard = (interview: Interview, compact = false) => {
    const statusStyle = INTERVIEW_STATUS_STYLES[interview.status];
    return (
      <div
        key={interview.id}
        className={`bg-white border border-gray-200 rounded-lg ${compact ? 'p-4' : 'p-5'} hover:shadow-sm transition-shadow cursor-pointer`}
        onClick={() => setSelectedInterview(interview)}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{interview.candidateName}</h3>
              <span
                className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
              >
                {statusStyle.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{interview.jobTitle}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {new Date(interview.dateTime).toLocaleString('fr-FR')}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                {interview.location}
              </span>
            </div>
            {!compact && interview.notes && (
              <p className="text-sm text-gray-500 mt-2">{interview.notes}</p>
            )}
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <select
              value={interview.status}
              onChange={(e) =>
                handleStatusChange(interview.id, e.target.value as Interview['status'])
              }
              className="text-xs px-2 py-1.5 border border-gray-300 rounded-md"
            >
              <option value="SCHEDULED">Planifié</option>
              <option value="COMPLETED">Terminé</option>
              <option value="CANCELLED">Annulé</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: COLORS.midnight }}>
            Entretiens
          </h1>
          <p className="text-gray-600">Programmer et suivre les entretiens</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-md border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'calendar' ? 'text-gray-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={viewMode === 'calendar' ? { backgroundColor: COLORS.yellow } : undefined}
            >
              <Calendar size={16} />
              Calendrier
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                viewMode === 'list' ? 'text-gray-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={viewMode === 'list' ? { backgroundColor: COLORS.yellow } : undefined}
            >
              <List size={16} />
              Liste
            </button>
          </div>
          <button
            onClick={() => {
              setForm({ applicationId: '', dateTime: '', location: '', notes: '' });
              setConflictWarning('');
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold text-gray-900 hover:opacity-90"
            style={{ backgroundColor: COLORS.yellow }}
          >
            <Plus size={18} />
            Programmer
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: COLORS.midnight }}>
              Programmer un entretien
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {conflictWarning && (
                <div className="flex gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-md px-3 py-2">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{conflictWarning}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Candidature *</label>
                <select
                  required
                  value={form.applicationId}
                  onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sélectionner...</option>
                  {applications.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nom} — {a.jobTitle}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure *</label>
                <input
                  type="datetime-local"
                  required
                  value={form.dateTime}
                  onChange={(e) => handleDateTimeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu / Lien visio *</label>
                <input
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Bureau YAS Togo ou lien Teams/Zoom"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-md font-bold text-gray-900"
                  style={{ backgroundColor: COLORS.yellow }}
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedInterview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedInterview(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: COLORS.midnight }}>
              Détail de l'entretien
            </h2>
            <div className="space-y-3 text-sm mb-6">
              <p><span className="text-gray-500">Candidat :</span> <strong>{selectedInterview.candidateName}</strong></p>
              <p><span className="text-gray-500">Email :</span> {selectedInterview.candidateEmail}</p>
              <p><span className="text-gray-500">Poste :</span> {selectedInterview.jobTitle}</p>
              <p>
                <span className="text-gray-500">Date :</span>{' '}
                {new Date(selectedInterview.dateTime).toLocaleString('fr-FR')}
              </p>
              <p><span className="text-gray-500">Lieu :</span> {selectedInterview.location}</p>
              {selectedInterview.notes && (
                <p><span className="text-gray-500">Notes :</span> {selectedInterview.notes}</p>
              )}
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={selectedInterview.status}
              onChange={(e) =>
                handleStatusChange(selectedInterview.id, e.target.value as Interview['status'])
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            >
              <option value="SCHEDULED">Planifié</option>
              <option value="COMPLETED">Terminé</option>
              <option value="CANCELLED">Annulé</option>
            </select>
            <button
              onClick={() => setSelectedInterview(null)}
              className="w-full py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {viewMode === 'calendar' ? (
        <InterviewCalendar
          interviews={interviews}
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          onMonthChange={setCurrentMonth}
          onSelectDate={setSelectedDate}
          onSelectInterview={setSelectedInterview}
        />
      ) : (
        <div className="space-y-4">
          {interviews.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg py-12 text-center text-gray-500">
              Aucun entretien programmé
            </div>
          ) : (
            interviews.map((interview) => renderInterviewCard(interview))
          )}
        </div>
      )}
    </div>
  );
}
