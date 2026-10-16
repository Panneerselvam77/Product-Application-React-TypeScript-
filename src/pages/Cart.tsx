import { Link, useNavigate } from "react-router-dom";
import { getMaxQuantity } from "../redux/features/cartSlice";
import { useAppSelector } from "../hooks/hooks";
import useCartActions from "../hooks/useCartActions";

export default function Cart() {
  const navigation = useNavigate();
  const { increaseItem, decreaseItem, removeItem, clear } = useCartActions();
  const { cartItems, totalQuantity, totalAmount } = useAppSelector(
    (state) => state.cartState,
  );

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="shop-now-btn">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">Your Shopping Cart</h1>

      <div className="cart-content">
        {/* Cart Items List */}
        <div className="cart-items-list">
          {cartItems.map((item) => {
            const atLimit = item.quantity >= getMaxQuantity(item);

            return (
              <div key={item.id} className="cart-item">
                <Link to={`/product/${item.id}`}>
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="cart-item-image"
                  />
                </Link>

                <div className="cart-item-details">
                  <h3>{item.title}</h3>
                  <p className="cart-item-price">${item.price.toFixed(2)}</p>
                  {item.quantity > 1 && (
                    <p className="cart-item-subtotal">
                      Subtotal: ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button
                      onClick={() => decreaseItem(item.id)}
                      className="qty-btn"
                      aria-label={`Decrease quantity of ${item.title}`}
                    >
                      -
                    </button>
                    <span className="qty-value" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseItem(item.id)}
                      className="qty-btn"
                      disabled={atLimit}
                      title={atLimit ? "Maximum quantity reached" : undefined}
                      aria-label={`Increase quantity of ${item.title}`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          <div className="cart-actions-bottom">
            <button onClick={clear} className="clear-cart-btn">
              Clear Cart
            </button>
          </div>
        </div>

        {/* Cart Summary Card */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Total Items:</span>
            <span>{totalQuantity}</span>
          </div>
          <div className="summary-row total-row">
            <span>Total Amount:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <button
            onClick={() => navigation("/checkout")}
            className="checkout-btn"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
