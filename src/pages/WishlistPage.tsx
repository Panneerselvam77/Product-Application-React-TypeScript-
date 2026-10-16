import { Link } from "react-router-dom";
import ProductCard from "../component/ProductCard";
import useCartActions from "../hooks/useCartActions";
import useWishlistActions from "../hooks/useWishlistActions";
import "../css/Wishlist.css";

export default function WishlistPage() {
  const { items, clear } = useWishlistActions();
  const { addItem } = useCartActions();

  if (items.length === 0) {
    return (
      <div className="wishlist-empty">
        <div className="wishlist-empty__icon" aria-hidden="true">
          ♡
        </div>
        <h2>Your wishlist is empty</h2>
        <p>Tap the heart on any product to save it here for later.</p>
        <Link to="/" className="wishlist-empty__link">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <header className="wishlist-header">
        <div>
          <h1>My Wishlist</h1>
          <p className="wishlist-count">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>
        <button type="button" className="wishlist-clear" onClick={clear}>
          Clear wishlist
        </button>
      </header>

      {/* Reuses the product card: heart removes (with Undo), button adds to cart */}
      <div className="home-product">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={addItem}
          />
        ))}
      </div>
    </div>
  );
}
