import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authcontext";

export default function RequireGuest() {
  const { token } = useAuth();

  // If logged in, bounce them away from /auth
  if (token) return <Navigate to="/" replace />;

  // Otherwise, allow them to see auth routes
  return <Outlet />;
}