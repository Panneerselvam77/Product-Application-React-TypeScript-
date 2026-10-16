import { useAppDispatch, useAppSelector } from "./hooks";
import {
  addToWishlist,
  clearWishlist,
  removeFromWishlist,
  restoreWishlistItems,
} from "../redux/features/wishlistSlice";
import type { Product } from "../types";
import { notify, UndoMessage, UNDO_CLOSE } from "../utils/toastHelpers";

// Only keep what the wishlist page needs. List/detail API objects carry
// images, reviews, etc. that would just bloat localStorage.
const KEEP = [
  "id",
  "title",
  "description",
  "price",
  "thumbnail",
  "currency",
  "inStock",
  "stock",
  "category",
  "rating",
  "discountPercentage",
] as const;

function slim(product: Product): Product {
  const src = product as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of KEEP) {
    if (key in src) out[key] = src[key];
  }
  return out as unknown as Product;
}

/**
 * Wishlist actions that also show the right toast.
 * Use `toggle` for a heart button: it adds, or removes with an Undo toast.
 */
export default function useWishlistActions() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.wishlistState.items);

  const toggle = (product: Product) => {
    const toastId = `wish-${product.id}`;
    const existing = items.find((i) => i.id === product.id);

    if (existing) {
      dispatch(removeFromWishlist(product.id));
      notify(
        toastId,
        "info",
        <UndoMessage
          message={`${existing.title} removed from wishlist`}
          onUndo={() => dispatch(restoreWishlistItems([existing]))}
        />,
        UNDO_CLOSE,
      );
    } else {
      dispatch(addToWishlist(slim(product)));
      notify(toastId, "success", `${product.title} added to wishlist`);
    }
  };

  const clear = () => {
    if (items.length === 0) return;
    const snapshot = items;
    dispatch(clearWishlist());
    notify(
      "wish-clear",
      "info",
      <UndoMessage
        message="Wishlist cleared"
        onUndo={() => dispatch(restoreWishlistItems(snapshot))}
      />,
      UNDO_CLOSE,
    );
  };

  return { items, toggle, clear };
}
