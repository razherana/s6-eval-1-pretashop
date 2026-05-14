// src/routes/backofficeRoutes.ts
import type { RouteObject } from "react-router-dom";

export const backofficeRoutes: RouteObject[] = [
  {
    path: "home",
    lazy: () =>
      import("@/pages/backoffice/home/BackofficeHomePage.tsx").then(
        (module) => ({ Component: module.BackofficeHomePage }),
      ),
  },
  {
    path: "orders",
    lazy: () =>
      import("@/pages/backoffice/orders/OrdersManagementPage").then(
        (module) => ({ Component: module.OrdersManagementPage }),
      ),
  },
  {
    path: "dashboard",
    lazy: () =>
      import("@/pages/backoffice/dashboard/DashboardPage").then(
        (module) => ({ Component: module.DashboardPage }),
      ),
  },
];