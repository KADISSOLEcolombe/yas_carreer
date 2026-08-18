/** Client-only "offer the candidate intended to apply to" — stored in localStorage, no backend involved. */

const STORAGE_KEY = "yas_pending_offer";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface PendingOffer {
  offerId: number;
  offerTitle: string;
  savedAt: number;
}

export function setPendingOffer(offerId: number, offerTitle: string): void {
  if (typeof window === "undefined") return;
  const entry: PendingOffer = { offerId, offerTitle, savedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
}

export function getPendingOffer(): PendingOffer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as PendingOffer;
    if (!entry?.offerId || !entry?.savedAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (Date.now() - entry.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return entry;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearPendingOffer(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
