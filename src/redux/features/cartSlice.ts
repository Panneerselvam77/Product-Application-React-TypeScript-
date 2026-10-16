import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../types";
import { loadCartItems } from "../cartStorage";

export type CartItem = Product & {
  quantity: number;
  stock?: number; // present on DummyJSON products; used to cap quantity
};

type CartState = {
  cartItems: CartItem[];
  totalItem: number; // Number of unique products in cart
  totalQuantity: number; // Total item count across all quantities
  totalAmount: number; // Total cost
};

/** Hard cap per product, lowered further by the product's own stock. */
export const MAX_PER_ITEM = 10;

/** Max quantity allowed for a product (0 means out of stock). */
export const getMaxQuantity = (item: Product | CartItem): number => {
  const stock = (item as unknown as { stock?: number }).stock;
  return typeof stock === "number"
    ? Math.min(MAX_PER_ITEM, Math.max(stock, 0))
    : MAX_PER_ITEM;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

const calcTotals = (items: CartItem[]) => ({
  totalItem: items.length,
  totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
  // round to cents so float errors like 0.1 + 0.2 don't leak into the UI
  totalAmount: round2(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  ),
});

// Recalculate cart metrics after any change
const updateCartTotals = (state: CartState) => {
  Object.assign(state, calcTotals(state.cartItems));
};

// Hydrate from localStorage so the cart survives a refresh
const savedItems = loadCartItems();

const initialState: CartState = {
  cartItems: savedItems,
  ...calcTotals(savedItems),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const newItem = action.payload;
      const existingItem = state.cartItems.find(
        (item) => item.id === newItem.id,
      );
      const limit = getMaxQuantity(existingItem ?? newItem);

      if (existingItem) {
        if (existingItem.quantity < limit) existingItem.quantity += 1;
      } else if (limit > 0) {
        state.cartItems.push({ ...newItem, quantity: 1 });
      }

      updateCartTotals(state);
    },

    increaseQuantity: (state, action: PayloadAction<number | string>) => {
      const item = state.cartItems.find((i) => i.id === action.payload);
      if (item && item.quantity < getMaxQuantity(item)) {
        item.quantity += 1;
      }
      updateCartTotals(state);
    },

    decreaseQuantity: (state, action: PayloadAction<number | string>) => {
      const id = action.payload;
      const existingItem = state.cartItems.find((item) => item.id === id);

      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
        } else {
          // If quantity drops to 0, remove the item completely
          state.cartItems = state.cartItems.filter((item) => item.id !== id);
        }
      }

      updateCartTotals(state);
    },

    // Set an exact quantity (e.g. from a number input). Clamped to the limit;
    // 0 or less removes the item.
    setQuantity: (
      state,
      action: PayloadAction<{ id: number | string; quantity: number }>,
    ) => {
      const { id, quantity } = action.payload;
      const qty = Math.floor(quantity);

      if (!Number.isFinite(qty) || qty < 1) {
        state.cartItems = state.cartItems.filter((item) => item.id !== id);
      } else {
        const item = state.cartItems.find((i) => i.id === id);
        if (item) item.quantity = Math.min(qty, getMaxQuantity(item));
      }

      updateCartTotals(state);
    },

    removeFromCart: (state, action: PayloadAction<number | string>) => {
      const id = action.payload;
      state.cartItems = state.cartItems.filter((item) => item.id !== id);
      updateCartTotals(state);
    },

    // Used by "Undo": puts removed items back (skips ones already in cart)
    restoreItems: (state, action: PayloadAction<CartItem[]>) => {
      for (const item of action.payload) {
        if (!state.cartItems.some((i) => i.id === item.id)) {
          state.cartItems.push(item);
        }
      }
      updateCartTotals(state);
    },

    clearCart: (state) => {
      state.cartItems = [];
      updateCartTotals(state);
    },
  },
});

export default cartSlice.reducer;

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  setQuantity,
  removeFromCart,
  restoreItems,
  clearCart,
} = cartSlice.actions;
