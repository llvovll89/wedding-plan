import { useEffect, useMemo, useState } from "react";
import { AppNav } from "../../components/layout/AppNav";
import type { ChecklistItem, ChecklistTiming } from "../../types/checklist";
import { loadChecklist, saveChecklist } from "../../utils/checklistStorage";

const TIMING_ORDER: ChecklistTiming[] = [
    "D-12개월+",
    "D-6~12개월",
    "D-3~6개월",
    "D-1~3개월",
    "D-1개월",
    "D-2주",
    "D-Day",
];

const TIMING_COLOR: Record<ChecklistTiming, string> = {
    "D-12개월+": "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    "D-6~12개월": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "D-3~6개월": "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    "D-1~3개월": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    "D-1개월": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    "D-2주": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    "D-Day": "bg-rose-600 text-white dark:bg-rose-700",
};

export function Checklist() {
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [filter, setFilter] = useState<ChecklistTiming | "전체">("전체");

    useEffect(() => {
        setItems(loadChecklist());
    }, []);

    const toggle = (id: string) => {
        setItems((prev) => {
            const next = prev.map((it) =>
                it.id === id ? { ...it, checked: !it.checked } : it
            );
            saveChecklist(next);
            return next;
        });
    };

    const resetAll = () => {
        if (!window.confirm("체크리스트를 전부 초기화할까요? (되돌릴 수 없어요)")) return;
        const reset = items.map((it) => ({ ...it, checked: false }));
        setItems(reset);
        saveChecklist(reset);
    };

    const checkedCount = useMemo(() => items.filter((it) => it.checked).length, [items]);
    const totalCount = items.length;
    const progressRatio = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

    const displayTimings =
        filter === "전체"
            ? TIMING_ORDER.filter((t) => items.some((it) => it.timing === t))
            : [filter];

    const filteredItems = (timing: ChecklistTiming) =>
        items.filter((it) => it.timing === timing);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <AppNav />

            <main className="mx-auto max-w-2xl px-4 py-8">
                {/* 헤더 */}
                <div className="mb-6 flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">웨딩 체크리스트</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            결혼 준비를 단계별로 빠짐없이 챙겨요.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={resetAll}
                        className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 hover:text-rose-500 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                    >
                        초기화
                    </button>
                </div>

                {/* 진행률 카드 */}
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-3 flex items-end justify-between gap-2">
                        <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">완료</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {checkedCount}
                                <span className="text-sm font-normal text-slate-400 dark:text-slate-500">
                                    /{totalCount}
                                </span>
                            </p>
                        </div>
                        <p className="text-3xl font-bold text-rose-500">
                            {Math.round(progressRatio)}%
                        </p>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                        <div
                            className="h-full rounded-full bg-rose-500 transition-all duration-300"
                            style={{ width: `${progressRatio}%` }}
                        />
                    </div>
                </div>

                {/* 타이밍 필터 */}
                <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1 scrolls">
                    {(["전체", ...TIMING_ORDER] as (ChecklistTiming | "전체")[]).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setFilter(t)}
                            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                filter === t
                                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* 체크리스트 그룹 */}
                <div className="space-y-5">
                    {displayTimings.map((timing) => {
                        const group = filteredItems(timing);
                        if (group.length === 0) return null;
                        const doneInGroup = group.filter((it) => it.checked).length;
                        return (
                            <div key={timing}>
                                {/* 그룹 헤더 */}
                                <div className="mb-2 flex items-center gap-2">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TIMING_COLOR[timing]}`}>
                                        {timing}
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                        {doneInGroup}/{group.length}
                                    </span>
                                </div>

                                {/* 항목 카드 */}
                                <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                    {group.map((item, idx) => (
                                        <label
                                            key={item.id}
                                            className={`flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                                                idx !== 0 ? "border-t border-slate-100 dark:border-slate-700" : ""
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={item.checked}
                                                onChange={() => toggle(item.id)}
                                                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-rose-500"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <span
                                                    className={`text-sm ${
                                                        item.checked
                                                            ? "text-slate-400 line-through dark:text-slate-500"
                                                            : "text-slate-800 dark:text-slate-200"
                                                    }`}
                                                >
                                                    {item.task}
                                                </span>
                                                <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                                                    {item.category}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {totalCount === 0 && (
                    <div className="py-20 text-center text-sm text-slate-400 dark:text-slate-500">
                        체크리스트가 없어요.
                    </div>
                )}
            </main>
        </div>
    );
}
