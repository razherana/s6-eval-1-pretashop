import { createElement } from "react";
import type { RouteObject } from "react-router-dom";
import { backofficeRoutes } from "./backofficeRoutes";
import { BackofficeLayout } from "@/components/layout/BackofficeLayout";

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
    element: createElement(BackofficeLayout),
    children: backofficeRoutes,
  },
];