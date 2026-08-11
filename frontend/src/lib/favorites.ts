/** Client-only "favorite offers" — stored in localStorage, no backend involved. */

export const FAVORITES_CHANGED_EVENT = "yas_favorites_changed";

function storageKey(userId?: number | null): string {
  return `yas_favs_${userId ?? "guest"}`;
}

export function getFavoriteIds(userId?: number | null): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isFavoriteOffer(
  userId: number | null | undefined,
  offerId: number
): boolean {
  return getFavoriteIds(userId).includes(offerId);
}

/** Toggles the offer in/out of favorites and returns the new state. */
export function toggleFavoriteOffer(
  userId: number | null | undefined,
  offerId: number
): boolean {
  const favs = getFavoriteIds(userId);
  const isFav = favs.includes(offerId);
  const next = isFav ? favs.filter((id) => id !== offerId) : [...favs, offerId];
  localStorage.setItem(storageKey(userId), JSON.stringify(next));
  window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
  return !isFav;
}
