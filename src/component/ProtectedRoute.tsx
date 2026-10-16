import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/hooks";
import SpinningLoader from "./SpinningLoader";

/**
 * Wrap any page that needs a signed-in user. Visitors are sent to /login and
 * returned to the page they asked for afterwards.
 *
 *   <Route path="/profile" element={
 *     <ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>
 *   } />
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, initialized } = useAppSelector((state) => state.authState);
  const location = useLocation();

  // Saved session still being verified: don't flash the login page on refresh
  if (!initialized) return <SpinningLoader />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
