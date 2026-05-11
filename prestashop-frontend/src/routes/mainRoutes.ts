import { createElement } from "react";
import type { RouteObject } from "react-router-dom";
import { backofficeRoutes } from "./backofficeRoutes";
import { BackofficeProtectedLayout } from "@/components/layout/BackofficeProtectedLayout";
import { frontofficeRoutes } from "./frontofficeRoutes";

export const mainRoutes : RouteObject[] = [
  {
    path: "/",
    lazy: () => import("@/pages/home/HomePage.tsx").then(module => ({ Component: module.HomePage }))
  },
  {
    path: "/backoffice/login",
    lazy: () => import("@/pages/backoffice/login/LoginPage.tsx").then(module => ({ Component: module.LoginPage }))
  },
  {
    path: "/backoffice",
    element: createElement(BackofficeProtectedLayout),
    children: backofficeRoutes,
  },
  ...frontofficeRoutes
];