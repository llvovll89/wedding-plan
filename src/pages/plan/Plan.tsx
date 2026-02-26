import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { PlanCategory, PlanItem, PlanStatus } from "../../types/plan";
import { usePlan } from "../../context/plan/PlanContext";
import { useSettings } from "../../context/settings/SettingsContext";
import { useAuth } from "../../context/auth/AuthContext";
import { AppNav } from "../../components/layout/AppNav";
import { Select } from "../../components/ui/Select";
import { SETTINGS } from "../../routes/route";
import { createShare } from "../../firebase/shareService";

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

function toDisplay(n: number | ""): string {
    if (n === "") return "";
    return (n as number).toLocaleString("ko-KR");
}

function parseInput(s: string): number | "" {
    const digits = s.replace(/[^0-9]/g, "");
    if (!digits) return "";
    return Number(digits);
}


export const Plan = () => {
    const { state, addItem, updateItem, removeItem, selectors, clearAll } = usePlan();
    const { settings } = useSettings();
    const { user } = useAuth();

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

    // 메모/링크 편집 상태
    const [expandedMemoId, setExpandedMemoId] = useState<string | null>(null);
    const [editMemo, setEditMemo] = useState("");
    const [editLink, setEditLink] = useState("");

    const openMemo = (it: PlanItem) => {
        if (expandedMemoId && expandedMemoId !== it.id) {
            updateItem(expandedMemoId, {
                memo: editMemo || undefined,
                link: editLink || undefined,
            });
        }
        setExpandedMemoId(it.id);
        setEditMemo(it.memo ?? "");
        setEditLink(it.link ?? "");
    };

    const closeMemo = () => {
        if (expandedMemoId) {
            updateItem(expandedMemoId, {
                memo: editMemo || undefined,
                link: editLink || undefined,
            });
        }
        setExpandedMemoId(null);
        setEditMemo("");
        setEditLink("");
    };

    // 공유 상태
    const [shareLoading, setShareLoading] = useState(false);
    const [shareUrl, setShareUrl] = useState("");
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (!user) return;
        setShareLoading(true);
        try {
            const id = await createShare(user, state, {
                groomName: settings.groomName,
                brideName: settings.brideName,
                weddingDate: settings.weddingDate,
                totalBudget: settings.totalBudget,
            });
            setShareUrl(`${window.location.origin}/shared/${id}`);
            setShareModalOpen(true);
        } catch {
            alert("공유 링크 생성 중 오류가 발생했어요.");
        } finally {
            setShareLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback: select the input text
        }
    };

    // PDF 저장
    const handlePrint = () => {
        const w = window.open("", "_blank", "width=960,height=700");
        if (!w) return;
        const { groomName, brideName, weddingDate } = settings;
        const dateStr = weddingDate
            ? new Date(weddingDate).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
            : "";
        const rows = state.items.map((it) => {
            const dep = it.payment.deposit ?? 0;
            const bal = it.payment.balance ?? 0;
            const memo = it.memo ? it.memo.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "-";
            const link = it.link
                ? `<a href="${it.link}" style="color:#be123c">${it.link}</a>`
                : "-";
            return `<tr>
                <td>${CATEGORY_LABEL[it.category]}</td>
                <td>${it.name}</td>
                <td>${STATUS_LABEL[it.status]}</td>
                <td class="num">${dep.toLocaleString("ko-KR")}원</td>
                <td class="num">${bal.toLocaleString("ko-KR")}원</td>
                <td class="num">${(dep + bal).toLocaleString("ko-KR")}원</td>
                <td class="memo">${memo}</td>
                <td class="memo">${link}</td>
            </tr>`;
        }).join("");

        w.document.write(`<!DOCTYPE html><html lang="ko"><head>
            <meta charset="UTF-8">
            <title>${groomName || "신랑"} ♥ ${brideName || "신부"} 웨딩 플랜</title>
            <style>
                body{font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;padding:32px;color:#1e293b;font-size:13px}
                h1{font-size:18px;margin:0 0 4px}
                .sub{color:#64748b;margin:0 0 20px;font-size:12px}
                table{width:100%;border-collapse:collapse;margin-bottom:16px}
                th{background:#fff1f2;padding:8px 10px;text-align:left;border-bottom:2px solid #fda4af;font-size:12px;white-space:nowrap}
                td{padding:7px 10px;border-bottom:1px solid #f1f5f9;vertical-align:top}
                .num{text-align:right;white-space:nowrap}
                .memo{font-size:11px;color:#64748b;max-width:200px;word-break:break-all}
                .total{font-weight:700;font-size:14px;text-align:right;color:#be123c}
                @media print{body{padding:16px}}
            </style>
        </head><body>
            <h1>${groomName || "신랑"} ♥ ${brideName || "신부"} 웨딩 플랜</h1>
            ${dateStr ? `<p class="sub">${dateStr}</p>` : "<br>"}
            <table><thead><tr>
                <th>카테고리</th><th>항목명</th><th>상태</th>
                <th>예약금</th><th>잔금</th><th>합계</th><th>메모</th><th>링크</th>
            </tr></thead><tbody>${rows}</tbody></table>
            <p class="total">납부 합계: ${selectors.total.toLocaleString("ko-KR")}원</p>
        </body></html>`);
        w.document.close();
        w.focus();
        w.print();
    };

    const depositNum = deposit === "" ? 0 : (deposit as number);
    const estimatedNum = estimatedCost === "" ? 0 : (estimatedCost as number);
    // 예상 비용이 입력된 경우 잔금 자동 계산, 아닌 경우 수동 입력
    const isBalanceAuto = estimatedCost !== "";
    const balanceNum = isBalanceAuto
        ? Math.max(0, estimatedNum - depositNum)
        : (balance === "" ? 0 : (balance as number));
    const formTotal = depositNum + balanceNum;

    const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-rose-400/50 dark:focus:ring-rose-400/10";

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
        <>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <AppNav />

            <div className="mx-auto max-w-2xl px-4 py-8">
            {/* 헤더 */}
            <div className="mb-5 flex items-center justify-between gap-2">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">내 플랜</h1>
                <div className="flex items-center gap-2">
                    {state.items.length > 0 && (
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            PDF 저장
                        </button>
                    )}
                    {user && state.items.length > 0 && (
                        <button
                            type="button"
                            onClick={handleShare}
                            disabled={shareLoading}
                            className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition-colors dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
                        >
                            {shareLoading ? "생성 중..." : "공유 링크"}
                        </button>
                    )}
                    <button
                        type="button"
                        className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-100 disabled:opacity-40 transition-colors dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300 dark:hover:bg-rose-900/40"
                        onClick={onReset}
                        disabled={state.items.length === 0}
                    >
                        전체 초기화
                    </button>
                </div>
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
                            className={inputCls}
                            placeholder="예: 골든로즈 웨딩홀"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">카테고리</label>
                        <Select
                            value={category}
                            onValueChange={(v) => setCategory(v as PlanCategory)}
                            options={Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label }))}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">진행 상태</label>
                        <Select
                            value={status}
                            onValueChange={(v) => setStatus(v as PlanStatus)}
                            options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
                        />
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
                                className={`${inputCls} pr-7`}
                                type="text" inputMode="numeric" placeholder="0"
                                value={toDisplay(estimatedCost)}
                                onChange={(e) => setEstimatedCost(parseInput(e.target.value))}
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">원</span>
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">예약금</label>
                        <div className="relative">
                            <input
                                className={`${inputCls} pr-7`}
                                type="text" inputMode="numeric" placeholder="0"
                                value={toDisplay(deposit)}
                                onChange={(e) => setDeposit(parseInput(e.target.value))}
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">원</span>
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                            잔금
                            {isBalanceAuto && (
                                <span className="ml-1 text-emerald-500 font-normal dark:text-emerald-400">자동 계산</span>
                            )}
                        </label>
                        <div className="relative">
                            <input
                                className={isBalanceAuto
                                    ? "w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 pr-7 text-sm text-emerald-700 outline-none cursor-default dark:border-emerald-700/40 dark:bg-emerald-900/20 dark:text-emerald-300"
                                    : `${inputCls} pr-7`
                                }
                                type="text" inputMode="numeric" placeholder="0"
                                readOnly={isBalanceAuto}
                                value={isBalanceAuto ? toDisplay(balanceNum) : toDisplay(balance)}
                                onChange={isBalanceAuto ? undefined : (e) => setBalance(parseInput(e.target.value))}
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
                                                        type="text"
                                                        inputMode="numeric"
                                                        autoFocus
                                                        placeholder="실제 비용 입력"
                                                        value={toDisplay(editingCostVal)}
                                                        onChange={(e) => setEditingCostVal(parseInput(e.target.value))}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleSaveActualCost(it.id);
                                                            if (e.key === "Escape") { setEditingCostId(null); setEditingCostVal(""); }
                                                        }}
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-7 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-emerald-400/50 dark:focus:ring-emerald-400/10"
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
                                                type="text"
                                                inputMode="numeric"
                                                autoFocus
                                                placeholder="실제 비용 입력"
                                                value={toDisplay(editingCostVal)}
                                                onChange={(e) => setEditingCostVal(parseInput(e.target.value))}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleSaveActualCost(it.id);
                                                    if (e.key === "Escape") { setEditingCostId(null); setEditingCostVal(""); }
                                                }}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-7 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-emerald-400/50 dark:focus:ring-emerald-400/10"
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

                                {/* 메모 / 링크 영역 */}
                                <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-700">
                                    {expandedMemoId === it.id ? (
                                        <div className="grid gap-2">
                                            <textarea
                                                rows={3}
                                                placeholder="메모를 입력하세요..."
                                                className={`${inputCls} resize-none text-xs`}
                                                value={editMemo}
                                                onChange={(e) => setEditMemo(e.target.value)}
                                            />
                                            <div className="relative">
                                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                                                    <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 16 16" fill="none">
                                                        <path d="M2 8a6 6 0 1 0 12 0A6 6 0 0 0 2 8zm4-1h4M8 5v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                                    </svg>
                                                </span>
                                                <input
                                                    type="url"
                                                    placeholder="링크 (https://...)"
                                                    className={`${inputCls} pl-8 text-xs`}
                                                    value={editLink}
                                                    onChange={(e) => setEditLink(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={closeMemo}
                                                    className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-600 transition-colors dark:bg-slate-600 dark:hover:bg-slate-500"
                                                >
                                                    저장
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedMemoId(null)}
                                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 transition-colors dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {(it.memo || it.link) && (
                                                <div className="mb-2 grid gap-1.5">
                                                    {it.memo && (
                                                        <p className="text-xs text-slate-500 whitespace-pre-wrap dark:text-slate-400">{it.memo}</p>
                                                    )}
                                                    {it.link && (
                                                        <a
                                                            href={it.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-xs text-blue-500 hover:underline dark:text-blue-400 truncate"
                                                        >
                                                            <svg className="h-3 w-3 shrink-0" viewBox="0 0 16 16" fill="none">
                                                                <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5L7.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                                                <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                                            </svg>
                                                            <span className="truncate">{it.link}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => openMemo(it)}
                                                className="text-xs text-slate-400 hover:text-slate-600 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
                                            >
                                                {(it.memo || it.link) ? "메모/링크 수정" : "+ 메모/링크"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            </div>
        </div>

        {/* 공유 모달 */}
        {shareModalOpen && (

            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                onClick={(e) => { if (e.target === e.currentTarget) setShareModalOpen(false); }}
            >
                <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
                    <div className="mb-1 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
                            <svg className="h-4 w-4 text-blue-500 dark:text-blue-400" viewBox="0 0 16 16" fill="none">
                                <path d="M11 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-6 3a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 3a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5.5 7.5l5-2.5M5.5 9l5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">공유 링크가 생성되었어요!</h2>
                    </div>
                    <p className="mb-4 text-xs text-slate-400 dark:text-slate-500">
                        링크를 복사해 파트너에게 공유하세요. 누구나 읽기 전용으로 플랜을 확인할 수 있어요.
                    </p>

                    <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-600 dark:bg-slate-700">
                        <p className="flex-1 truncate text-xs text-slate-700 dark:text-slate-200">{shareUrl}</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleCopy}
                            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                                copied
                                    ? "bg-emerald-500 text-white"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                            {copied ? "복사됨!" : "링크 복사"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShareModalOpen(false)}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};
