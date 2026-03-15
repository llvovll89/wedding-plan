import { useMemo, useState } from "react";
import type { PlanCategory } from "../../types/plan";

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

const CATEGORY_COLOR: Record<PlanCategory, string> = {
    sdeume:     "#f43f5e",
    venue:      "#a855f7",
    studio:     "#3b82f6",
    snapshot:   "#6366f1",
    mc:         "#f59e0b",
    honeymoon:  "#14b8a6",
    invitation: "#ec4899",
    gift:       "#f97316",
    hanbok:     "#8b5cf6",
    favor:      "#84cc16",
    ceremony:   "#10b981",
    newhome:    "#0ea5e9",
    etc:        "#94a3b8",
};

function formatKRW(n: number) {
    return `${n.toLocaleString("ko-KR")}원`;
}

interface Props {
    byCategory: Record<PlanCategory, number>;
    totalBudget: number;
    totalSpent: number;
}

export function BudgetChart({ byCategory, totalBudget, totalSpent }: Props) {
    const [open, setOpen] = useState(true);

    const rows = useMemo(
        () =>
            (Object.entries(byCategory) as [PlanCategory, number][])
                .filter(([, v]) => v > 0)
                .sort(([, a], [, b]) => b - a),
        [byCategory],
    );

    if (rows.length === 0) return null;

    const maxVal = rows[0][1];
    const budgetRatio = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
    const remaining = totalBudget - totalSpent;
    const isOver = remaining < 0;

    return (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            {/* 헤더 토글 */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-4"
            >
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">예산 분석</span>
                <svg
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    viewBox="0 0 16 16"
                    fill="none"
                >
                    <path
                        d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {open && (
                <div className="px-5 pb-5 space-y-5">
                    {/* 총 예산 소진율 */}
                    {totalBudget > 0 && (
                        <div>
                            <div className="mb-2 flex items-end justify-between gap-2">
                                <div>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">납부 합계 / 총 예산</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {formatKRW(totalSpent)}
                                        <span className="font-normal text-slate-400 dark:text-slate-500"> / {formatKRW(totalBudget)}</span>
                                    </p>
                                </div>
                                <span
                                    className={`text-sm font-bold tabular-nums ${
                                        isOver
                                            ? "text-rose-500"
                                            : budgetRatio >= 80
                                              ? "text-amber-500"
                                              : "text-emerald-600 dark:text-emerald-400"
                                    }`}
                                >
                                    {Math.round(budgetRatio)}%
                                </span>
                            </div>

                            {/* 분절 프로그레스 바 */}
                            <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        isOver
                                            ? "bg-rose-500"
                                            : budgetRatio >= 80
                                              ? "bg-amber-400"
                                              : "bg-emerald-400"
                                    }`}
                                    style={{ width: `${budgetRatio}%` }}
                                />
                                {/* 25% / 50% / 75% 눈금선 */}
                                {[25, 50, 75].map((tick) => (
                                    <div
                                        key={tick}
                                        className="pointer-events-none absolute top-0 h-full w-px bg-white/60 dark:bg-slate-900/40"
                                        style={{ left: `${tick}%` }}
                                    />
                                ))}
                            </div>

                            <div className="mt-1.5 flex justify-between text-xs">
                                <span className="text-slate-400 dark:text-slate-500">
                                    {isOver ? "예산 초과" : "사용 중"}
                                </span>
                                <span
                                    className={`font-medium ${
                                        isOver ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"
                                    }`}
                                >
                                    {isOver ? "초과 " : "잔여 "}
                                    {formatKRW(Math.abs(remaining))}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* 카테고리별 막대 차트 */}
                    <div>
                        <p className="mb-3 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                            카테고리별 납부액
                        </p>
                        <div className="space-y-3">
                            {rows.map(([cat, val]) => {
                                const pct = totalSpent > 0 ? (val / totalSpent) * 100 : 0;
                                const barWidth = (val / maxVal) * 100;
                                return (
                                    <div key={cat}>
                                        <div className="mb-1.5 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div
                                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                    style={{ backgroundColor: CATEGORY_COLOR[cat] }}
                                                />
                                                <span className="truncate text-xs text-slate-600 dark:text-slate-300">
                                                    {CATEGORY_LABEL[cat]}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                                                    {Math.round(pct)}%
                                                </span>
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                                                    {formatKRW(val)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${barWidth}%`,
                                                    backgroundColor: CATEGORY_COLOR[cat],
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 카테고리 범례 (도넛 없이 색상 칩으로) */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-700">
                        {rows.map(([cat]) => (
                            <div key={cat} className="flex items-center gap-1">
                                <div
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{ backgroundColor: CATEGORY_COLOR[cat] }}
                                />
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                    {CATEGORY_LABEL[cat]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
