import { useEffect, useMemo, useRef, useState } from "react";
import { AppNav } from "../../components/layout/AppNav";
import { useSettings } from "../../context/settings/SettingsContext";
import type { GiftEntry, GiftSide } from "../../types/giftLedger";
import { loadGiftEntries, saveGiftEntries } from "../../utils/giftLedgerStorage";

// ─── 유틸 ────────────────────────────────────────────────────
function createId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

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

function exportCSV(entries: GiftEntry[], groomName: string, brideName: string) {
    const groom = groomName || "신랑";
    const bride = brideName || "신부";
    const header = `이름,측,관계,금액,메모,등록일\n`;
    const rows = entries
        .map((e) =>
            [
                e.name,
                e.side === "groom" ? `${groom}측` : `${bride}측`,
                e.relation ?? "",
                e.amount,
                e.note ?? "",
                new Date(e.createdAt).toLocaleDateString("ko-KR"),
            ]
                .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                .join(","),
        )
        .join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "축의금장부.csv";
    a.click();
    URL.revokeObjectURL(url);
}

// ─── 상수 ────────────────────────────────────────────────────
const QUICK_AMOUNTS = [50_000, 100_000, 150_000, 200_000, 300_000, 500_000];
const RELATION_OPTIONS = ["친구", "직장동료", "친척", "가족", "지인", "기타"];

const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-rose-400/50 dark:focus:ring-rose-400/10";

type FilterSide = "all" | GiftSide;

// ─── 컴포넌트 ────────────────────────────────────────────────
export function GiftLedger() {
    const { settings } = useSettings();
    const { groomName, brideName } = settings;

    const [entries, setEntries] = useState<GiftEntry[]>(() => loadGiftEntries());

    useEffect(() => {
        saveGiftEntries(entries);
    }, [entries]);

    // 폼 상태
    const [name, setName] = useState("");
    const [side, setSide] = useState<GiftSide>("groom");
    const [amount, setAmount] = useState<number | "">("");
    const [relation, setRelation] = useState("");
    const [note, setNote] = useState("");
    const nameRef = useRef<HTMLInputElement>(null);

    // 필터/검색
    const [filterSide, setFilterSide] = useState<FilterSide>("all");
    const [search, setSearch] = useState("");

    // 삭제 확인 대상
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // ─── 계산 ─────────────────────────────────────────
    const totalAll = useMemo(() => entries.reduce((s, e) => s + e.amount, 0), [entries]);
    const totalGroom = useMemo(
        () => entries.filter((e) => e.side === "groom").reduce((s, e) => s + e.amount, 0),
        [entries],
    );
    const totalBride = useMemo(
        () => entries.filter((e) => e.side === "bride").reduce((s, e) => s + e.amount, 0),
        [entries],
    );
    const countGroom = entries.filter((e) => e.side === "groom").length;
    const countBride = entries.filter((e) => e.side === "bride").length;

    const filtered = useMemo(() => {
        return entries
            .filter((e) => filterSide === "all" || e.side === filterSide)
            .filter((e) => {
                if (!search.trim()) return true;
                const q = search.trim().toLowerCase();
                return (
                    e.name.toLowerCase().includes(q) ||
                    (e.relation ?? "").toLowerCase().includes(q) ||
                    (e.note ?? "").toLowerCase().includes(q)
                );
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [entries, filterSide, search]);

    // ─── 액션 ─────────────────────────────────────────
    const canAdd = name.trim().length > 0 && amount !== "" && amount > 0;

    const handleAdd = () => {
        if (!canAdd) return;
        const entry: GiftEntry = {
            id: createId(),
            name: name.trim(),
            side,
            amount: amount as number,
            relation: relation.trim() || undefined,
            note: note.trim() || undefined,
            createdAt: new Date().toISOString(),
        };
        setEntries((prev) => [entry, ...prev]);
        setName("");
        setAmount("");
        setRelation("");
        setNote("");
        setTimeout(() => nameRef.current?.focus(), 0);
    };

    const handleDelete = (id: string) => {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        setConfirmDeleteId(null);
    };

    const sideLabel = (s: GiftSide) =>
        s === "groom" ? `${groomName || "신랑"}측` : `${brideName || "신부"}측`;
    const sideBadgeCls = (s: GiftSide) =>
        s === "groom"
            ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
            : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800";

    return (
        <>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <AppNav />

                <div className="mx-auto max-w-2xl px-4 py-8">
                    {/* 헤더 */}
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                            축의금 장부
                        </h1>
                        {entries.length > 0 && (
                            <button
                                type="button"
                                onClick={() => exportCSV(entries, groomName, brideName)}
                                className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                            >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                CSV 내보내기
                            </button>
                        )}
                    </div>

                    {/* 요약 카드 */}
                    <div className="mb-6 grid grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                            <p className="mb-1 text-xs text-slate-400 dark:text-slate-500">총 수령액</p>
                            <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                                {formatKRW(totalAll)}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                                {entries.length}명
                            </p>
                        </div>
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm dark:border-blue-900/40 dark:bg-blue-900/20">
                            <p className="mb-1 text-xs text-blue-400">{groomName || "신랑"}측</p>
                            <p className="text-base font-bold text-blue-700 dark:text-blue-300">
                                {formatKRW(totalGroom)}
                            </p>
                            <p className="mt-0.5 text-xs text-blue-400 dark:text-blue-500">
                                {countGroom}명
                            </p>
                        </div>
                        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 shadow-sm dark:border-rose-900/40 dark:bg-rose-900/20">
                            <p className="mb-1 text-xs text-rose-400">{brideName || "신부"}측</p>
                            <p className="text-base font-bold text-rose-600 dark:text-rose-300">
                                {formatKRW(totalBride)}
                            </p>
                            <p className="mt-0.5 text-xs text-rose-400 dark:text-rose-500">
                                {countBride}명
                            </p>
                        </div>
                    </div>

                    {/* 항목 추가 폼 */}
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <p className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            항목 추가
                        </p>

                        {/* 1행: 이름 · 측 */}
                        <div className="mb-3 grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                                    하객 이름 <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    ref={nameRef}
                                    className={inputCls}
                                    placeholder="예: 김철수"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAdd();
                                    }}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                                    측 <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {(["groom", "bride"] as GiftSide[]).map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setSide(s)}
                                            className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                                                side === s
                                                    ? s === "groom"
                                                        ? "border-blue-300 bg-blue-500 text-white dark:border-blue-600 dark:bg-blue-600"
                                                        : "border-rose-300 bg-rose-500 text-white dark:border-rose-600 dark:bg-rose-600"
                                                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                            }`}
                                        >
                                            {sideLabel(s)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 2행: 금액 */}
                        <div className="mb-2">
                            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                                금액 <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    className={`${inputCls} pr-7`}
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={toDisplay(amount)}
                                    onChange={(e) => setAmount(parseInput(e.target.value))}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAdd();
                                    }}
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">
                                    원
                                </span>
                            </div>
                            {/* 빠른 금액 버튼 */}
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {QUICK_AMOUNTS.map((q) => (
                                    <button
                                        key={q}
                                        type="button"
                                        onClick={() => setAmount(q)}
                                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                                            amount === q
                                                ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                        }`}
                                    >
                                        {q >= 10_000 ? `${q / 10_000}만` : `${q.toLocaleString()}`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3행: 관계 · 메모 */}
                        <div className="mb-3 mt-3 grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                                    관계
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {RELATION_OPTIONS.map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRelation(relation === r ? "" : r)}
                                            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                                                relation === r
                                                    ? "border-slate-400 bg-slate-700 text-white dark:border-slate-500 dark:bg-slate-600"
                                                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                            }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                                    메모
                                </label>
                                <input
                                    className={inputCls}
                                    placeholder="선택사항"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAdd();
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={!canAdd}
                            onClick={handleAdd}
                            className="w-full rounded-xl bg-rose-600 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
                        >
                            추가
                        </button>
                    </div>

                    {/* 필터 + 검색 */}
                    {entries.length > 0 && (
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                            {/* 탭 */}
                            <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
                                {(
                                    [
                                        { key: "all", label: "전체" },
                                        { key: "groom", label: `${groomName || "신랑"}측` },
                                        { key: "bride", label: `${brideName || "신부"}측` },
                                    ] as { key: FilterSide; label: string }[]
                                ).map(({ key, label }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setFilterSide(key)}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                            filterSide === key
                                                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* 검색 */}
                            <div className="relative flex-1">
                                <svg
                                    className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                >
                                    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                                    <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                                <input
                                    className={`${inputCls} pl-8`}
                                    placeholder="이름·관계로 검색"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* 필터 결과 소계 */}
                    {entries.length > 0 && (filterSide !== "all" || search) && filtered.length > 0 && (
                        <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-100 px-4 py-2.5 dark:bg-slate-800">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {filtered.length}명
                            </span>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                {formatKRW(filtered.reduce((s, e) => s + e.amount, 0))}
                            </span>
                        </div>
                    )}

                    {/* 항목 목록 */}
                    {entries.length === 0 ? (
                        <div className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
                            아직 등록된 항목이 없어요.
                            <br />
                            위 폼에서 첫 번째 하객을 추가해보세요!
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
                            검색 결과가 없어요.
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                            {filtered.map((entry, idx) => (
                                <div
                                    key={entry.id}
                                    className={`flex items-center gap-3 px-4 py-3.5 ${
                                        idx !== filtered.length - 1
                                            ? "border-b border-slate-100 dark:border-slate-700"
                                            : ""
                                    }`}
                                >
                                    {/* 측 배지 */}
                                    <span
                                        className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${sideBadgeCls(entry.side)}`}
                                    >
                                        {sideLabel(entry.side)}
                                    </span>

                                    {/* 이름 + 관계 */}
                                    <div className="min-w-0 flex-1">
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            {entry.name}
                                        </span>
                                        {entry.relation && (
                                            <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">
                                                {entry.relation}
                                            </span>
                                        )}
                                        {entry.note && (
                                            <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
                                                {entry.note}
                                            </p>
                                        )}
                                    </div>

                                    {/* 금액 */}
                                    <span className="shrink-0 text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
                                        {formatKRW(entry.amount)}
                                    </span>

                                    {/* 삭제 */}
                                    {confirmDeleteId === entry.id ? (
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(entry.id)}
                                                className="rounded-lg bg-rose-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-600 transition-colors"
                                            >
                                                삭제
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setConfirmDeleteId(null)}
                                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50 transition-colors dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                                            >
                                                취소
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDeleteId(entry.id)}
                                            className="shrink-0 text-xs text-slate-300 hover:text-rose-500 transition-colors dark:text-slate-600 dark:hover:text-rose-400"
                                        >
                                            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                                                <path d="M3 4h10M6 4V3h4v1M5 4l.5 8.5h5L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
