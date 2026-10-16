import { useEffect, useState } from "react";
import "../css/CategoryFilter.css";

interface CategoryFilterProps {
  /** Currently selected category slug. "" means "All". */
  selected: string;
  onSelect: (category: string) => void;
}

const CATEGORIES_URL = "https://dummyjson.com/products/category-list";

// Module-level cache so navigating away and back doesn't refetch.
let cachedCategories: string[] | null = null;

/** "mens-shirts" -> "Mens Shirts" */
export const formatCategory = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function CategoryFilter({
  selected,
  onSelect,
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<string[]>(
    cachedCategories ?? [],
  );
  const [isLoading, setIsLoading] = useState(!cachedCategories);

  useEffect(() => {
    if (cachedCategories) return;
    const controller = new AbortController();

    fetch(CATEGORIES_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json() as Promise<string[]>;
      })
      .then((data) => {
        cachedCategories = data;
        setCategories(data);
      })
      .catch((err) => {
        // Filter is optional UI; fail quietly and show nothing but "All".
        if ((err as Error).name !== "AbortError") console.error(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <nav className="category-filter" aria-label="Filter by category">
      <div className="category-filter__scroll">
        <button
          type="button"
          className={`category-chip${selected === "" ? " is-active" : ""}`}
          aria-pressed={selected === ""}
          onClick={() => onSelect("")}
        >
          All
        </button>

        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="category-chip category-chip--skeleton" />
          ))}

        {categories.map((slug) => (
          <button
            key={slug}
            type="button"
            className={`category-chip${selected === slug ? " is-active" : ""}`}
            aria-pressed={selected === slug}
            onClick={() => onSelect(slug)}
          >
            {formatCategory(slug)}
          </button>
        ))}
      </div>
    </nav>
  );
}
