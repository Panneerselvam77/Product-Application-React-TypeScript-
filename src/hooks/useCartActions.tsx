import { useAppDispatch, useAppSelector } from "./hooks";
import {
  addToCart,
  clearCart,
  decreaseQuantity,
  getMaxQuantity,
  increaseQuantity,
  removeFromCart,
  restoreItems,
} from "../redux/features/cartSlice";
import type { CartItem } from "../redux/features/cartSlice";
import type { Product } from "../types";
import { notify, UndoMessage, UNDO_CLOSE } from "../utils/toastHelpers";

/**
 * Cart actions that also show the right toast. Use these instead of
 * dispatching cart actions directly so messages stay consistent.
 */
export default function useCartActions() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cartState.cartItems);

  const findItem = (id: number | string) =>
    cartItems.find((item) => item.id === id);

  /** Returns true if the item was actually added. */
  const addItem = (product: Product): boolean => {
    const toastId = `cart-${product.id}`;
    const existing = findItem(product.id);
    const limit = getMaxQuantity(existing ?? product);

    if (product.inStock === false || limit <= 0) {
      notify(toastId, "warning", `${product.title} is out of stock`);
      return false;
    }
    if (existing && existing.quantity >= limit) {
      notify(
        toastId,
        "warning",
        `Maximum of ${limit} reached for ${product.title}`,
      );
      return false;
    }

    dispatch(addToCart(product));
    notify(
      toastId,
      "success",
      existing
        ? `${product.title}: quantity updated to ${existing.quantity + 1}`
        : `${product.title} added to cart`,
    );
    return true;
  };

  const increaseItem = (id: number | string) => {
    const item = findItem(id);
    if (!item) return;
    const limit = getMaxQuantity(item);
    if (item.quantity >= limit) {
      notify(
        `cart-${id}`,
        "warning",
        `Maximum of ${limit} reached for ${item.title}`,
      );
      return;
    }
    dispatch(increaseQuantity(id));
  };

  const removeItem = (id: number | string) => {
    const item = findItem(id);
    if (!item) return;
    dispatch(removeFromCart(id));
    notify(
      `cart-${id}`,
      "info",
      <UndoMessage
        message={`${item.title} removed from cart`}
        onUndo={() => dispatch(restoreItems([item]))}
      />,
      UNDO_CLOSE,
    );
  };

  /** Decrease by one; at quantity 1 this removes the item (with Undo). */
  const decreaseItem = (id: number | string) => {
    const item = findItem(id);
    if (!item) return;
    if (item.quantity <= 1) {
      removeItem(id);
    } else {
      dispatch(decreaseQuantity(id));
    }
  };

  const clear = () => {
    if (cartItems.length === 0) return;
    const snapshot: CartItem[] = cartItems;
    dispatch(clearCart());
    notify(
      "cart-clear",
      "info",
      <UndoMessage
        message="Cart cleared"
        onUndo={() => dispatch(restoreItems(snapshot))}
      />,
      UNDO_CLOSE,
    );
  };

  return { addItem, increaseItem, decreaseItem, removeItem, clear };
}
