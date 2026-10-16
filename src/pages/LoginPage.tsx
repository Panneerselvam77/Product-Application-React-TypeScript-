import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { clearAuthError, loginUser } from "../redux/features/authSlice";
import "../css/Auth.css";

// DummyJSON's sample account, handy while developing
const DEMO = { username: "emilys", password: "emilyspass" };

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user, loading, error } = useAppSelector((state) => state.authState);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Where to go after signing in (set by ProtectedRoute)
  const from = (
    location.state as { from?: { pathname: string; search?: string } } | null
  )?.from;
  const redirectTo = from ? `${from.pathname}${from.search ?? ""}` : "/";

  // Don't show an old error from a previous visit
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // Already signed in (or just signed in): leave this page
  if (user) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setFormError("Enter your username and password.");
      return;
    }
    setFormError(null);

    const result = await dispatch(
      loginUser({ username: username.trim(), password, remember }),
    );
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.firstName}!`, {
        toastId: "auth-login",
      });
    }
  };

  const message = formError ?? error;

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Sign in</h1>
        <p className="auth-subtitle">
          {from
            ? "Please sign in to continue."
            : "Welcome back! Enter your details."}
        </p>

        {message && (
          <p className="auth-error" role="alert">
            {message}
          </p>
        )}

        <label className="auth-field">
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <div className="auth-password">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-password__toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <label className="auth-check">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span>Keep me signed in on this device</span>
        </label>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <button
          type="button"
          className="auth-link"
          onClick={() => {
            setUsername(DEMO.username);
            setPassword(DEMO.password);
            setFormError(null);
          }}
        >
          Use demo account ({DEMO.username})
        </button>
      </form>
    </div>
  );
}
