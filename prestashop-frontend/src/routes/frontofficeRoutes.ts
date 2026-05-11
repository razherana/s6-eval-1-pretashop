import type { RouteObject } from "react-router-dom";

export const frontofficeRoutes : RouteObject[] = [
  {
    path: "/frontoffice/login",
    lazy: () => import("@/pages/frontoffice/login/LoginPage").then(module => ({ Component: module.LoginPage }))
  }
];