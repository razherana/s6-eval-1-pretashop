import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useBackofficeAuth } from "@/hooks/useBackofficeAuth";
import { SidebarProvider } from "../ui/sidebar";
import { DashboardSidebar } from "../ui-manual/backoffice-sidebar";
import type { Route } from "../ui-manual/backoffice-nav-main";
import { ClipboardList, Home } from "lucide-react";

const routes: Route[] = [
  {
    id: "home",
    title: "Home",
    link: "/backoffice/home",
    icon: <Home className="size-4" />,
  },
  {
    id: "orders",
    title: "Orders",
    link: "/backoffice/orders",
    icon: <ClipboardList className="size-4" />,
  },

];

export function BackofficeProtectedLayout() {
  const { authData } = useBackofficeAuth();
  const location = useLocation();

  if (!authData.isAuthenticated || !authData.user)
    return <Navigate to="/backoffice/login" replace state={{ from: location }} />;

  return (
    <SidebarProvider>
      <div className="relative flex h-dvh w-full [&>*:nth-child(2)]:w-full">
        <DashboardSidebar dashboardRoutes={routes} />
        <Outlet />
      </div>
    </SidebarProvider>
  );
}