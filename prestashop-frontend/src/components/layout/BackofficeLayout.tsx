import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useBackofficeAuth } from "@/hooks/useBackofficeAuth";

export function BackofficeLayout() {
  const { authData } = useBackofficeAuth();
  const location = useLocation();

  if (!authData.isAuthenticated || !authData.user) {
    return <Navigate to="/backoffice/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}