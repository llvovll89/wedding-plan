import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { UserMenu } from "../auth/UserMenu";
import { MAIN, PLAN, SETTINGS, COMMUNITY, CHECKLIST } from "../../routes/route";
import { useSettings } from "../../context/settings/SettingsContext";
import { useTheme } from "../../context/theme/ThemeContext";
import { NavSectionModal, type NavSection } from "../main/NavSectionModal";

const ADMIN_UIDS: string[] = ((import.meta.env.VITE_ADMIN_UIDS as string) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

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
            <path d="M2 4h1.4M6.6 4H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="5" cy="4" r="1.7" stroke="currentColor" strokeWidth="1.3" />
            <path d="M2 8h7.4M12.6 8H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="11" cy="8" r="1.7" stroke="currentColor" strokeWidth="1.3" />
            <path d="M2 12h4.1M9.9 12H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="8" cy="12" r="1.7" stroke="currentColor" strokeWidth="1.3" />
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

function HelpModal({ onClose }: { onClose: () => void }) {
    const tips = [
        { icon: "📋", title: "내 플랜", desc: "항목 추가 시 카테고리·상태·예약금/잔금을 입력하면 예산 합계가 자동 계산돼요." },
        { icon: "🔍", title: "예식장 검색", desc: "내 플랜 > 항목명 입력 시 돋보기 버튼으로 카카오맵 기반 예식장을 검색할 수 있어요." },
        { icon: "✅", title: "체크리스트", desc: "결혼 준비 단계별 체크리스트를 제공해요. 체크한 항목은 브라우저에 저장돼요." },
        { icon: "💬", title: "커뮤니티", desc: "실제 결혼 비용과 후기를 공유하고 다른 커플의 경험을 참고할 수 있어요." },
        { icon: "🔗", title: "공유 링크", desc: "내 플랜을 링크로 공유하면 로그인 없이도 열람할 수 있어요." },
    ];
    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm">
            <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="font-semibold text-slate-900 dark:text-slate-100">도움말</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
                    >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none">
                            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
                <ul className="px-4 py-4 space-y-3">
                    {tips.map((t) => (
                        <li key={t.title} className="flex gap-3">
                            <span className="text-lg shrink-0">{t.icon}</span>
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.desc}</p>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="px-4 pb-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}

const NAV_SECTION_ITEMS: { key: NavSection; label: string; icon: string }[] = [
    { key: "gallery", label: "무드", icon: "🌸" },
    { key: "how", label: "사용법", icon: "📖" },
    { key: "features", label: "기능", icon: "🗂️" },
];

export function AppNav() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [navSection, setNavSection] = useState<NavSection | null>(null);
    const { settings } = useSettings();
    const { theme, toggleTheme } = useTheme();
    const hasWeddingDate = Boolean(settings.weddingDate);

    const navItems = [
        { to: PLAN, label: "내 플랜", icon: <PlanIcon /> },
        { to: CHECKLIST, label: "체크리스트", icon: <ChecklistIcon /> },
        { to: COMMUNITY, label: "커뮤니티", icon: <CommunityIcon /> },
        { to: SETTINGS, label: "설정", icon: <SettingsIcon /> },
    ];

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${isActive
            ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        }`;

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90">
                <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
                    {/* 로고 */}
                    <Link to={MAIN} className="flex shrink-0 items-center gap-2 mr-1">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-rose-400 to-amber-300 shadow-sm">
                            <svg className="h-3 w-4 text-white" viewBox="0 0 20 10" fill="none">
                                <circle cx="6.5" cy="5" r="4.5" stroke="currentColor" strokeWidth="1.9" />
                                <circle cx="13.5" cy="5" r="4.5" stroke="currentColor" strokeWidth="1.9" />
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

                    {/* 데스크탑 네비 */}
                    <nav className="hidden sm:flex items-center gap-0.5">
                        {navItems.map(({ to, label, icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) => navLinkClass({ isActive })}
                            >
                                {icon}
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <UserMenu />

                    {/* 모바일 햄버거 */}
                    <button
                        type="button"
                        aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
                        onClick={() => setMobileOpen((v) => !v)}
                        className="sm:hidden flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        {mobileOpen ? (
                            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                        ) : (
                            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                        )}
                    </button>
                </div>

            </header>
            {/* 헤더가 fixed이므로 아래 콘텐츠가 가려지지 않도록 높이 보상 */}
            <div className="h-[52px]" />

            {/* 모바일 드롭다운 (fixed — 스크롤과 무관하게 고정) */}
            {mobileOpen && (
                <>
                    {/* 백드롭 */}
                    <div
                        className="fixed inset-0 z-[15] bg-black/20 sm:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                    {/* 메뉴 패널 */}
                    <div className="fixed inset-x-0 top-[52px] z-[16] sm:hidden border-b border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                        <nav className="mx-auto max-w-6xl px-3 py-2 space-y-0.5">
                            {navItems.map(({ to, label, icon }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    onClick={() => setMobileOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                            ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                                            : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                                        }`
                                    }
                                >
                                    {icon}
                                    {label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </>
            )}

            {/* 도움말 모달 */}
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

            {/* NavSection 모달 (무드/사용법/기능) */}
            {navSection && <NavSectionModal section={navSection} onClose={() => setNavSection(null)} />}

            {/* FAB - 도움말 + 다크모드 */}
            <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2">
                {/* 확장 옵션 */}
                {fabOpen && (
                    <>
                        {/* 백드롭 */}
                        <div
                            className="fixed inset-0 z-[-1]"
                            onClick={() => setFabOpen(false)}
                        />
                        {/* 무드/사용법/기능 */}
                        {NAV_SECTION_ITEMS.map(({ key, label, icon }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => { setNavSection(key); setFabOpen(false); }}
                                className="flex items-center gap-2.5 rounded-full bg-white border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-lg hover:bg-slate-50 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                <span>{icon}</span>
                                <span>{label}</span>
                            </button>
                        ))}
                        {/* 도움말 */}
                        <button
                            type="button"
                            onClick={() => { setShowHelp(true); setFabOpen(false); }}
                            className="flex items-center gap-2.5 rounded-full bg-white border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-lg hover:bg-slate-50 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                                <path d="M6.5 6C6.5 5.17 7.17 4.5 8 4.5s1.5.67 1.5 1.5c0 .67-.4 1.24-1 1.47V8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                <circle cx="8" cy="10.5" r="0.7" fill="currentColor" />
                            </svg>
                            <span>도움말</span>
                        </button>
                        {/* 다크모드 */}
                        <button
                            type="button"
                            aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
                            onClick={() => { toggleTheme(); setFabOpen(false); }}
                            className="flex items-center gap-2.5 rounded-full bg-white border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-lg hover:bg-slate-50 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                            <span>{theme === "dark" ? "라이트 모드" : "다크 모드"}</span>
                        </button>
                    </>
                )}

                {/* 메인 FAB */}
                <button
                    type="button"
                    aria-label={fabOpen ? "메뉴 닫기" : "메뉴 열기"}
                    onClick={() => setFabOpen((v) => !v)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-700 transition-all dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                    {fabOpen ? (
                        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                            <circle cx="8" cy="3.5" r="1.2" fill="currentColor" />
                            <circle cx="8" cy="12.5" r="1.2" fill="currentColor" />
                        </svg>
                    )}
                </button>
            </div>
        </>
    );
}
