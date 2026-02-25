import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { PlanCategory, PlanStatus } from "../../types/plan";
import { usePlan } from "../../context/plan/PlanContext";
import { useSettings } from "../../context/settings/SettingsContext";
import { AppNav } from "../../components/layout/AppNav";
import { SETTINGS } from "../../routes/route";

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

const STATUS_COLOR: Record<PlanStatus, string> = {
    planned: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

function formatKRW(n: number) {
    return `${n.toLocaleString("ko-KR")}원`;
}

export const Plan = () => {
    const { state, addItem, updateItem, removeItem, selectors, clearAll } = usePlan();
    const { settings } = useSettings();

    // 폼 상태
    const [name, setName] = useState("");
    const [category, setCategory] = useState<PlanCategory>("sdeume");
    const [status, setStatus] = useState<PlanStatus>("planned");
    const [deposit, setDeposit] = useState<number | "">("");
    const [balance, setBalance] = useState<number | "">("");
    const [estimatedCost, setEstimatedCost] = useState<number | "">("");

    // 실제 비용 인라인 편집 상태
    const [editingCostId, setEditingCostId] = useState<string | null>(null);
    const [editingCostVal, setEditingCostVal] = useState<number | "">("");

    const depositNum = deposit === "" ? 0 : deposit;
    const balanceNum = balance === "" ? 0 : balance;
    const estimatedNum = estimatedCost === "" ? 0 : estimatedCost;
    const formTotal = depositNum + balanceNum;

    const canAdd = useMemo(() => name.trim().length > 0, [name]);

    // 각 항목의 유효 비용 (실제 > 예상 순서로 사용)
    const effectiveCost = (item: (typeof state.items)[0]) =>
        item.actualCost ?? item.estimatedCost ?? 0;

    // 예산 계산
    const usedBudget = useMemo(
        () => state.items.reduce((s, it) => s + effectiveCost(it), 0),
        [state.items],
    );
    const { totalBudget } = settings;
    const remainingBudget = totalBudget - usedBudget;
    const budgetUsedRatio = totalBudget > 0 ? Math.min((usedBudget / totalBudget) * 100, 100) : 0;

    // 납부 합계 (예약금/잔금)
    const totalDeposit = useMemo(
        () => state.items.reduce((s, it) => s + (it.payment.deposit ?? 0), 0),
        [state.items],
    );
    const totalBalance = useMemo(
        () => state.items.reduce((s, it) => s + (it.payment.balance ?? 0), 0),
        [state.items],
    );

    const onReset = () => {
        if (state.items.length === 0) return;
        const ok = window.confirm("저장된 플랜 항목을 모두 삭제할까요? (되돌릴 수 없어요)");
        if (!ok) return;
        clearAll();
        setName(""); setCategory("sdeume"); setStatus("planned");
        setDeposit(""); setBalance(""); setEstimatedCost("");
    };

    const handleAdd = () => {
        addItem({
            name: name.trim(),
            category,
            status,
            payment: { deposit: depositNum, balance: balanceNum },
            estimatedCost: estimatedNum > 0 ? estimatedNum : undefined,
        });
        setName(""); setDeposit(""); setBalance(""); setEstimatedCost("");
    };

    const handleSaveActualCost = (id: string) => {
        updateItem(id, { actualCost: editingCostVal === "" ? undefined : editingCostVal });
        setEditingCostId(null);
        setEditingCostVal("");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <AppNav />

            <div className="mx-auto max-w-2xl px-4 py-8">
            {/* 헤더 */}
            <div className="mb-5 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">내 플랜</h1>
                <button
                    type="button"
                    className="rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-sm text-rose-700 hover:bg-rose-100 disabled:opacity-40 transition-colors dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300 dark:hover:bg-rose-900/40"
                    onClick={onReset}
                    disabled={state.items.length === 0}
                >
                    전체 초기화
                </button>
            </div>

            {/* 예산 바 */}
            {totalBudget > 0 ? (
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-3 flex items-end justify-between gap-2">
                        <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">총 예산</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatKRW(totalBudget)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">남은 예산</p>
                            <p className={`text-xl font-bold ${remainingBudget < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                {remainingBudget < 0 ? "- " : ""}{formatKRW(Math.abs(remainingBudget))}
                            </p>
                        </div>
                    </div>

                    {/* 사용률 바 */}
                    <div className="mb-2">
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                            <div
                                className={`h-full rounded-full transition-all ${budgetUsedRatio >= 100 ? "bg-rose-500" : "bg-emerald-400"}`}
                                style={{ width: `${budgetUsedRatio}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
                        <span>사용 {formatKRW(usedBudget)} ({Math.round(budgetUsedRatio)}%)</span>
                        <Link to={SETTINGS} className="text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors dark:text-slate-500 dark:hover:text-slate-300">
                            예산 수정
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="mb-6 flex items-center justify-between rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/50">
                    <p className="text-sm text-slate-400 dark:text-slate-500">총 예산을 설정하면 남은 예산을 바로 확인할 수 있어요.</p>
                    <Link
                        to={SETTINGS}
                        className="shrink-0 ml-3 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        설정하기
                    </Link>
                </div>
            )}

            {/* 납부 요약 카드 */}
            {state.items.length > 0 && (
                <div className="mb-6 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">플랜 합계</p>
                        <p className="text-base font-bold text-slate-900 dark:text-slate-100">{formatKRW(selectors.total)}</p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm dark:border-blue-900/40 dark:bg-blue-900/20">
                        <p className="text-xs text-blue-400 dark:text-blue-400 mb-1">납부 예약금</p>
                        <p className="text-base font-bold text-blue-700 dark:text-blue-300">{formatKRW(totalDeposit)}</p>
                    </div>
                    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 shadow-sm dark:border-rose-900/40 dark:bg-rose-900/20">
                        <p className="text-xs text-rose-400 dark:text-rose-400 mb-1">남은 잔금</p>
                        <p className="text-base font-bold text-rose-600 dark:text-rose-300">{formatKRW(totalBalance)}</p>
                    </div>
                </div>
            )}

            {/* 항목 추가 폼 */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <p className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">항목 추가</p>

                {/* 1행: 항목명 · 카테고리 · 상태 */}
                <div className="mb-3 grid gap-3 sm:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">항목명</label>
                        <input
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-slate-400 dark:focus:bg-slate-700"
                            placeholder="예: 골든로즈 웨딩홀"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">카테고리</label>
                        <select
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:border-slate-400"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as PlanCategory)}
                        >
                            {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">진행 상태</label>
                        <select
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:border-slate-400"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as PlanStatus)}
                        >
                            {Object.entries(STATUS_LABEL).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 2행: 예상 비용 · 예약금 · 잔금 · 합계 · 추가 */}
                <div className="mb-2 grid gap-3 sm:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                            예상 비용
                            <span className="ml-1 text-slate-400 font-normal dark:text-slate-500">(예산 차감)</span>
                        </label>
                        <div className="relative">
                            <input
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-7 text-sm outline-none focus:border-slate-400 focus:bg-white transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:border-slate-400 dark:focus:bg-slate-700"
                                type="number" min={0} placeholder="0"
                                value={estimatedCost}
                                onChange={(e) => setEstimatedCost(e.target.value === "" ? "" : Number(e.target.value))}
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">원</span>
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">예약금</label>
                        <div className="relative">
                            <input
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-7 text-sm outline-none focus:border-slate-400 focus:bg-white transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:border-slate-400 dark:focus:bg-slate-700"
                                type="number" min={0} placeholder="0"
                                value={deposit}
                                onChange={(e) => setDeposit(e.target.value === "" ? "" : Number(e.target.value))}
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">원</span>
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">잔금</label>
                        <div className="relative">
                            <input
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-7 text-sm outline-none focus:border-slate-400 focus:bg-white transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:border-slate-400 dark:focus:bg-slate-700"
                                type="number" min={0} placeholder="0"
                                value={balance}
                                onChange={(e) => setBalance(e.target.value === "" ? "" : Number(e.target.value))}
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">원</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-center dark:border-slate-700 dark:bg-slate-700/50">
                        <p className="text-xs text-slate-400 dark:text-slate-500">납부 합계</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatKRW(formTotal)}</p>
                    </div>
                    <button
                        className="flex-1 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
                        disabled={!canAdd}
                        onClick={handleAdd}
                    >
                        추가
                    </button>
                </div>
            </div>

            {/* 항목 목록 */}
            {state.items.length === 0 ? (
                <div className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
                    아직 추가된 항목이 없어요.<br />위 폼에서 첫 항목을 추가해보세요!
                </div>
            ) : (
                <div className="grid gap-3">
                    {state.items.map((it) => {
                        const depositAmt = it.payment.deposit ?? 0;
                        const balanceAmt = it.payment.balance ?? 0;
                        const payTotal = depositAmt + balanceAmt;
                        const depositRatio = payTotal > 0 ? (depositAmt / payTotal) * 100 : 0;
                        const hasActual = it.actualCost != null;
                        const hasEstimated = it.estimatedCost != null;
                        const isEditing = editingCostId === it.id;

                        return (
                            <div
                                key={it.id}
                                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                            >
                                {/* 배지 + 삭제 */}
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
                                            {CATEGORY_LABEL[it.category]}
                                        </span>
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[it.status]}`}>
                                            {STATUS_LABEL[it.status]}
                                        </span>
                                    </div>
                                    <button
                                        className="shrink-0 text-xs text-slate-400 hover:text-rose-500 transition-colors dark:text-slate-500 dark:hover:text-rose-400"
                                        onClick={() => removeItem(it.id)}
                                    >
                                        삭제
                                    </button>
                                </div>

                                {/* 항목명 */}
                                <p className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">{it.name}</p>

                                {/* 예상/실제 비용 섹션 */}
                                {(hasEstimated || hasActual) && (
                                    <div className="mb-3 rounded-xl bg-slate-50 border border-slate-100 p-3 dark:bg-slate-700/50 dark:border-slate-600">
                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                {hasActual ? (
                                                    <>
                                                        {hasEstimated && (
                                                            <p className="text-xs text-slate-400 line-through dark:text-slate-500">
                                                                예상 {formatKRW(it.estimatedCost!)}
                                                            </p>
                                                        )}
                                                        <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                                                            실제 {formatKRW(it.actualCost!)}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-base font-bold text-amber-700 dark:text-amber-400">
                                                        예상 {formatKRW(it.estimatedCost!)}
                                                    </p>
                                                )}
                                            </div>

                                            {!isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingCostId(it.id);
                                                        setEditingCostVal(it.actualCost ?? it.estimatedCost ?? "");
                                                    }}
                                                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                                >
                                                    {hasActual ? "실제 비용 수정" : "실제 비용 입력"}
                                                </button>
                                            )}
                                        </div>

                                        {/* 인라인 실제 비용 편집 */}
                                        {isEditing && (
                                            <div className="mt-3 flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        autoFocus
                                                        placeholder="실제 비용 입력"
                                                        value={editingCostVal}
                                                        onChange={(e) => setEditingCostVal(e.target.value === "" ? "" : Number(e.target.value))}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleSaveActualCost(it.id);
                                                            if (e.key === "Escape") { setEditingCostId(null); setEditingCostVal(""); }
                                                        }}
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-7 text-sm outline-none focus:border-emerald-400 transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                                                    />
                                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">원</span>
                                                </div>
                                                <button
                                                    onClick={() => handleSaveActualCost(it.id)}
                                                    className="shrink-0 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                                                >
                                                    저장
                                                </button>
                                                <button
                                                    onClick={() => { setEditingCostId(null); setEditingCostVal(""); }}
                                                    className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 예상 비용 없는 항목에도 실제 비용 입력 가능 */}
                                {!hasEstimated && !hasActual && !isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingCostId(it.id);
                                            setEditingCostVal("");
                                        }}
                                        className="mb-3 text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
                                    >
                                        + 실제 비용 입력
                                    </button>
                                )}
                                {!hasEstimated && !hasActual && isEditing && (
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                min={0}
                                                autoFocus
                                                placeholder="실제 비용 입력"
                                                value={editingCostVal}
                                                onChange={(e) => setEditingCostVal(e.target.value === "" ? "" : Number(e.target.value))}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleSaveActualCost(it.id);
                                                    if (e.key === "Escape") { setEditingCostId(null); setEditingCostVal(""); }
                                                }}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-7 text-sm outline-none focus:border-emerald-400 transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                                            />
                                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">원</span>
                                        </div>
                                        <button
                                            onClick={() => handleSaveActualCost(it.id)}
                                            className="shrink-0 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                                        >
                                            저장
                                        </button>
                                        <button
                                            onClick={() => { setEditingCostId(null); setEditingCostVal(""); }}
                                            className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                                        >
                                            취소
                                        </button>
                                    </div>
                                )}

                                {/* 총액 */}
                                <p className="mb-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{formatKRW(payTotal)}</p>

                                {/* 예약금/잔금 비율 바 */}
                                {payTotal > 0 && (
                                    <div className="mb-3">
                                        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                            <div
                                                className="h-full rounded-full bg-blue-400 transition-all"
                                                style={{ width: `${depositRatio}%` }}
                                            />
                                        </div>
                                        <div className="mt-1 flex justify-between text-xs text-slate-400 dark:text-slate-500">
                                            <span>예약금 {Math.round(depositRatio)}%</span>
                                            <span>잔금 {Math.round(100 - depositRatio)}%</span>
                                        </div>
                                    </div>
                                )}

                                {/* 예약금 · 잔금 카드 */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-xl bg-blue-50 px-3 py-2.5 dark:bg-blue-900/20">
                                        <p className="mb-0.5 text-xs text-blue-400">예약금</p>
                                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">{formatKRW(depositAmt)}</p>
                                    </div>
                                    <div className="rounded-xl bg-rose-50 px-3 py-2.5 dark:bg-rose-900/20">
                                        <p className="mb-0.5 text-xs text-rose-400">잔금</p>
                                        <p className="text-sm font-semibold text-rose-600 dark:text-rose-300">{formatKRW(balanceAmt)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            </div>
        </div>
    );
};
