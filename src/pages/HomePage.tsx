import { useEffect } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import {
  fetchProduct,
  resetFilters,
  setCategory,
  setSort,
} from "../redux/features/productSlice";
import SpinningLoader from "../component/SpinningLoader";
import ProductCard from "../component/ProductCard";
import FilterSidebar, {
  toSortValue,
  type SortOption,
} from "../component/FilterSidebar";
import { formatCategory } from "../hooks/useCategories";
import useCartActions from "../hooks/useCartActions";
import type { Product } from "../types";

export default function Home() {
  const dispatch = useAppDispatch();
  const { addItem } = useCartActions();
  const {
    products,
    isError,
    isLoading,
    hasMore,
    skip,
    searchQuery,
    selectedCategory,
    sortBy,
    order,
  } = useAppSelector((state) => state.productState);

  // Initial load only. Filter changes dispatch their own fetch (see handlers),
  // and search is fetched from the NavBar.
  useEffect(() => {
    if (products.length === 0 && !searchQuery) {
      dispatch(fetchProduct({ skip: 0, searchQuery: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Surface fetch failures as a toast (the inline message stays as a fallback)
  useEffect(() => {
    if (isError) toast.error(isError, { toastId: "products-error" });
  }, [isError]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      dispatch(fetchProduct({ skip, searchQuery }));
    }
  };

  const handleAddCart = (product: Product) => {
    addItem(product); // handles stock limits + toast
  };

  const handleSelectCategory = (category: string) => {
    if (category === selectedCategory) return;
    dispatch(setCategory(category)); // also clears the search
    dispatch(fetchProduct({ skip: 0, searchQuery: "" }));
  };

  const handleSort = (option: SortOption) => {
    if (option.sortBy === sortBy && (!option.sortBy || option.order === order))
      return;
    dispatch(setSort({ sortBy: option.sortBy, order: option.order }));
    dispatch(fetchProduct({ skip: 0, searchQuery })); // keeps current search
  };

  const handleClearFilters = () => {
    dispatch(resetFilters());
    dispatch(fetchProduct({ skip: 0, searchQuery }));
  };

  const hasActiveFilters = selectedCategory !== "" || sortBy !== "";

  return (
    <div className="home-container">
      <div className="shop-layout">
        <FilterSidebar
          selectedCategory={selectedCategory}
          sortValue={toSortValue(sortBy, order)}
          hasActiveFilters={hasActiveFilters}
          onSelectCategory={handleSelectCategory}
          onSortChange={handleSort}
          onClear={handleClearFilters}
        />

        <main className="shop-main">
          {isError ? (
            <div>Error: {isError}</div>
          ) : (
            <>
              <div className="home-product">
                {products.map((product) => (
                  <ProductCard
                    key={product.id || product.title}
                    product={product}
                    onAddToCart={handleAddCart}
                  />
                ))}
              </div>

              {products.length === 0 && !isLoading && (
                <p className="shop-message">
                  {selectedCategory
                    ? `No products found in ${formatCategory(selectedCategory)}.`
                    : "No products found matching your search."}
                </p>
              )}

              {/* Loader for initial load / filter change */}
              {isLoading && products.length === 0 && <SpinningLoader />}

              {/* Load More Section */}
              <div
                className="load-more-container"
                style={{ textAlign: "center", margin: "2rem 0" }}
              >
                {hasMore && products.length > 0 ? (
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="load-more-btn"
                    style={{
                      padding: "10px 20px",
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {isLoading ? "Loading..." : "Load More"}
                  </button>
                ) : (
                  products.length > 0 && (
                    <p style={{ color: "#6b7280" }}>
                      No more products to load.
                    </p>
                  )
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
