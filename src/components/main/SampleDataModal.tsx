import { useEffect } from "react";
import type { PlanCategory, PlanStatus } from "../../types/plan";

const CATEGORY_LABEL: Record<PlanCategory, string> = {
    sdeume: "스드메",
    venue: "예식장",
    studio: "웨딩촬영",
    snapshot: "스냅",
    mc: "사회자",
    honeymoon: "신혼여행",
    invitation: "청첩장",
    gift: "예물/예단",
    hanbok: "한복/예복",
    favor: "답례품",
    ceremony: "폐백/이바지",
    newhome: "신혼집",
    etc: "기타",
};

const STATUS_LABEL: Record<PlanStatus, string> = {
    planned: "예정",
    in_progress: "진행중",
    confirmed: "확정",
    paid: "결제완료",
};

const STATUS_COLOR: Record<PlanStatus, string> = {
    planned: "bg-slate-100 text-slate-600",
    in_progress: "bg-amber-50 text-amber-700",
    confirmed: "bg-rose-50 text-rose-700",
    paid: "bg-emerald-50 text-emerald-700",
};

function formatKRW(n: number) {
    return `${n.toLocaleString("ko-KR")}원`;
}

const SAMPLE_ITEMS: {
    name: string;
    category: PlanCategory;
    status: PlanStatus;
    deposit: number;
    balance: number;
    memo?: string;
    dueDate?: string;
}[] = [
    { name: "스드메 패키지", category: "sdeume",    status: "confirmed",   deposit: 500_000,   balance: 1_800_000, memo: "드레스 2벌 포함, 메이크업 리허설 1회", dueDate: "2026-09-10" },
    { name: "예식장 (그랜드홀)", category: "venue",  status: "paid",        deposit: 1_000_000, balance: 5_800_000, memo: "토요일 오후 2시, 150석", dueDate: "2026-10-18" },
    { name: "웨딩촬영 (야외)",   category: "studio", status: "confirmed",   deposit: 300_000,   balance: 700_000,  memo: "본식 전날 야외 촬영", dueDate: "2026-10-17" },
    { name: "스냅 촬영",         category: "snapshot",status: "in_progress", deposit: 200_000,   balance: 600_000,  memo: "작가 포트폴리오 비교중" },
    { name: "사회자",            category: "mc",     status: "planned",     deposit: 0,         balance: 400_000 },
    { name: "신혼여행 (몰디브)", category: "honeymoon", status: "in_progress", deposit: 2_000_000, balance: 8_000_000, memo: "항공권 예약 완료, 호텔 대기", dueDate: "2026-10-19" },
];

const total = SAMPLE_ITEMS.reduce((s, i) => s + i.deposit + i.balance, 0);
const paidTotal = SAMPLE_ITEMS
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.deposit + i.balance, 0);

interface Props {
    onClose: () => void;
}

export function SampleDataModal({ onClose }: Props) {
    // ESC 키로 닫기
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    // 스크롤 잠금
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-slate-100 bg-white px-6 py-4">
                    <div>
                        <div className="text-base font-semibold text-slate-900">예시 플랜 미리보기</div>
                        <div className="mt-0.5 text-xs text-slate-500">실제 사용 시 이런 형태로 저장됩니다</div>
                    </div>
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

                {/* 예산 요약 */}
                <div className="grid grid-cols-2 gap-3 px-6 py-4 border-b border-slate-100">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="text-xs text-slate-500">총 예산</div>
                        <div className="mt-1 text-lg font-bold text-slate-900">{formatKRW(total)}</div>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                        <div className="text-xs text-emerald-600">결제 완료</div>
                        <div className="mt-1 text-lg font-bold text-emerald-700">{formatKRW(paidTotal)}</div>
                    </div>
                </div>

                {/* 항목 목록 */}
                <div className="grid gap-3 p-6 sm:grid-cols-2">
                    {SAMPLE_ITEMS.map((item) => {
                        const itemTotal = item.deposit + item.balance;
                        return (
                            <div
                                key={item.name}
                                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold text-slate-900">{item.name}</div>
                                        <div className="mt-0.5 text-xs text-slate-500">{CATEGORY_LABEL[item.category]}</div>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[item.status]}`}>
                                        {STATUS_LABEL[item.status]}
                                    </span>
                                </div>

                                <div className="mt-3 flex gap-3 text-xs text-slate-600">
                                    <span>예약금 <span className="font-medium text-slate-800">{formatKRW(item.deposit)}</span></span>
                                    <span>잔금 <span className="font-medium text-slate-800">{formatKRW(item.balance)}</span></span>
                                </div>
                                <div className="mt-1 text-sm font-semibold text-slate-900">합계 {formatKRW(itemTotal)}</div>

                                {item.memo && (
                                    <div className="mt-2 truncate text-xs text-slate-400">{item.memo}</div>
                                )}
                                {item.dueDate && (
                                    <div className="mt-1 text-xs text-rose-500">📅 {item.dueDate}</div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 하단 안내 */}
                <div className="border-t border-slate-100 px-6 py-4 text-center text-xs text-slate-400">
                    예시 데이터입니다. 로그인 후 나만의 플랜을 만들어보세요.
                </div>
            </div>
        </div>
    );
}
