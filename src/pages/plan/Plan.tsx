import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PlanCategory, PlanStatus } from "../../types/plan";
import { usePlan } from "../../context/plan/PlanContext";
import { UserMenu } from "../../components/auth/UserMenu";

const CATEGORY_LABEL: Record<PlanCategory, string> = {
    sdeume: "스드메",
    venue: "예식장",
    studio: "웨딩촬영",
    snapshot: "스냅",
    mc: "사회자",
    honeymoon: "신혼여행",
    etc: "기타",
};

const STATUS_LABEL: Record<PlanStatus, string> = {
    planned: "예정",
    in_progress: "진행중",
    confirmed: "확정",
    paid: "결제완료",
};

function formatKRW(n: number) {
    return `${n.toLocaleString("ko-KR")}원`;
}

export const Plan = () => {
    const navigate = useNavigate();
    const { state, addItem, removeItem, selectors, clearAll } = usePlan();

    const [name, setName] = useState("");
    const [category, setCategory] = useState<PlanCategory>("sdeume");
    const [status, setStatus] = useState<PlanStatus>("planned");
    const [deposit, setDeposit] = useState<number>(0);
    const [balance, setBalance] = useState<number>(0);

    const canAdd = useMemo(() => name.trim().length > 0, [name]);

    const onBack = () => {
        // 히스토리가 없으면 메인으로
        if (window.history.length > 1) navigate(-1);
        else navigate("/");
    };

    const onReset = () => {
        if (state.items.length === 0) return;
        const ok = window.confirm("저장된 플랜 항목을 모두 삭제할까요? (되돌릴 수 없어요)");
        if (!ok) return;

        clearAll();
        // 입력 폼도 같이 초기화(UX)
        setName("");
        setCategory("sdeume");
        setStatus("planned");
        setDeposit(0);
        setBalance(0);
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            {/* 상단 바 */}
            <div className="mb-6 flex items-center justify-between">
                <button
                    type="button"
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                    onClick={onBack}
                >
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                        <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    메인으로
                </button>
                <UserMenu />
            </div>

            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">내 플랜</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        합계:{" "}
                        <span className="font-semibold text-slate-900">
                            {formatKRW(selectors.total)}
                        </span>
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                        onClick={onReset}
                        disabled={state.items.length === 0}
                    >
                        전체 초기화
                    </button>
                </div>
            </div>

            <div className="mt-6 grid gap-4 rounded-3xl border border-rose-100/70 bg-white/70 p-5 shadow-sm md:grid-cols-5">
                <input
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="항목명 (예: 스드메)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PlanCategory)}
                >
                    {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>
                            {v}
                        </option>
                    ))}
                </select>

                <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PlanStatus)}
                >
                    {Object.entries(STATUS_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>
                            {v}
                        </option>
                    ))}
                </select>

                <input
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    type="number"
                    min={0}
                    placeholder="예약금(원)"
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                />

                <div className="flex gap-2">
                    <input
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        type="number"
                        min={0}
                        placeholder="잔금(원)"
                        value={balance}
                        onChange={(e) => setBalance(Number(e.target.value))}
                    />
                    <button
                        className="shrink-0 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        disabled={!canAdd}
                        onClick={() => {
                            addItem({
                                name: name.trim(),
                                category,
                                status,
                                payment: { deposit, balance },
                            });
                            setName("");
                            setDeposit(0);
                            setBalance(0);
                        }}
                    >
                        추가
                    </button>
                </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
                {state.items.map((it) => {
                    const total = (it.payment.deposit ?? 0) + (it.payment.balance ?? 0);
                    return (
                        <div
                            key={it.id}
                            className="rounded-2xl border border-rose-100/70 bg-white/70 p-4 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-sm font-semibold text-slate-900">{it.name}</div>
                                    <div className="mt-1 text-xs text-slate-600">
                                        {CATEGORY_LABEL[it.category]} · {STATUS_LABEL[it.status]}
                                    </div>
                                </div>
                                <button
                                    className="text-xs text-rose-700 hover:text-rose-800"
                                    onClick={() => removeItem(it.id)}
                                >
                                    삭제
                                </button>
                            </div>

                            <div className="mt-3 text-sm text-slate-700">
                                예약금: {formatKRW(it.payment.deposit ?? 0)} / 잔금:{" "}
                                {formatKRW(it.payment.balance ?? 0)}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-slate-900">합계: {formatKRW(total)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};