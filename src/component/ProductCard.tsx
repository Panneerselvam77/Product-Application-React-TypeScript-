import { Link } from "react-router-dom";
import type { Product } from "../types";
import WishlistButton from "./WishlistButton";
import "../css/ProductCard.css";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const inStock = product.inStock !== false;
  const price = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: product.currency ?? "USD",
  }).format(product.price);

  return (
    <article
      className={`product-card${inStock ? "" : " product-card--sold-out"}`}
      aria-label={product.title}
    >
      {/* Outside the Link so clicking the heart never navigates */}
      <WishlistButton product={product} className="wish-btn--floating" />

      <Link
        to={`/product/${product.id}`}
        className="product-card__link"
        aria-label={`View details for ${product.title}`}
      >
        <div className="product-card__media">
          <img
            className="product-card__image"
            src={product.thumbnail}
            alt={product.title}
            loading="lazy"
          />
          {!inStock && <span className="product-card__badge">Sold out</span>}
        </div>

        <div className="product-card__content product-card__content--link">
          <h2 className="product-card__title">{product.title}</h2>
          {product.description && (
            <p className="product-card__description">{product.description}</p>
          )}
        </div>
      </Link>

      <div className="product-card__footer">
        <span className="product-card__price">{price}</span>
        <button
          type="button"
          className="product-card__button"
          disabled={!inStock}
          onClick={() => onAddToCart(product)}
        >
          {inStock ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </article>
  );
}
