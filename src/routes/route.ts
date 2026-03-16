import type { ComponentType } from "react";
import { Main } from "../pages/main/Main";
import { NotFound } from "../pages/notfound/NotFound";
import { Plan } from "../pages/plan/Plan";
import { Login } from "../pages/auth/Login";
import { SettingsPage } from "../pages/settings/Settings";
import { Community } from "../pages/community/Community";
import { Checklist } from "../pages/checklist/Checklist";
import { GiftLedger } from "../pages/giftLedger/GiftLedger";
import { Guests } from "../pages/guests/Guests";
import { Invitation } from "../pages/invitation/Invitation";

export const PATHS = {
    MAIN: "/",
    PLAN: "/plan",
    LOGIN: "/login",
    SETTINGS: "/settings",
    COMMUNITY: "/community",
    CHECKLIST: "/checklist",
    GIFT_LEDGER: "/gift-ledger",
    GUESTS: "/guests",
    INVITATION: "/invitation",
    NOT_FOUND: "*",
} as const;

export const MAIN = PATHS.MAIN;
export const PLAN = PATHS.PLAN;
export const LOGIN = PATHS.LOGIN;
export const SETTINGS = PATHS.SETTINGS;
export const COMMUNITY = PATHS.COMMUNITY;
export const CHECKLIST = PATHS.CHECKLIST;
export const GIFT_LEDGER = PATHS.GIFT_LEDGER;
export const GUESTS = PATHS.GUESTS;
export const INVITATION = PATHS.INVITATION;
export const NOT_FOUND = PATHS.NOT_FOUND;
export const SHARED = "/shared"; // 공유 플랜 (동적 경로: /shared/:shareId)
export const ADMIN = "/admin";
export const INQUIRY = "/inquiry";

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
    { path: PATHS.SETTINGS, name: "Settings", icon: "", component: SettingsPage },
    { path: PATHS.COMMUNITY, name: "Community", icon: "", component: Community },
    { path: PATHS.CHECKLIST, name: "Checklist", icon: "", component: Checklist },
    { path: PATHS.GIFT_LEDGER, name: "GiftLedger", icon: "", component: GiftLedger },
    { path: PATHS.GUESTS, name: "Guests", icon: "", component: Guests },
    { path: PATHS.INVITATION, name: "Invitation", icon: "", component: Invitation },
    { path: PATHS.NOT_FOUND, name: "Not Found", icon: "", component: NotFound },
] satisfies ReadonlyArray<AppRoute>;