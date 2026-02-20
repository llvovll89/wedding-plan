import { useEffect } from "react";

export type NavSection = "features" | "how" | "gallery";

const SECTION_TITLE: Record<NavSection, string> = {
    features: "기능",
    how: "사용법",
    gallery: "무드",
};

function FeaturesContent() {
    const items = [
        {
            icon: "🗂️",
            title: "업체/견적 저장",
            desc: "스드메·예식장·스냅·사회자 등 업체별로 금액, 메모, 링크를 카드 형태로 저장합니다.",
            detail: ["카테고리별 분류 (스드메, 예식장, 스냅 등)", "견적서 링크 첨부", "메모 자유롭게 기록"],
        },
        {
            icon: "💰",
            title: "예산 카테고리 합계",
            desc: "예약금과 잔금을 분리 입력하고, 상태(예정/확정/결제완료)별로 합계를 자동 계산합니다.",
            detail: ["예약금 / 잔금 분리 입력", "상태별 필터 합계", "전체 예산 한눈에 확인"],
        },
        {
            icon: "📅",
            title: "일정/체크리스트 연결",
            desc: "날짜가 입력된 항목은 일정으로 자동 연결되고, 해야 할 일은 체크리스트로 관리합니다.",
            detail: ["D-day 자동 계산", "날짜 입력 시 일정 자동 등록", "체크리스트로 누락 방지"],
        },
    ];

    return (
        <div className="space-y-4">
            <div className="mb-6">
                <p className="text-sm text-slate-500">"기록 → 정리 → 확인"에 집중한 기능입니다. 연동 대신, 내가 입력한 데이터가 기준이 됩니다.</p>
            </div>
            {items.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-100 bg-white p-5">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                            <div className="font-semibold text-slate-900">{item.title}</div>
                            <div className="mt-1 text-sm text-slate-500">{item.desc}</div>
                            <ul className="mt-3 space-y-1">
                                {item.detail.map((d) => (
                                    <li key={d} className="flex items-center gap-2 text-xs text-slate-600">
                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                                        {d}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function HowContent() {
    const steps = [
        {
            n: "01",
            t: "로그인 후 플랜 페이지 이동",
            d: "구글 또는 이메일로 로그인하면 나만의 플랜 공간이 생깁니다.",
            tip: "로그인 없이는 데이터가 저장되지 않아요.",
        },
        {
            n: "02",
            t: "항목 추가 & 데이터 입력",
            d: "카테고리(스드메/예식장 등)를 선택하고, 금액·날짜·상태·메모를 입력하세요.",
            tip: "예약금과 잔금은 분리해서 입력하면 합계가 자동으로 계산돼요.",
        },
        {
            n: "03",
            t: "한눈에 확인",
            d: "저장된 항목은 카드로 표시되고, 예산 합계를 실시간으로 확인할 수 있어요.",
            tip: "날짜를 입력한 항목은 D-day 흐름으로 확인할 수 있어요.",
        },
    ];

    return (
        <div className="space-y-4">
            <p className="mb-6 text-sm text-slate-500">"연동"이 아니라 "내 기록"으로 완성되는 플랜입니다. 딱 3단계로 시작할 수 있어요.</p>
            {steps.map((step, idx) => (
                <div key={step.n} className="relative flex gap-4">
                    {/* 연결선 */}
                    {idx < steps.length - 1 && (
                        <div className="absolute left-5 top-10 h-full w-px bg-rose-100" />
                    )}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-sm font-bold text-rose-600">
                        {step.n}
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 flex-1">
                        <div className="font-semibold text-slate-900">{step.t}</div>
                        <div className="mt-1 text-sm text-slate-500">{step.d}</div>
                        <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                            <span className="shrink-0">💡</span>
                            <span>{step.tip}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function GalleryContent() {
    const moods = [
        { label: "모던 미니멀", color: "from-slate-100 via-white to-slate-50", tag: "#심플 #화이트" },
        { label: "로맨틱 가든", color: "from-rose-100 via-white to-pink-50", tag: "#플라워 #야외" },
        { label: "빈티지 클래식", color: "from-amber-100 via-white to-yellow-50", tag: "#빈티지 #골드" },
        { label: "보타니컬", color: "from-emerald-100 via-white to-green-50", tag: "#그린 #자연" },
        { label: "럭셔리 블랙", color: "from-slate-200 via-slate-100 to-white", tag: "#블랙 #고급" },
        { label: "파스텔 드림", color: "from-purple-100 via-pink-50 to-rose-50", tag: "#파스텔 #몽환" },
    ];

    return (
        <div>
            <p className="mb-6 text-sm text-slate-500">웨딩 무드 보드입니다. 나중에 이미지 업로드·핀 저장 기능으로 확장될 예정이에요.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {moods.map((mood) => (
                    <div key={mood.label} className="overflow-hidden rounded-2xl border border-rose-100/70 bg-white shadow-sm">
                        <div className={`aspect-[4/3] bg-linear-to-br ${mood.color} flex items-end p-3`}>
                            <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-slate-500 backdrop-blur-sm">
                                {mood.tag}
                            </span>
                        </div>
                        <div className="px-3 py-2">
                            <div className="text-sm font-medium text-slate-800">{mood.label}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 px-4 py-3 text-center text-xs text-rose-600">
                이미지 업로드 기능은 추후 추가될 예정입니다
            </div>
        </div>
    );
}

const SECTION_CONTENT: Record<NavSection, () => JSX.Element> = {
    features: FeaturesContent,
    how: HowContent,
    gallery: GalleryContent,
};

interface Props {
    section: NavSection;
    onClose: () => void;
}

export function NavSectionModal({ section, onClose }: Props) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const Content = SECTION_CONTENT[section];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-50 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-slate-100 bg-white px-6 py-4">
                    <div className="text-base font-semibold text-slate-900">{SECTION_TITLE[section]}</div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* 본문 */}
                <div className="p-6">
                    <Content />
                </div>
            </div>
        </div>
    );
}
