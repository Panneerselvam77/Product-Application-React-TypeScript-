import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/HomePage";
import Cart from "./pages/Cart";
import CheckOutPage from "./pages/CheckOutPage";
import PlaceOrder from "./pages/PlaceOrder";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import WishlistPage from "./pages/WishlistPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./component/ProtectedRoute";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />

        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckOutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/place-order"
          element={
            <ProtectedRoute>
              <PlaceOrder />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
