import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authcontext";

export default function RootRedirect() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/auth" replace />;
}