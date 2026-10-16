import { useEffect, useState } from "react";

const CATEGORIES_URL = "https://dummyjson.com/products/category-list";

// Module-level cache so remounting (e.g. coming back from a product page)
// doesn't refetch.
let cachedCategories: string[] | null = null;

/** "mens-shirts" -> "Mens Shirts" */
export const formatCategory = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function useCategories() {
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
        // Filtering is optional UI; fail quietly and show only "All".
        if ((err as Error).name !== "AbortError") console.error(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { categories, isLoading };
}
