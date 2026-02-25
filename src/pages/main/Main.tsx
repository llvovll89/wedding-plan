import { useState } from "react";
import { Link } from "react-router-dom";
import { LOGIN, PLAN, COMMUNITY } from "../../routes/route";
import { useAuth } from "../../context/auth/AuthContext";
import { useTheme } from "../../context/theme/ThemeContext";
import { UserMenu } from "../../components/auth/UserMenu";
import { SampleDataModal } from "../../components/main/SampleDataModal";
import { NavSectionModal, type NavSection } from "../../components/main/NavSectionModal";

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

export const Main = () => {
    const { user, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showSample, setShowSample] = useState(false);
    const [navSection, setNavSection] = useState<NavSection | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <div className="min-h-screen overflow-x-hidden bg-linear-to-b from-rose-50 via-white to-amber-50 text-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 dark:text-slate-200">
                {/* Top nav */}
                <header className="sticky top-0 z-10 border-b border-rose-100/60 bg-white/70 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                        {/* 로고 */}
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="h-8 w-8 shrink-0 rounded-full bg-linear-to-br from-rose-300 to-amber-200 shadow-sm" />
                            <span className="hidden sm:block font-semibold tracking-tight dark:text-slate-100">Wedding Plan</span>
                        </div>

                        {/* 데스크탑 네비 */}
                        <nav className="hidden items-center gap-1 text-sm text-slate-600 md:flex dark:text-slate-400">
                            {(["features", "how", "gallery"] as NavSection[]).map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    className="rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                    onClick={() => setNavSection(s)}
                                >
                                    {{ features: "기능", how: "사용법", gallery: "무드" }[s]}
                                </button>
                            ))}
                            <Link
                                to={COMMUNITY}
                                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-medium dark:text-rose-400 dark:hover:bg-rose-900/20"
                            >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
                                    <path d="M2 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H9l-3 2v-2H3a1 1 0 0 1-1-1V4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                                </svg>
                                커뮤니티
                            </Link>
                        </nav>

                        {/* 오른쪽 영역 */}
                        <div className="flex items-center gap-2">
                            {/* 다크모드 토글 */}
                            <button
                                type="button"
                                aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
                                onClick={toggleTheme}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                            </button>

                            {/* 데스크탑 전용 CTA 버튼 */}
                            {!loading && !user ? (
                                <Link
                                    to={LOGIN}
                                    className="hidden sm:block rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                                >
                                    로그인하고 시작
                                </Link>
                            ) : (
                                <Link
                                    to={PLAN}
                                    className="hidden sm:block rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                                >
                                    내 플랜
                                </Link>
                            )}

                            {/* UserMenu (로그인 시) */}
                            {!loading && user && <UserMenu />}

                            {/* 모바일 햄버거 */}
                            <button
                                type="button"
                                aria-label="메뉴"
                                onClick={() => setMobileMenuOpen((v) => !v)}
                                className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/70 text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                                {mobileMenuOpen ? (
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
                    </div>

                    {/* 모바일 드롭다운 메뉴 */}
                    {mobileMenuOpen && (
                        <div className="border-t border-slate-100 bg-white/95 backdrop-blur md:hidden dark:border-slate-700 dark:bg-slate-900/95">
                            <div className="mx-auto max-w-6xl px-4 py-3 space-y-1">
                                {(["features", "how", "gallery"] as NavSection[]).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => { setNavSection(s); setMobileMenuOpen(false); }}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        {{ features: "🗂️ 기능", how: "📖 사용법", gallery: "🌸 무드" }[s]}
                                    </button>
                                ))}
                                <Link
                                    to={COMMUNITY}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors dark:text-rose-400 dark:hover:bg-rose-900/20"
                                >
                                    💬 커뮤니티
                                </Link>
                                <div className="my-2 h-px bg-slate-100 dark:bg-slate-700" />
                                {!loading && !user ? (
                                    <Link
                                        to={LOGIN}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex w-full items-center gap-3 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600"
                                    >
                                        로그인하고 시작
                                    </Link>
                                ) : (
                                    <Link
                                        to={PLAN}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex w-full items-center gap-3 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600"
                                    >
                                        📋 내 플랜 바로가기
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </header>

                {/* Hero */}
                <main>
                    <section className="relative">
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                            <div className="absolute -top-24 left-1/2 h-72 w-xl -translate-x-1/2 rounded-full bg-linear-to-r from-rose-200/60 via-amber-100/60 to-rose-200/60 blur-3xl dark:from-rose-900/20 dark:via-amber-900/10 dark:to-rose-900/20" />
                            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-900/10" />
                        </div>

                        <div className="mx-auto max-w-6xl px-4 py-10 md:py-20">
                            <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
                                <div>
                                    <p className="inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-white/70 px-3 py-1 text-xs text-rose-700 dark:border-rose-800/60 dark:bg-slate-800/70 dark:text-rose-300">
                                        <span className="h-2 w-2 rounded-full bg-rose-400" />
                                        내가 직접 기록하는 웨딩 플랜
                                    </p>

                                    <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-5xl dark:text-slate-100">
                                        내가 직접 입력하는<br />
                                        웨딩 플랜 관리
                                    </h1>

                                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
                                        내가 받은 견적, 예약금, 날짜, 메모를 저장하고 예산/일정/체크리스트로 깔끔하게 정리합니다.
                                    </p>

                                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                        {!loading && !user ? (
                                            <Link
                                                to={LOGIN}
                                                className="rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-rose-500"
                                            >
                                                로그인하고 시작
                                            </Link>
                                        ) : (
                                            <Link
                                                to={PLAN}
                                                className="rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-rose-500"
                                            >
                                                새 플랜 만들기
                                            </Link>
                                        )}

                                        <button
                                            onClick={() => setShowSample(true)}
                                            className="rounded-full border border-slate-200 bg-white/70 px-5 py-3 text-sm font-medium text-slate-800 hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800"
                                        >
                                            예시 데이터 보기
                                        </button>
                                    </div>

                                    <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3 text-center">
                                        {[
                                            { k: "업체/견적", v: "카드 저장" },
                                            { k: "예산", v: "합계 자동" },
                                            { k: "일정", v: "D-day" },
                                        ].map((it) => (
                                            <div
                                                key={it.k}
                                                className="rounded-2xl border border-rose-100/70 bg-white/70 px-2 py-3 shadow-sm sm:px-3 sm:py-4 dark:border-slate-700 dark:bg-slate-800/70"
                                            >
                                                <div className="text-xs font-semibold text-slate-900 sm:text-sm dark:text-slate-100">
                                                    {it.k}
                                                </div>
                                                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{it.v}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Data card (preview) */}
                                <div className="relative overflow-hidden">
                                    <div className="rounded-3xl border border-rose-100/70 bg-white/70 p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800/70">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">내 플랜 스냅샷</div>
                                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                                    예시 데이터는 실제 사용 화면과 다를 수 있습니다.
                                                </div>
                                            </div>
                                            <div className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                                                Preview
                                            </div>
                                        </div>

                                        <div className="mt-4 overflow-hidden rounded-2xl border border-rose-100/70 dark:border-slate-700">
                                            <div className="bg-white dark:bg-slate-800">
                                                <div className="grid grid-cols-3 gap-0 border-b border-rose-100/70 bg-linear-to-r from-rose-50 to-amber-50 px-4 py-3 dark:border-slate-700 dark:from-slate-700 dark:to-slate-700">
                                                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">항목</div>
                                                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">상태</div>
                                                    <div className="text-xs font-semibold text-slate-700 text-right dark:text-slate-300">금액</div>
                                                </div>

                                                {[
                                                    { name: "스드메", status: "상담중", price: "2,300,000" },
                                                    { name: "예식장", status: "확정", price: "6,800,000" },
                                                    { name: "웨딩촬영", status: "예정", price: "1,000,000" },
                                                    { name: "신혼여행", status: "예정", price: "10,000,000" },
                                                ].map((row) => (
                                                    <div
                                                        key={row.name}
                                                        className="grid grid-cols-3 items-center gap-0 border-b border-slate-100 px-4 py-3 last:border-b-0 dark:border-slate-700"
                                                    >
                                                        <div className="text-sm text-slate-800 dark:text-slate-200">{row.name}</div>
                                                        <div className="text-xs text-slate-600 dark:text-slate-400">{row.status}</div>
                                                        <div className="text-sm font-semibold text-slate-900 text-right dark:text-slate-100">
                                                            {row.price}원
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-2">
                                            {[
                                                "견적서 링크/메모 저장 (업체 카드)",
                                                "예약금/잔금 분리 입력 (예산 합계)",
                                                "날짜 입력 시 일정/체크리스트에 연결",
                                            ].map((t) => (
                                                <div
                                                    key={t}
                                                    className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                                >
                                                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                                                    <span className="truncate">{t}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-full bg-amber-200/50 blur-2xl dark:bg-amber-900/20" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    <section className="mx-auto max-w-6xl px-4 py-16">
                        <div className="mb-10 text-center">
                            <p className="text-xs font-semibold uppercase tracking-widest text-rose-500 dark:text-rose-400">기능</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
                                필요한 것만, 딱 맞게
                            </h2>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">복잡한 연동 없이 내가 입력한 데이터가 기준이 됩니다.</p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-3">
                            {[
                                {
                                    icon: "🗂️",
                                    title: "업체·견적 카드 저장",
                                    desc: "스드메·예식장·스냅·사회자 등 업체별로 금액, 상태, 메모, 링크를 카드로 저장합니다.",
                                    color: "from-rose-50 to-pink-50",
                                    border: "border-rose-100",
                                    darkColor: "dark:from-rose-900/10 dark:to-pink-900/10",
                                    darkBorder: "dark:border-rose-900/40",
                                },
                                {
                                    icon: "💰",
                                    title: "예산 합계 자동 계산",
                                    desc: "예약금과 잔금을 분리 입력하면 카테고리별 합계와 전체 예산을 자동으로 계산합니다.",
                                    color: "from-amber-50 to-yellow-50",
                                    border: "border-amber-100",
                                    darkColor: "dark:from-amber-900/10 dark:to-yellow-900/10",
                                    darkBorder: "dark:border-amber-900/40",
                                },
                                {
                                    icon: "📅",
                                    title: "일정 & D-day 연결",
                                    desc: "날짜가 있는 항목은 일정으로 자동 연결되고, 결혼식까지 남은 D-day를 한눈에 확인합니다.",
                                    color: "from-emerald-50 to-teal-50",
                                    border: "border-emerald-100",
                                    darkColor: "dark:from-emerald-900/10 dark:to-teal-900/10",
                                    darkBorder: "dark:border-emerald-900/40",
                                },
                            ].map((f) => (
                                <div
                                    key={f.title}
                                    className={`rounded-3xl border ${f.border} ${f.darkBorder} bg-linear-to-br ${f.color} ${f.darkColor} p-6 shadow-sm`}
                                >
                                    <div className="text-3xl">{f.icon}</div>
                                    <div className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">{f.title}</div>
                                    <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{f.desc}</div>
                                    <button
                                        type="button"
                                        onClick={() => setNavSection("features")}
                                        className="mt-4 text-xs font-medium text-rose-600 hover:text-rose-800 transition-colors dark:text-rose-400 dark:hover:text-rose-300"
                                    >
                                        자세히 보기 →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* How it works */}
                    <section className="bg-white/60 py-16 dark:bg-slate-800/30">
                        <div className="mx-auto max-w-6xl px-4">
                            <div className="mb-10 text-center">
                                <p className="text-xs font-semibold uppercase tracking-widest text-rose-500 dark:text-rose-400">사용법</p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
                                    딱 3단계로 시작
                                </h2>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">로그인부터 플랜 완성까지 5분이면 충분합니다.</p>
                            </div>

                            <div className="relative grid gap-6 md:grid-cols-3">
                                {/* 데스크탑 연결선 */}
                                <div className="pointer-events-none absolute top-9 left-1/6 right-1/6 hidden h-px bg-rose-100 md:block dark:bg-slate-700" />

                                {[
                                    { n: "01", icon: "🔑", t: "로그인", d: "구글 또는 이메일로 30초 만에 계정을 만들어요." },
                                    { n: "02", icon: "✏️", t: "항목 입력", d: "카테고리를 선택하고 금액·날짜·상태·메모를 입력해요." },
                                    { n: "03", icon: "✅", t: "한눈에 확인", d: "예산 합계·D-day·누락 항목을 한 화면에서 확인해요." },
                                ].map((step) => (
                                    <div key={step.n} className="flex flex-col items-center text-center">
                                        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-rose-100 bg-white shadow-sm text-2xl dark:border-slate-700 dark:bg-slate-800">
                                            {step.icon}
                                        </div>
                                        <div className="mt-1 text-xs font-bold text-rose-400 dark:text-rose-400">STEP {step.n}</div>
                                        <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{step.t}</div>
                                        <div className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{step.d}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 text-center">
                                <button
                                    type="button"
                                    onClick={() => setNavSection("how")}
                                    className="text-sm font-medium text-rose-600 hover:text-rose-800 transition-colors dark:text-rose-400 dark:hover:text-rose-300"
                                >
                                    더 자세한 사용법 보기 →
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section className="mx-auto max-w-3xl px-4 py-16">
                        <div className="mb-10 text-center">
                            <p className="text-xs font-semibold uppercase tracking-widest text-rose-500 dark:text-rose-400">FAQ</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">자주 묻는 질문</h2>
                        </div>

                        <div className="space-y-3">
                            {[
                                {
                                    q: "무료로 사용할 수 있나요?",
                                    a: "네, 현재 모든 기능을 무료로 제공하고 있습니다.",
                                },
                                {
                                    q: "데이터는 어디에 저장되나요?",
                                    a: "Firebase(Google 클라우드)에 안전하게 저장됩니다. 로그인한 계정에만 접근 가능합니다.",
                                },
                                {
                                    q: "여러 기기에서 동시에 사용할 수 있나요?",
                                    a: "네, 같은 계정으로 로그인하면 PC·모바일 어디서든 동일한 데이터를 확인할 수 있습니다.",
                                },
                                {
                                    q: "구글 계정 없이도 가입할 수 있나요?",
                                    a: "네, 이메일과 비밀번호로도 회원가입이 가능합니다.",
                                },
                            ].map((item) => (
                                <details
                                    key={item.q}
                                    className="group rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                                >
                                    <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-slate-900 list-none dark:text-slate-100">
                                        {item.q}
                                        <svg
                                            className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180 dark:text-slate-500"
                                            viewBox="0 0 16 16" fill="none"
                                        >
                                            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </summary>
                                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.a}</p>
                                </details>
                            ))}
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="mx-auto max-w-6xl px-4 pb-20">
                        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-rose-500 to-rose-700 px-8 py-14 text-center shadow-lg">
                            <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                            <h2 className="relative text-2xl font-bold text-white md:text-3xl">
                                웨딩 준비, 지금 바로 시작해요
                            </h2>
                            <p className="relative mt-3 text-sm text-rose-100">
                                흩어진 견적서·메모를 한 곳에 정리하고, 예산과 일정을 한눈에 확인하세요.
                            </p>

                            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                {!loading && !user ? (
                                    <Link
                                        to={LOGIN}
                                        className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-rose-600 shadow hover:bg-rose-50 transition-colors"
                                    >
                                        무료로 시작하기
                                    </Link>
                                ) : (
                                    <Link
                                        to={PLAN}
                                        className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-rose-600 shadow hover:bg-rose-50 transition-colors"
                                    >
                                        내 플랜 바로가기
                                    </Link>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowSample(true)}
                                    className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                                >
                                    예시 데이터 보기
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="border-t border-rose-100/60 bg-white/60 dark:border-slate-700 dark:bg-slate-900/60">
                        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-linear-to-br from-rose-300 to-amber-200" />
                                    <span className="font-medium text-slate-800 dark:text-slate-200">Wedding Plan</span>
                                </div>
                                <div className="text-xs">
                                    © {new Date().getFullYear()} Wedding Plan. All rights reserved.
                                </div>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>

            {showSample && <SampleDataModal onClose={() => setShowSample(false)} />}
            {navSection && <NavSectionModal section={navSection} onClose={() => setNavSection(null)} />}
        </>
    );
};
