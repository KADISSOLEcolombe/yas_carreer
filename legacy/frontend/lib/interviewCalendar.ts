import type { Interview } from './interviews';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getInterviewsForDate(interviews: Interview[], date: Date): Interview[] {
  return interviews
    .filter((i) => isSameDay(new Date(i.dateTime), date))
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
}

export function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const days: (Date | null)[] = [];

  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

export function hasTimeConflict(
  interviews: Interview[],
  dateTime: string,
  excludeId?: string
): Interview | undefined {
  const newTime = new Date(dateTime).getTime();
  return interviews.find((i) => {
    if (i.status === 'CANCELLED') return false;
    if (excludeId && i.id === excludeId) return false;
    return Math.abs(new Date(i.dateTime).getTime() - newTime) < 60 * 60 * 1000;
  });
}

export const INTERVIEW_STATUS_STYLES: Record<
  Interview['status'],
  { bg: string; text: string; dot: string; label: string }
> = {
  SCHEDULED: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'Planifié' },
  COMPLETED: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Terminé' },
  CANCELLED: { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF', label: 'Annulé' },
};

export { WEEKDAYS };
