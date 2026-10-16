import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { logoutUser } from "../redux/features/authSlice";
import "../css/Auth.css";

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="profile-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.authState.user);
  const cartCount = useAppSelector((state) => state.cartState.totalQuantity);
  const wishlistCount = useAppSelector(
    (state) => state.wishlistState.items.length,
  );

  // ProtectedRoute guarantees a user; this only satisfies TypeScript
  if (!user) return null;

  const address = user.address
    ? [
        user.address.address,
        user.address.city,
        user.address.state,
        user.address.postalCode,
        user.address.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const handleLogout = async () => {
    navigate("/", { replace: true }); // leave first so ProtectedRoute doesn't bounce to /login
    await dispatch(logoutUser());
    toast.info("You've been signed out.", { toastId: "auth-logout" });
  };

  return (
    <div className="profile-page">
      <section className="auth-card profile-card">
        <header className="profile-header">
          {user.image && (
            <img
              src={user.image}
              alt=""
              className="profile-avatar"
              width={88}
              height={88}
            />
          )}
          <div>
            <h1>
              {user.firstName} {user.lastName}
            </h1>
            <p className="auth-subtitle">@{user.username}</p>
          </div>
        </header>

        <div className="profile-stats">
          <Link to="/cart" className="profile-stat">
            <strong>{cartCount}</strong>
            <span>In cart</span>
          </Link>
          <Link to="/wishlist" className="profile-stat">
            <strong>{wishlistCount}</strong>
            <span>Wishlist</span>
          </Link>
        </div>

        <h2 className="profile-section">Account</h2>
        <dl className="profile-list">
          <Row label="Email" value={user.email} />
          <Row label="Phone" value={user.phone} />
          <Row label="Gender" value={user.gender} />
          <Row label="Birth date" value={user.birthDate} />
        </dl>

        {address && (
          <>
            <h2 className="profile-section">Address</h2>
            <dl className="profile-list">
              <Row label="Shipping" value={address} />
            </dl>
          </>
        )}

        {user.company?.name && (
          <>
            <h2 className="profile-section">Work</h2>
            <dl className="profile-list">
              <Row label="Company" value={user.company.name} />
              <Row label="Title" value={user.company.title} />
              <Row label="Department" value={user.company.department} />
            </dl>
          </>
        )}

        <button
          type="button"
          className="auth-btn auth-btn--outline"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </section>
    </div>
  );
}
