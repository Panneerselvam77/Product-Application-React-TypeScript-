import type { Product } from "../types";

const KEY = "wishlist:v1";

/** Read saved wishlist items; returns [] if missing, corrupt or unavailable. */
export function loadWishlistItems(): Product[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Drop anything malformed so bad data can't break the wishlist page
    return parsed.filter(
      (i): i is Product =>
        !!i &&
        (typeof i.id === "number" || typeof i.id === "string") &&
        typeof i.title === "string" &&
        typeof i.price === "number",
    );
  } catch {
    return [];
  }
}

let lastSaved: Product[] | undefined;

/** Save wishlist items. Skips the write when nothing changed. */
export function saveWishlistItems(items: Product[]) {
  if (items === lastSaved) return;
  lastSaved = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked (private mode): wishlist still works in memory
  }
}
