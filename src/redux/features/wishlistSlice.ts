import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../types";
import { loadWishlistItems } from "../wishlistStorage";

type WishlistState = {
  items: Product[];
};

// Hydrate from localStorage so the wishlist survives a refresh
const initialState: WishlistState = {
  items: loadWishlistItems(),
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Newest first; ignores duplicates
    addToWishlist: (state, action: PayloadAction<Product>) => {
      if (!state.items.some((i) => i.id === action.payload.id)) {
        state.items.unshift(action.payload);
      }
    },

    removeFromWishlist: (state, action: PayloadAction<number | string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },

    // Used by "Undo": puts removed items back (skips ones already saved)
    restoreWishlistItems: (state, action: PayloadAction<Product[]>) => {
      for (const item of action.payload) {
        if (!state.items.some((i) => i.id === item.id)) {
          state.items.push(item);
        }
      }
    },

    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export default wishlistSlice.reducer;

export const {
  addToWishlist,
  removeFromWishlist,
  restoreWishlistItems,
  clearWishlist,
} = wishlistSlice.actions;
