import type { CartItem } from "./features/cartSlice";

const KEY = "cart:v1";

/** Read saved cart items; returns [] if missing, corrupt or unavailable. */
export function loadCartItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Drop anything malformed so bad data can't break the cart page
    return parsed.filter(
      (i): i is CartItem =>
        !!i &&
        (typeof i.id === "number" || typeof i.id === "string") &&
        typeof i.price === "number" &&
        Number.isInteger(i.quantity) &&
        i.quantity > 0,
    );
  } catch {
    return [];
  }
}

let lastSaved: CartItem[] | undefined;

/** Save cart items. Skips the write when nothing in the cart changed. */
export function saveCartItems(items: CartItem[]) {
  if (items === lastSaved) return;
  lastSaved = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked (private mode): the cart still works in memory
  }
}
