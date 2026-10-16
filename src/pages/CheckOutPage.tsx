import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { placeOrder } from "../redux/features/checkoutSlice";
import { clearCart } from "../redux/features/cartSlice";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import "../css/CheckOutPage.css";

export default function CheckOutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { cartItems, totalAmount, totalQuantity } = useAppSelector(
    (state) => state.cartState,
  );
  const { isSubmitting, error, orderSuccess, orderId } = useAppSelector(
    (state) => state.checkoutState,
  );

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const resultAction = await dispatch(
      placeOrder({
        shippingAddress: formData,
        paymentMethod,
        items: cartItems,
        totalAmount,
      }),
    );

    if (placeOrder.fulfilled.match(resultAction)) {
      dispatch(clearCart());
    }
  };

  if (orderSuccess) {
    return (
      <div className="checkout-success-container">
        <div className="success-card">
          <h2>🎉 Order Placed Successfully!</h2>
          <p>
            Thank you for your purchase. Your order ID is{" "}
            <strong>#{orderId}</strong>.
          </p>
          <button onClick={() => navigate("/")} className="shop-more-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <form onSubmit={handleSubmit} className="checkout-grid">
        {/* Shipping & Payment Form Section */}
        <div className="checkout-form-section">
          <h3>Shipping Address</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
              />
            </div>
            <div className="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                name="postalCode"
                required
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="10001"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              name="country"
              required
              value={formData.country}
              onChange={handleChange}
              placeholder="United States"
            />
          </div>

          <h3 className="section-subtitle">Payment Method</h3>
          <div className="payment-options">
            <label className="radio-label">
              <input
                type="radio"
                name="paymentMethod"
                value="Credit Card"
                checked={paymentMethod === "Credit Card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Credit Card
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="paymentMethod"
                value="PayPal"
                checked={paymentMethod === "PayPal"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              PayPal
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="paymentMethod"
                value="Cash on Delivery"
                checked={paymentMethod === "Cash on Delivery"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Cash on Delivery
            </label>
          </div>
        </div>

        {/* Order Review Sidebar */}
        <div className="checkout-summary-section">
          <h3>Order Summary</h3>
          <div className="summary-items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item">
                <span>
                  {item.title} (x{item.quantity})
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row">
            <span>Total Items:</span>
            <span>{totalQuantity}</span>
          </div>
          <div className="summary-row total-row">
            <span>Final Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || cartItems.length === 0}
            className="place-order-btn"
            onClick={() => navigate("/place-order")}
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
