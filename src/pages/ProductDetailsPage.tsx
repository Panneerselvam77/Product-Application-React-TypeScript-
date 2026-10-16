import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useCartActions from "../hooks/useCartActions";
import WishlistButton from "../component/WishlistButton";
import SpinningLoader from "../component/SpinningLoader";
import type { Product } from "../types";
import "../css/Productdetailspage.css";

interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
}

interface ProductDetails {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: Review[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  images: string[];
  thumbnail: string;
}

const usd = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
});

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span className="pd-stars" aria-label={`${value.toFixed(1)} out of 5`}>
      {"★".repeat(rounded)}
      <span className="pd-stars__empty">{"★".repeat(5 - rounded)}</span>
    </span>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartActions();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      setActiveImage(0);
      try {
        const res = await fetch(`https://dummyjson.com/products/${id}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? "Product not found."
              : `Request failed (${res.status})`,
          );
        }
        setProduct((await res.json()) as ProductDetails);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [id]);

  if (isLoading) return <SpinningLoader />;

  if (error || !product) {
    return (
      <div className="pd-state">
        <p>{error ?? "Product not found."}</p>
        <button className="pd-btn" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  const inStock = product.stock > 0;
  const originalPrice =
    product.discountPercentage > 0
      ? product.price / (1 - product.discountPercentage / 100)
      : null;
  const images = product.images.length ? product.images : [product.thumbnail];

  const handleAddToCart = () => {
    // Adjust this mapping if your `Product` type differs from DummyJSON's shape.
    const ok = addItem({ ...product, inStock } as unknown as Product);
    if (!ok) return; // limit reached / out of stock: the hook shows a warning
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="pd-page">
      <nav className="pd-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span className="pd-breadcrumb__cat">{product.category}</span>
        <span>/</span>
        <span aria-current="page">{product.title}</span>
      </nav>

      <div className="pd-layout">
        {/* Gallery */}
        <section className="pd-gallery" aria-label="Product images">
          <div className="pd-gallery__main">
            <img src={images[activeImage]} alt={product.title} />
          </div>
          {images.length > 1 && (
            <div className="pd-gallery__thumbs">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className={`pd-thumb${i === activeImage ? " is-active" : ""}`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Info */}
        <section className="pd-info">
          {product.brand && <p className="pd-brand">{product.brand}</p>}
          <h1 className="pd-title">{product.title}</h1>

          <div className="pd-rating">
            <Stars value={product.rating} />
            <span>
              {product.rating.toFixed(1)} · {product.reviews.length} reviews
            </span>
          </div>

          <div className="pd-price-row">
            <span className="pd-price">{usd.format(product.price)}</span>
            {originalPrice && (
              <>
                <span className="pd-price-old">
                  {usd.format(originalPrice)}
                </span>
                <span className="pd-discount">
                  -{Math.round(product.discountPercentage)}%
                </span>
              </>
            )}
          </div>

          <p className="pd-description">{product.description}</p>

          <p className={`pd-stock ${inStock ? "in" : "out"}`}>
            {inStock
              ? product.stock <= 10
                ? `Only ${product.stock} left in stock`
                : "In stock"
              : "Out of stock"}
          </p>

          <div className="pd-actions">
            <button
              type="button"
              className="pd-btn pd-btn--primary"
              disabled={!inStock}
              onClick={handleAddToCart}
            >
              {!inStock ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
            </button>
            <WishlistButton
              product={{ ...product, inStock } as unknown as Product}
              showLabel
            />
            <button
              type="button"
              className="pd-btn pd-btn--ghost"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>

          {product.tags.length > 0 && (
            <ul className="pd-tags">
              {product.tags.map((tag) => (
                <li key={tag}>#{tag}</li>
              ))}
            </ul>
          )}

          <dl className="pd-specs">
            <div>
              <dt>SKU</dt>
              <dd>{product.sku}</dd>
            </div>
            <div>
              <dt>Weight</dt>
              <dd>{product.weight} g</dd>
            </div>
            <div>
              <dt>Dimensions</dt>
              <dd>
                {product.dimensions.width} × {product.dimensions.height} ×{" "}
                {product.dimensions.depth} cm
              </dd>
            </div>
            <div>
              <dt>Warranty</dt>
              <dd>{product.warrantyInformation}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{product.shippingInformation}</dd>
            </div>
            <div>
              <dt>Returns</dt>
              <dd>{product.returnPolicy}</dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section className="pd-reviews">
          <h2>Customer reviews</h2>
          <ul>
            {product.reviews.map((r, i) => (
              <li key={`${r.reviewerName}-${i}`} className="pd-review">
                <div className="pd-review__head">
                  <strong>{r.reviewerName}</strong>
                  <Stars value={r.rating} />
                  <time dateTime={r.date}>
                    {new Date(r.date).toLocaleDateString()}
                  </time>
                </div>
                <p>{r.comment}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
