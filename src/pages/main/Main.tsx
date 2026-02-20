import { useState } from "react";
import { Link } from "react-router-dom";
import { LOGIN, PLAN } from "../../routes/route";
import { useAuth } from "../../context/auth/AuthContext";
import { UserMenu } from "../../components/auth/UserMenu";
import { SampleDataModal } from "../../components/main/SampleDataModal";
import { NavSectionModal, type NavSection } from "../../components/main/NavSectionModal";

export const Main = () => {
    const { user, loading } = useAuth();
    const [showSample, setShowSample] = useState(false);
    const [navSection, setNavSection] = useState<NavSection | null>(null);

    return (
        <>
            <div className="min-h-screen bg-linear-to-b from-rose-50 via-white to-amber-50 text-slate-800">
                {/* Top nav */}
                <header className="sticky top-0 z-10 border-b border-rose-100/60 bg-white/70 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-linear-to-br from-rose-300 to-amber-200 shadow-sm" />
                            <span className="font-semibold tracking-tight">Wedding Plan</span>
                        </div>

                        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
                            {(["features", "how", "gallery"] as NavSection[]).map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    className="hover:text-slate-900 transition-colors"
                                    onClick={() => setNavSection(s)}
                                >
                                    {{ features: "기능", how: "사용법", gallery: "무드" }[s]}
                                </button>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2">
                            {!loading && !user ? (
                                <Link
                                    to={LOGIN}
                                    className="rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                                >
                                    로그인하고 시작
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to={PLAN}
                                        className="rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                                    >
                                        내 플랜
                                    </Link>
                                    <UserMenu />
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <main>
                    <section className="relative">
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                            <div className="absolute -top-24 left-1/2 h-72 w-xl -translate-x-1/2 rounded-full bg-linear-to-r from-rose-200/60 via-amber-100/60 to-rose-200/60 blur-3xl" />
                            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
                        </div>

                        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
                            <div className="grid items-center gap-10 md:grid-cols-2">
                                <div>
                                    <p className="inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-white/70 px-3 py-1 text-xs text-rose-700">
                                        <span className="h-2 w-2 rounded-full bg-rose-400" />
                                        내가 직접 기록하는 웨딩 플랜
                                    </p>

                                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                                        내가 직접 입력하는
                                        <br />
                                        웨딩 플랜 관리
                                    </h1>

                                    <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                                        내가 받은 견적, 예약금,
                                        날짜, 메모를 DB에 저장하고 예산/일정/체크리스트로 깔끔하게 정리합니다.
                                    </p>

                                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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
                                            className="rounded-full border border-slate-200 bg-white/70 px-5 py-3 text-sm font-medium text-slate-800 hover:bg-white"
                                        >
                                            예시 데이터 보기
                                        </button>
                                    </div>

                                    <div className="mt-7 grid max-w-xl grid-cols-3 gap-3 text-center">
                                        {[
                                            { k: "업체/견적", v: "카드처럼 저장" },
                                            { k: "예산", v: "카테고리 합계" },
                                            { k: "일정", v: "D-day 흐름" },
                                        ].map((it) => (
                                            <div
                                                key={it.k}
                                                className="rounded-2xl border border-rose-100/70 bg-white/70 px-3 py-4 shadow-sm"
                                            >
                                                <div className="text-sm font-semibold text-slate-900">
                                                    {it.k}
                                                </div>
                                                <div className="mt-1 text-xs text-slate-600">{it.v}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Data card (preview) */}
                                <div className="relative">
                                    <div className="rounded-3xl border border-rose-100/70 bg-white/70 p-5 shadow-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">내 플랜 스냅샷</div>
                                                <div className="text-xs text-slate-600">
                                                    예시 데이터는 실제 사용 화면과 다를 수 있습니다.
                                                </div>
                                            </div>
                                            <div className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                                                Preview
                                            </div>
                                        </div>

                                        <div className="mt-4 overflow-hidden rounded-2xl border border-rose-100/70">
                                            <div className="bg-white">
                                                <div className="grid grid-cols-3 gap-0 border-b border-rose-100/70 bg-linear-to-r from-rose-50 to-amber-50 px-4 py-3">
                                                    <div className="text-xs font-semibold text-slate-700">항목</div>
                                                    <div className="text-xs font-semibold text-slate-700">상태</div>
                                                    <div className="text-xs font-semibold text-slate-700 text-right">금액</div>
                                                </div>

                                                {[
                                                    { name: "스드메", status: "상담중", price: "2,300,000" },
                                                    { name: "예식장", status: "확정", price: "6,800,000" },
                                                    { name: "웨딩촬영", status: "예정", price: "1,000,000" },
                                                    { name: "신혼여행", status: "예정", price: "10,000,000" },
                                                ].map((row) => (
                                                    <div
                                                        key={row.name}
                                                        className="grid grid-cols-3 items-center gap-0 border-b border-slate-100 px-4 py-3 last:border-b-0"
                                                    >
                                                        <div className="text-sm text-slate-800">{row.name}</div>
                                                        <div className="text-xs text-slate-600">{row.status}</div>
                                                        <div className="text-sm font-semibold text-slate-900 text-right">
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
                                                    className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm text-slate-700"
                                                >
                                                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                                                    <span className="truncate">{t}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-200/50 blur-2xl" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    <section className="mx-auto max-w-6xl px-4 py-16">
                        <div className="mb-10 text-center">
                            <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">기능</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                                필요한 것만, 딱 맞게
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">복잡한 연동 없이 내가 입력한 데이터가 기준이 됩니다.</p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-3">
                            {[
                                {
                                    icon: "🗂️",
                                    title: "업체·견적 카드 저장",
                                    desc: "스드메·예식장·스냅·사회자 등 업체별로 금액, 상태, 메모, 링크를 카드로 저장합니다.",
                                    color: "from-rose-50 to-pink-50",
                                    border: "border-rose-100",
                                },
                                {
                                    icon: "💰",
                                    title: "예산 합계 자동 계산",
                                    desc: "예약금과 잔금을 분리 입력하면 카테고리별 합계와 전체 예산을 자동으로 계산합니다.",
                                    color: "from-amber-50 to-yellow-50",
                                    border: "border-amber-100",
                                },
                                {
                                    icon: "📅",
                                    title: "일정 & D-day 연결",
                                    desc: "날짜가 있는 항목은 일정으로 자동 연결되고, 결혼식까지 남은 D-day를 한눈에 확인합니다.",
                                    color: "from-emerald-50 to-teal-50",
                                    border: "border-emerald-100",
                                },
                            ].map((f) => (
                                <div
                                    key={f.title}
                                    className={`rounded-3xl border ${f.border} bg-linear-to-br ${f.color} p-6 shadow-sm`}
                                >
                                    <div className="text-3xl">{f.icon}</div>
                                    <div className="mt-4 text-base font-semibold text-slate-900">{f.title}</div>
                                    <div className="mt-2 text-sm leading-6 text-slate-600">{f.desc}</div>
                                    <button
                                        type="button"
                                        onClick={() => setNavSection("features")}
                                        className="mt-4 text-xs font-medium text-rose-600 hover:text-rose-800 transition-colors"
                                    >
                                        자세히 보기 →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* How it works */}
                    <section className="bg-white/60 py-16">
                        <div className="mx-auto max-w-6xl px-4">
                            <div className="mb-10 text-center">
                                <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">사용법</p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                                    딱 3단계로 시작
                                </h2>
                                <p className="mt-2 text-sm text-slate-500">로그인부터 플랜 완성까지 5분이면 충분합니다.</p>
                            </div>

                            <div className="relative grid gap-6 md:grid-cols-3">
                                {/* 데스크탑 연결선 */}
                                <div className="pointer-events-none absolute top-9 left-1/6 right-1/6 hidden h-px bg-rose-100 md:block" />

                                {[
                                    { n: "01", icon: "🔑", t: "로그인", d: "구글 또는 이메일로 30초 만에 계정을 만들어요." },
                                    { n: "02", icon: "✏️", t: "항목 입력", d: "카테고리를 선택하고 금액·날짜·상태·메모를 입력해요." },
                                    { n: "03", icon: "✅", t: "한눈에 확인", d: "예산 합계·D-day·누락 항목을 한 화면에서 확인해요." },
                                ].map((step) => (
                                    <div key={step.n} className="flex flex-col items-center text-center">
                                        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-rose-100 bg-white shadow-sm text-2xl">
                                            {step.icon}
                                        </div>
                                        <div className="mt-1 text-xs font-bold text-rose-400">STEP {step.n}</div>
                                        <div className="mt-2 text-sm font-semibold text-slate-900">{step.t}</div>
                                        <div className="mt-1 text-xs leading-5 text-slate-500">{step.d}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 text-center">
                                <button
                                    type="button"
                                    onClick={() => setNavSection("how")}
                                    className="text-sm font-medium text-rose-600 hover:text-rose-800 transition-colors"
                                >
                                    더 자세한 사용법 보기 →
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section className="mx-auto max-w-3xl px-4 py-16">
                        <div className="mb-10 text-center">
                            <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">FAQ</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">자주 묻는 질문</h2>
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
                                    className="group rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm"
                                >
                                    <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-slate-900 list-none">
                                        {item.q}
                                        <svg
                                            className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                                            viewBox="0 0 16 16" fill="none"
                                        >
                                            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </summary>
                                    <p className="mt-3 text-sm leading-6 text-slate-500">{item.a}</p>
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
                    <footer className="border-t border-rose-100/60 bg-white/60">
                        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
                            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-linear-to-br from-rose-300 to-amber-200" />
                                    <span className="font-medium text-slate-800">Wedding Plan</span>
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