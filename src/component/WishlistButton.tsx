import { useAppSelector } from "../hooks/hooks";
import useWishlistActions from "../hooks/useWishlistActions";
import type { Product } from "../types";
import "../css/WishlistButton.css";

interface WishlistButtonProps {
  product: Product;
  /** Extra class, e.g. "wish-btn--floating" to pin it to a card corner. */
  className?: string;
  /** Show a "Save" / "Saved" text label next to the heart. */
  showLabel?: boolean;
}

export default function WishlistButton({
  product,
  className = "",
  showLabel = false,
}: WishlistButtonProps) {
  const { toggle } = useWishlistActions();
  const active = useAppSelector((state) =>
    state.wishlistState.items.some((i) => i.id === product.id),
  );

  const classes = [
    "wish-btn",
    active && "is-active",
    showLabel && "wish-btn--labelled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      aria-pressed={active}
      aria-label={
        active
          ? `Remove ${product.title} from wishlist`
          : `Add ${product.title} to wishlist`
      }
      onClick={(e) => {
        // Safe to use inside links/cards: don't navigate or bubble
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {showLabel && <span>{active ? "Saved" : "Save"}</span>}
    </button>
  );
}
