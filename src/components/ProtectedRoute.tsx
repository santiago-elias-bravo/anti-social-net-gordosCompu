import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { esAdmin } from "../constants/admin";

interface ProtectedRouteProps {
  disallowAdmin?: boolean;
}

function ProtectedRoute({ disallowAdmin = false }: ProtectedRouteProps) {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (disallowAdmin && esAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
