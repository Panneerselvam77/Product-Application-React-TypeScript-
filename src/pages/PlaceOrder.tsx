import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createOrder,
  resetOrderState,
} from "../redux/features/placeorderSlice";
import { clearCart } from "../redux/features/cartSlice";
import "../css/PlaceOrder.css";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";

export default function PlaceOrder() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { cartItems, totalAmount, totalQuantity } = useAppSelector(
    (state) => state.cartState,
  );
  const { loading, error, success, order } = useAppSelector(
    (state) => state.placeOrder,
  );

  // Simulated gateway states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Leaving this page resets the order state. Without this, `success` stays
  // true in the store and the next visit would show the success screen again.
  useEffect(() => {
    return () => {
      dispatch(resetOrderState());
    };
  }, [dispatch]);

  const handleConfirmPayment = async () => {
    if (cartItems.length === 0) {
      toast.warning("Your cart is empty!", { toastId: "order-empty" });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Dispatch the order creation thunk to your backend/API gateway
      const resultAction = await dispatch(
        createOrder({
          orderItems: cartItems,
          totalAmount,
          shippingAddress: {} as Parameters<
            typeof createOrder
          >[0]["shippingAddress"],
          paymentMethod: "DummyPay",
        }),
      );

      if (createOrder.fulfilled.match(resultAction)) {
        // Dispatched directly (not via useCartActions) so no
        // "Cart cleared / Undo" toast appears after a real order.
        dispatch(clearCart());
        toast.success("Payment successful! Your order has been placed.", {
          toastId: "order-success",
        });
      } else {
        toast.error(
          (resultAction.payload as string) ||
            "Payment failed. Please try again.",
          { toastId: "order-error" },
        );
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (success) {
    return (
      <div className="order-success-container">
        <div className="order-success-card">
          <h2>🎉 Payment Successful!</h2>
          <p>Your transaction has been approved.</p>
          {order?.id != null && (
            <p>
              Order Reference: <strong>#{order.id}</strong>
            </p>
          )}
          <button
            onClick={() => navigate("/")}
            className="continue-shopping-btn"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="place-order-page">
      <h1>Payment Gateway & Final Review</h1>

      <div className="place-order-grid">
        {/* Payment Gateway Simulation Section */}
        <div className="order-form-container">
          <h3>Secure Payment Simulation</h3>
          <p className="gateway-instructions">
            Please review your final total and click the button below to
            authorize payment through the secure gateway.
          </p>

          <div className="gateway-card-box">
            <div className="card-brand">DummyPay Secure Processing</div>
            <div className="card-dummy-info">
              <span>
                Card Ending in: <strong>•••• 4242</strong>
              </span>
              <span>
                Expiry: <strong>12/28</strong>
              </span>
            </div>
          </div>

          <div className="security-badge">
            🔒 256-bit Bank-Level Encrypted Connection
          </div>
        </div>

        {/* Order Cart Review */}
        <div className="order-summary-container">
          <h3>Order Breakdown</h3>
          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item-row">
                <span>
                  {item.title} (x{item.quantity})
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="divider"></div>

          <div className="summary-total-row">
            <span>Total Items:</span>
            <span>{totalQuantity}</span>
          </div>
          <div className="summary-total-row final-price">
            <span>Amount to Pay:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="button"
            disabled={loading || isProcessingPayment || cartItems.length === 0}
            onClick={handleConfirmPayment}
            className="submit-order-btn"
          >
            {loading || isProcessingPayment
              ? "Processing Payment..."
              : `Pay $${totalAmount.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
