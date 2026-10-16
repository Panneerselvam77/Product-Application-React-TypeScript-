import { useEffect, useState } from "react";
import useCategories, { formatCategory } from "../hooks/useCategories";
import type { SortBy, SortOrder } from "../redux/features/productSlice";
import "../css/FilterSidebar.css";

export interface SortOption {
  value: string;
  label: string;
  sortBy: SortBy;
  order: SortOrder;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: "", label: "Default", sortBy: "", order: "asc" },
  {
    value: "price-asc",
    label: "Price: Low to High",
    sortBy: "price",
    order: "asc",
  },
  {
    value: "price-desc",
    label: "Price: High to Low",
    sortBy: "price",
    order: "desc",
  },
  {
    value: "rating-desc",
    label: "Rating: High to Low",
    sortBy: "rating",
    order: "desc",
  },
  { value: "title-asc", label: "Name: A to Z", sortBy: "title", order: "asc" },
  {
    value: "title-desc",
    label: "Name: Z to A",
    sortBy: "title",
    order: "desc",
  },
];

/** Build the select/radio value from store state. */
export const toSortValue = (sortBy: SortBy, order: SortOrder) =>
  sortBy ? `${sortBy}-${order}` : "";

interface FilterSidebarProps {
  selectedCategory: string;
  sortValue: string;
  hasActiveFilters: boolean;
  onSelectCategory: (category: string) => void;
  onSortChange: (option: SortOption) => void;
  onClear: () => void;
}

export default function FilterSidebar({
  selectedCategory,
  sortValue,
  hasActiveFilters,
  onSelectCategory,
  onSortChange,
  onClear,
}: FilterSidebarProps) {
  const { categories, isLoading } = useCategories();
  const [open, setOpen] = useState(false); // mobile drawer only

  // Close the drawer with Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Mobile-only toggle */}
      <button
        type="button"
        className="filter-toggle"
        aria-expanded={open}
        aria-controls="filter-sidebar"
        onClick={() => setOpen(true)}
      >
        Filters
        {hasActiveFilters && <span className="filter-toggle__dot" />}
      </button>

      {open && (
        <div
          className="filter-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="filter-sidebar"
        className={`filter-sidebar${open ? " is-open" : ""}`}
        aria-label="Filters"
      >
        <div className="filter-sidebar__header">
          <h2>Filters</h2>
          <div className="filter-sidebar__header-actions">
            {hasActiveFilters && (
              <button type="button" className="filter-link" onClick={onClear}>
                Clear all
              </button>
            )}
            <button
              type="button"
              className="filter-close"
              aria-label="Close filters"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sort */}
        <section className="filter-section">
          <h3>Sort by</h3>
          <div role="radiogroup" aria-label="Sort products">
            {SORT_OPTIONS.map((opt) => (
              <label key={opt.value || "default"} className="filter-radio">
                <input
                  type="radio"
                  name="sort"
                  value={opt.value}
                  checked={sortValue === opt.value}
                  onChange={() => onSortChange(opt)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Category */}
        <section className="filter-section">
          <h3>Category</h3>
          <ul className="filter-categories">
            <li>
              <button
                type="button"
                className={`filter-category${selectedCategory === "" ? " is-active" : ""}`}
                aria-pressed={selectedCategory === ""}
                onClick={() => {
                  onSelectCategory("");
                  setOpen(false);
                }}
              >
                All products
              </button>
            </li>

            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <li key={i}>
                  <span className="filter-category filter-category--skeleton" />
                </li>
              ))}

            {categories.map((slug) => (
              <li key={slug}>
                <button
                  type="button"
                  className={`filter-category${selectedCategory === slug ? " is-active" : ""}`}
                  aria-pressed={selectedCategory === slug}
                  onClick={() => {
                    onSelectCategory(slug);
                    setOpen(false);
                  }}
                >
                  {formatCategory(slug)}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </>
  );
}
