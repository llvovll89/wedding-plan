import type { ComponentType } from "react";
import { Main } from "../pages/main/Main";
import { NotFound } from "../pages/notfound/NotFound";
import { Plan } from "../pages/plan/Plan";
import { Login } from "../pages/auth/Login";

export const PATHS = {
    MAIN: "/",
    PLAN: "/plan",
    LOGIN: "/login",
    NOT_FOUND: "*",
} as const;

export const MAIN = PATHS.MAIN;
export const PLAN = PATHS.PLAN;
export const LOGIN = PATHS.LOGIN;
export const NOT_FOUND = PATHS.NOT_FOUND;

export type RoutePath = (typeof PATHS)[keyof typeof PATHS];

export type AppRoute = {
    path: RoutePath;
    name: string;
    icon?: string;
    component: ComponentType;
};

export const routesPath = [
    { path: PATHS.MAIN, name: "Main", icon: "", component: Main },
    { path: PATHS.PLAN, name: "Plan", icon: "", component: Plan },
    { path: PATHS.LOGIN, name: "Login", icon: "", component: Login },
    { path: PATHS.NOT_FOUND, name: "Not Found", icon: "", component: NotFound },
] satisfies ReadonlyArray<AppRoute>;