import type { AvailableSlot } from "./types";

export interface SlotGenerationParams {
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD
  dayStart: string; // HH:mm
  dayEnd: string; // HH:mm
  durationMinutes: number;
  breakStart?: string;
  breakEnd?: string;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Durée en minutes d'un créneau {start, end}. */
export function slotDurationMinutes(slot: Pick<AvailableSlot, "start" | "end">): number {
  return toMinutes(slot.end) - toMinutes(slot.start);
}

/** Ajoute `minutes` à une heure HH:mm. */
export function addMinutesToTime(hhmm: string, minutes: number): string {
  return toHHMM(toMinutes(hhmm) + minutes);
}

/** true si le créneau [start,end) chevauche la pause [breakStart,breakEnd). */
export function overlapsBreak(
  slot: Pick<AvailableSlot, "start" | "end">,
  breakStart: string,
  breakEnd: string
): boolean {
  const s = toMinutes(slot.start);
  const e = toMinutes(slot.end);
  const bs = toMinutes(breakStart);
  const be = toMinutes(breakEnd);
  return s < be && e > bs;
}

function dateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cur = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/** Soustrait un intervalle (ex. pause déjeuner) d'une plage libre. */
function subtractBreak(
  start: number,
  end: number,
  breakStart?: number,
  breakEnd?: number
): { start: number; end: number }[] {
  if (breakStart == null || breakEnd == null || breakEnd <= breakStart) {
    return [{ start, end }];
  }
  const segments: { start: number; end: number }[] = [];
  if (breakStart > start) segments.push({ start, end: Math.min(breakStart, end) });
  if (breakEnd < end) segments.push({ start: Math.max(breakEnd, start), end });
  return segments.filter((s) => s.end > s.start);
}

/**
 * Génère, côté client, la liste des créneaux proposables à un superviseur
 * pour qu'il indique ses disponibilités — pure période + plage horaire +
 * durée, pause auto-exclue. Aucun accès réseau/base ici.
 */
export function generateAvailabilitySlots(params: SlotGenerationParams): AvailableSlot[] {
  if (
    !params.periodStart ||
    !params.periodEnd ||
    !params.dayStart ||
    !params.dayEnd ||
    params.periodEnd < params.periodStart ||
    params.durationMinutes <= 0
  ) {
    return [];
  }

  const dayStartMin = toMinutes(params.dayStart);
  const dayEndMin = toMinutes(params.dayEnd);
  if (dayEndMin <= dayStartMin) return [];

  const breakStartMin = params.breakStart ? toMinutes(params.breakStart) : undefined;
  const breakEndMin = params.breakEnd ? toMinutes(params.breakEnd) : undefined;

  const slots: AvailableSlot[] = [];
  for (const date of dateRange(params.periodStart, params.periodEnd)) {
    const segments = subtractBreak(dayStartMin, dayEndMin, breakStartMin, breakEndMin);
    for (const segment of segments) {
      let cursor = segment.start;
      while (cursor + params.durationMinutes <= segment.end) {
        slots.push({
          date,
          start: toHHMM(cursor),
          end: toHHMM(cursor + params.durationMinutes),
        });
        cursor += params.durationMinutes;
      }
    }
  }
  return slots;
}

export function slotKey(slot: AvailableSlot): string {
  return `${slot.date}|${slot.start}|${slot.end}`;
}
