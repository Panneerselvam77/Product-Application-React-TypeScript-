import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import BaseUrl from "../../api/apiClient";
import type { Product } from "../../types";

export type SortBy = "" | "price" | "rating" | "title";
export type SortOrder = "asc" | "desc";

type ProductState = {
  products: Product[];
  isLoading: boolean;
  isError: string | null;
  hasMore: boolean;
  skip: number;
  searchQuery: string;
  selectedCategory: string; // "" means "All"
  sortBy: SortBy; // "" means API default order
  order: SortOrder;
};

const LIMIT = 10;

export const fetchProduct = createAsyncThunk(
  "fetchProduct/products",
  async (
    { skip = 0, searchQuery = "" }: { skip?: number; searchQuery?: string },
    { rejectWithValue, getState },
  ) => {
    try {
      // Category and sort come from the store (pending has already been
      // applied by now), so callers only need to pass skip + searchQuery.
      const {
        selectedCategory: category,
        sortBy,
        order,
      } = (getState() as { productState: ProductState }).productState;

      const query = searchQuery.trim();
      const params = new URLSearchParams({
        limit: String(LIMIT),
        skip: String(skip),
      });
      if (query) params.set("q", query);
      if (sortBy) {
        params.set("sortBy", sortBy);
        params.set("order", order);
      }

      // Priority: search > category > all.
      // DummyJSON can't combine search with a category filter.
      const path = query
        ? "products/search"
        : category
          ? `products/category/${encodeURIComponent(category)}`
          : "products";

      const res = (await BaseUrl.get(`${path}?${params}`)) as {
        products: Product[];
        total: number;
      };

      // Echo back what this request was for, so fulfilled can discard
      // responses that no longer match the current filters.
      return {
        products: res.products,
        total: res.total,
        searchQuery,
        category: query ? "" : category,
        sortBy,
        order,
      };
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || "error",
      });
    }
  },
);

const initialState: ProductState = {
  products: [],
  isLoading: false,
  isError: null,
  hasMore: true,
  skip: 0,
  searchQuery: "",
  selectedCategory: "",
  sortBy: "",
  order: "asc",
};

const clearList = (state: ProductState) => {
  state.products = [];
  state.skip = 0;
  state.hasMore = true;
  state.isError = null;
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // Picking a category clears the list and any active search.
    // The caller then dispatches fetchProduct for page 1.
    setCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
      state.searchQuery = "";
      clearList(state);
    },
    // Sorting keeps the current search/category.
    setSort(
      state,
      action: PayloadAction<{ sortBy: SortBy; order: SortOrder }>,
    ) {
      state.sortBy = action.payload.sortBy;
      state.order = action.payload.order;
      clearList(state);
    },
    // Resets category + sort (keeps the search text).
    resetFilters(state) {
      state.selectedCategory = "";
      state.sortBy = "";
      state.order = "asc";
      clearList(state);
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProduct.pending, (state, action) => {
        state.isLoading = true;
        state.isError = null;

        const currentQuery = action.meta.arg.searchQuery || "";

        // Searching takes over from any selected category
        if (currentQuery.trim()) {
          state.selectedCategory = "";
        }

        // If the search query changed, reset the products list and skip
        if (currentQuery !== state.searchQuery) {
          state.searchQuery = currentQuery;
          state.products = [];
          state.skip = 0;
        }
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        const p = action.payload;
        const argSkip = action.meta.arg.skip ?? 0;

        // Ignore stale responses (filters changed while this was in flight)
        if (
          p.searchQuery !== state.searchQuery ||
          p.category !== state.selectedCategory ||
          p.sortBy !== state.sortBy ||
          p.order !== state.order
        ) {
          return;
        }

        state.isLoading = false;

        // First page replaces the list; later pages append (Load More)
        state.products =
          argSkip === 0 ? p.products : [...state.products, ...p.products];

        state.skip = argSkip + LIMIT;
        state.hasMore = state.products.length < p.total;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = (action.payload as any)?.message || "Error occurred!";
      });
  },
});

export const { setCategory, setSort, resetFilters } = productSlice.actions;
export default productSlice.reducer;
