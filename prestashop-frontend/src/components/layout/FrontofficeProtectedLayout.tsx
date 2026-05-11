import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useFrontofficeAuth } from "@/hooks/useFrontofficeAuth";

export function FrontofficeProtectedLayout() {
  const { authData } = useFrontofficeAuth();
  const location = useLocation();

  if (!authData.isAuthenticated || !authData.user) {
    return <Navigate to="/frontoffice/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
