import { NavLink, Link } from "react-router-dom";
import { UserMenu } from "../auth/UserMenu";
import { MAIN, PLAN, SETTINGS, COMMUNITY, CHECKLIST } from "../../routes/route";
import { useSettings } from "../../context/settings/SettingsContext";
import { useTheme } from "../../context/theme/ThemeContext";

function PlanIcon() {
    return (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
    );
}

function ChecklistIcon() {
    return (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none">
            <path d="M6 4h7M6 8h7M6 12h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M2.5 4.5l1 1 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.5 8.5l1 1 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="3.5" cy="12.5" r="1" stroke="currentColor" strokeWidth="1.2" />
        </svg>
    );
}

function CommunityIcon() {
    return (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none">
            <path d="M2 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H9l-3 2v-2H3a1 1 0 0 1-1-1V4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M5 7h6M5 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.06 1.06M11.54 11.54l1.06 1.06M3.4 12.6l1.06-1.06M11.54 4.46l1.06-1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
    );
}

function SunIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.06 1.06M11.54 11.54l1.06 1.06M3.4 12.6l1.06-1.06M11.54 4.46l1.06-1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 10A6 6 0 0 1 6 2.5a6 6 0 1 0 7.5 7.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function dDayText(dateStr: string): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const wedding = new Date(dateStr);
    wedding.setHours(0, 0, 0, 0);
    const diff = Math.round((wedding.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "D-Day";
    if (diff > 0) return `D-${diff}`;
    return `D+${Math.abs(diff)}`;
}

export function AppNav() {
    const { settings } = useSettings();
    const { theme, toggleTheme } = useTheme();
    const hasWeddingDate = Boolean(settings.weddingDate);

    const navItems = [
        { to: PLAN, label: "내 플랜", icon: <PlanIcon /> },
        { to: CHECKLIST, label: "체크리스트", icon: <ChecklistIcon /> },
        { to: COMMUNITY, label: "커뮤니티", icon: <CommunityIcon /> },
        { to: SETTINGS, label: "설정", icon: <SettingsIcon /> },
    ];

    return (
        <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90">
            <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5">
                {/* 로고 */}
                <Link
                    to={MAIN}
                    className="flex shrink-0 items-center gap-2 mr-1"
                >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-rose-300 to-amber-200 shadow-sm">
                        <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 14s-6-3.9-6-8a6 6 0 0 1 12 0c0 4.1-6 8-6 8z" />
                        </svg>
                    </div>
                    <span className="hidden font-semibold tracking-tight text-sm text-slate-800 sm:block dark:text-slate-200">
                        Wedding Plan
                    </span>
                </Link>

                {/* D-day 뱃지 */}
                {hasWeddingDate && (
                    <span className="hidden sm:inline-flex items-center rounded-full bg-rose-50 border border-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-300">
                        {dDayText(settings.weddingDate)}
                    </span>
                )}

                <div className="flex-1" />

                {/* 네비 링크 */}
                <nav className="flex items-center gap-0.5">
                    {navItems.map(({ to, label, icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${
                                    isActive
                                        ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                }`
                            }
                        >
                            {icon}
                            <span className="hidden sm:block">{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* 다크모드 토글 */}
                <button
                    type="button"
                    aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
                    onClick={toggleTheme}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                    {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                </button>

                <UserMenu />
            </div>
        </header>
    );
}
