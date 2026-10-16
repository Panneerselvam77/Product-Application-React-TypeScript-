import { configureStore } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import productReducer from "./features/productSlice.ts";
import cartReducer from "./features/cartSlice.ts";
import wishlistReducer from "./features/wishlistSlice.ts";
import authReducer, {
  restoreSession,
  sessionExpired,
} from "./features/authSlice.ts";
import checkOutReducer from "./features/checkoutSlice.ts";
import placeOrderReducer from "./features/placeorderSlice.ts";
import { saveCartItems } from "./cartStorage.ts";
import { saveWishlistItems } from "./wishlistStorage.ts";
import { AUTH_EXPIRED_EVENT } from "../api/authApi.ts";
import { getTokens } from "../api/authStorage.ts";

const store = configureStore({
  reducer: {
    productState: productReducer,
    cartState: cartReducer,
    wishlistState: wishlistReducer,
    authState: authReducer,
    checkoutState: checkOutReducer,
    placeOrder: placeOrderReducer,
  },
});

// Persist cart + wishlist to localStorage. Both are loaded back inside their
// slices; the save functions skip the write when the items are unchanged.
store.subscribe(() => {
  const { cartState, wishlistState } = store.getState();
  saveCartItems(cartState.cartItems);
  saveWishlistItems(wishlistState.items);
});

// Auth: if the user was signed in last time, verify the saved session now.
// (Tokens themselves live in authStorage, not in Redux.)
if (getTokens()) store.dispatch(restoreSession());

// authApi fires this when a token refresh fails: sign the user out in the UI.
window.addEventListener(AUTH_EXPIRED_EVENT, () => {
  store.dispatch(sessionExpired());
  toast.warning("Your session expired. Please sign in again.", {
    toastId: "session-expired",
  });
});

export default store;

export type Rootstate = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
