import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AppNav } from "../../components/layout/AppNav";
import { useSettings } from "../../context/settings/SettingsContext";
import type { GuestEntry, GuestAttendance } from "../../types/guest";
import type { GiftSide } from "../../types/giftLedger";
import { loadGuests, saveGuests } from "../../utils/guestStorage";
import { SETTINGS } from "../../routes/route";

// ─── 유틸 ────────────────────────────────────────────────────
function createId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatKRW(n: number) {
    return `${n.toLocaleString("ko-KR")}원`;
}

function exportCSV(entries: GuestEntry[], groomName: string, brideName: string) {
    const groom = groomName || "신랑";
    const bride = brideName || "신부";
    const ATTEND_LABEL: Record<GuestAttendance, string> = {
        attending: "참석",
        not_attending: "불참",
        unknown: "미확인",
    };
    const header = `이름,측,관계,연락처,참석여부,식사수,메모\n`;
    const rows = entries
        .map((e) =>
            [
                e.name,
                e.side === "groom" ? `${groom}측` : `${bride}측`,
                e.relation ?? "",
                e.phone ?? "",
                ATTEND_LABEL[e.attendance],
                e.mealCount,
                e.note ?? "",
            ]
                .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                .join(","),
        )
        .join("\n");

    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "게스트리스트.csv";
    a.click();
    URL.revokeObjectURL(url);
}

// ─── 상수 ────────────────────────────────────────────────────
const RELATION_OPTIONS = ["친구", "직장동료", "친척", "가족", "지인", "기타"];

const ATTENDANCE_META: Record<GuestAttendance, { label: string; next: GuestAttendance; cls: string }> = {
    unknown:      { label: "미확인", next: "attending",     cls: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600" },
    attending:    { label: "참석",   next: "not_attending", cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800" },
    not_attending:{ label: "불참",   next: "unknown",       cls: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800" },
};

const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-rose-400/50 dark:focus:ring-rose-400/10";

type FilterSide = "all" | GiftSide;
type FilterAttendance = "all" | GuestAttendance;

// ─── 컴포넌트 ────────────────────────────────────────────────
export function Guests() {
    const { settings } = useSettings();
    const { groomName, brideName, mealCostPerPerson } = settings;

    const [guests, setGuests] = useState<GuestEntry[]>(() => loadGuests());
    useEffect(() => { saveGuests(guests); }, [guests]);

    // 폼 상태
    const [name, setName] = useState("");
    const [side, setSide] = useState<GiftSide>("groom");
    const [attendance, setAttendance] = useState<GuestAttendance>("unknown");
    const [mealCount, setMealCount] = useState(1);
    const [phone, setPhone] = useState("");
    const [relation, setRelation] = useState("");
    const [note, setNote] = useState("");
    const nameRef = useRef<HTMLInputElement>(null);

    // 필터/검색
    const [filterSide, setFilterSide] = useState<FilterSide>("all");
    const [filterAttendance, setFilterAttendance] = useState<FilterAttendance>("all");
    const [search, setSearch] = useState("");

    // 삭제 확인
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // ─── 집계 ─────────────────────────────────────────
    const stats = useMemo(() => {
        const total = guests.length;
        const groomCount = guests.filter((g) => g.side === "groom").length;
        const brideCount = guests.filter((g) => g.side === "bride").length;
        const attending = guests.filter((g) => g.attendance === "attending");
        const attendingCount = attending.length;
        const totalMeals = attending.reduce((s, g) => s + g.mealCount, 0);
        const notAttending = guests.filter((g) => g.attendance === "not_attending").length;
        const unknown = guests.filter((g) => g.attendance === "unknown").length;
        return { total, groomCount, brideCount, attendingCount, totalMeals, notAttending, unknown };
    }, [guests]);

    const filtered = useMemo(() => {
        return guests
            .filter((g) => filterSide === "all" || g.side === filterSide)
            .filter((g) => filterAttendance === "all" || g.attendance === filterAttendance)
            .filter((g) => {
                if (!search.trim()) return true;
                const q = search.trim().toLowerCase();
                return (
                    g.name.toLowerCase().includes(q) ||
                    (g.phone ?? "").includes(q) ||
                    (g.relation ?? "").toLowerCase().includes(q)
                );
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [guests, filterSide, filterAttendance, search]);

    // ─── 액션 ─────────────────────────────────────────
    const canAdd = name.trim().length > 0;

    const handleAdd = () => {
        if (!canAdd) return;
        setGuests((prev) => [
            {
                id: createId(),
                name: name.trim(),
                side,
                attendance,
                mealCount,
                phone: phone.trim() || undefined,
                relation: relation.trim() || undefined,
                note: note.trim() || undefined,
                createdAt: new Date().toISOString(),
            },
            ...prev,
        ]);
        setName(""); setPhone(""); setRelation(""); setNote("");
        setAttendance("unknown"); setMealCount(1);
        setTimeout(() => nameRef.current?.focus(), 0);
    };

    const toggleAttendance = (id: string) => {
        setGuests((prev) =>
            prev.map((g) =>
                g.id === id
                    ? { ...g, attendance: ATTENDANCE_META[g.attendance].next }
                    : g,
            ),
        );
    };

    const adjustMeal = (id: string, delta: number) => {
        setGuests((prev) =>
            prev.map((g) =>
                g.id === id ? { ...g, mealCount: Math.max(0, g.mealCount + delta) } : g,
            ),
        );
    };

    const handleDelete = (id: string) => {
        setGuests((prev) => prev.filter((g) => g.id !== id));
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
                            게스트 리스트
                        </h1>
                        {guests.length > 0 && (
                            <button
                                type="button"
                                onClick={() => exportCSV(guests, groomName, brideName)}
                                className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                            >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                CSV
                            </button>
                        )}
                    </div>

                    {/* 요약 카드 */}
                    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                            <p className="mb-1 text-xs text-slate-400 dark:text-slate-500">전체 하객</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.total}<span className="ml-0.5 text-sm font-normal text-slate-400">명</span></p>
                            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                                {groomName || "신랑"} {stats.groomCount} · {brideName || "신부"} {stats.brideCount}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-900/20">
                            <p className="mb-1 text-xs text-emerald-500">참석 확정</p>
                            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{stats.attendingCount}<span className="ml-0.5 text-sm font-normal text-emerald-400">명</span></p>
                            <p className="mt-0.5 text-xs text-emerald-500">불참 {stats.notAttending} · 미확인 {stats.unknown}</p>
                        </div>
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm dark:border-blue-900/40 dark:bg-blue-900/20">
                            <p className="mb-1 text-xs text-blue-400">총 식사 수</p>
                            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{stats.totalMeals}<span className="ml-0.5 text-sm font-normal text-blue-400">식</span></p>
                            <p className="mt-0.5 text-xs text-blue-400">참석 확정 기준</p>
                        </div>
                        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm dark:border-amber-900/40 dark:bg-amber-900/20">
                            <p className="mb-1 text-xs text-amber-500">예상 식대</p>
                            {mealCostPerPerson > 0 ? (
                                <>
                                    <p className="text-base font-bold text-amber-700 dark:text-amber-300 leading-tight">
                                        {formatKRW(stats.totalMeals * mealCostPerPerson)}
                                    </p>
                                    <p className="mt-0.5 text-xs text-amber-500">{formatKRW(mealCostPerPerson)}/인</p>
                                </>
                            ) : (
                                <Link
                                    to={SETTINGS}
                                    className="mt-1 block text-xs text-amber-500 underline underline-offset-2 hover:text-amber-700 transition-colors dark:text-amber-400 dark:hover:text-amber-300"
                                >
                                    식대 단가 설정하기 →
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* 항목 추가 폼 */}
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <p className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            하객 추가
                        </p>

                        {/* 1행: 이름 · 측 */}
                        <div className="mb-3 grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                                    이름 <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    ref={nameRef}
                                    className={inputCls}
                                    placeholder="예: 김철수"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
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
                                                        ? "border-blue-300 bg-blue-500 text-white"
                                                        : "border-rose-300 bg-rose-500 text-white"
                                                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                            }`}
                                        >
                                            {sideLabel(s)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 2행: 참석 여부 · 식사 수 */}
                        <div className="mb-3 grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">참석 여부</label>
                                <div className="flex gap-1.5">
                                    {(["attending", "unknown", "not_attending"] as GuestAttendance[]).map((a) => (
                                        <button
                                            key={a}
                                            type="button"
                                            onClick={() => setAttendance(a)}
                                            className={`flex-1 rounded-xl border py-2 text-xs font-medium transition-colors ${
                                                attendance === a
                                                    ? ATTENDANCE_META[a].cls + " ring-1 ring-current"
                                                    : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700"
                                            }`}
                                        >
                                            {ATTENDANCE_META[a].label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">식사 수</label>
                                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setMealCount((v) => Math.max(0, v - 1))}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                                    >−</button>
                                    <span className="flex-1 text-center text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {mealCount}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setMealCount((v) => v + 1)}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                                    >+</button>
                                </div>
                            </div>
                        </div>

                        {/* 3행: 연락처 · 관계 */}
                        <div className="mb-3 grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">연락처</label>
                                <input
                                    className={inputCls}
                                    placeholder="010-0000-0000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">관계</label>
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
                    {guests.length > 0 && (
                        <div className="mb-3 space-y-2">
                            <div className="flex flex-col gap-2 sm:flex-row">
                                {/* 측 탭 */}
                                <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
                                    {(
                                        [
                                            { key: "all",   label: "전체" },
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

                                {/* 참석 탭 */}
                                <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
                                    {(
                                        [
                                            { key: "all",          label: "전체" },
                                            { key: "attending",    label: "참석" },
                                            { key: "not_attending",label: "불참" },
                                            { key: "unknown",      label: "미확인" },
                                        ] as { key: FilterAttendance; label: string }[]
                                    ).map(({ key, label }) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setFilterAttendance(key)}
                                            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                                filterAttendance === key
                                                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 검색 */}
                            <div className="relative">
                                <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" viewBox="0 0 16 16" fill="none">
                                    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                                    <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                                <input
                                    className={`${inputCls} pl-8`}
                                    placeholder="이름·연락처·관계로 검색"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* 필터 소계 */}
                    {guests.length > 0 && filtered.length > 0 && (filterSide !== "all" || filterAttendance !== "all" || search) && (
                        <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-100 px-4 py-2.5 dark:bg-slate-800">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {filtered.length}명
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                식사 {filtered.filter(g => g.attendance === "attending").reduce((s, g) => s + g.mealCount, 0)}식
                            </span>
                        </div>
                    )}

                    {/* 목록 */}
                    {guests.length === 0 ? (
                        <div className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
                            아직 등록된 하객이 없어요.<br />위 폼에서 첫 번째 하객을 추가해보세요!
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
                            검색 결과가 없어요.
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                            {filtered.map((guest, idx) => (
                                <div
                                    key={guest.id}
                                    className={`flex items-center gap-2.5 px-4 py-3.5 ${
                                        idx !== filtered.length - 1
                                            ? "border-b border-slate-100 dark:border-slate-700"
                                            : ""
                                    }`}
                                >
                                    {/* 측 배지 */}
                                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${sideBadgeCls(guest.side)}`}>
                                        {sideLabel(guest.side)}
                                    </span>

                                    {/* 이름 + 관계 + 연락처 */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                {guest.name}
                                            </span>
                                            {guest.relation && (
                                                <span className="text-xs text-slate-400 dark:text-slate-500">{guest.relation}</span>
                                            )}
                                        </div>
                                        {guest.phone && (
                                            <p className="text-xs text-slate-400 dark:text-slate-500">{guest.phone}</p>
                                        )}
                                        {guest.note && (
                                            <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">{guest.note}</p>
                                        )}
                                    </div>

                                    {/* 식사 수 +/- */}
                                    <div className="flex shrink-0 items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => adjustMeal(guest.id, -1)}
                                            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-xs text-slate-400 hover:bg-slate-100 transition-colors dark:border-slate-600 dark:text-slate-500 dark:hover:bg-slate-700"
                                        >−</button>
                                        <span className="w-5 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">{guest.mealCount}</span>
                                        <button
                                            type="button"
                                            onClick={() => adjustMeal(guest.id, 1)}
                                            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-xs text-slate-400 hover:bg-slate-100 transition-colors dark:border-slate-600 dark:text-slate-500 dark:hover:bg-slate-700"
                                        >+</button>
                                    </div>

                                    {/* 참석 여부 토글 버튼 */}
                                    <button
                                        type="button"
                                        title="클릭하여 참석 상태 변경"
                                        onClick={() => toggleAttendance(guest.id)}
                                        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors cursor-pointer ${ATTENDANCE_META[guest.attendance].cls}`}
                                    >
                                        {ATTENDANCE_META[guest.attendance].label}
                                    </button>

                                    {/* 삭제 */}
                                    {confirmDeleteId === guest.id ? (
                                        <div className="flex shrink-0 items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(guest.id)}
                                                className="rounded-lg bg-rose-500 px-2 py-1 text-xs font-medium text-white hover:bg-rose-600 transition-colors"
                                            >삭제</button>
                                            <button
                                                type="button"
                                                onClick={() => setConfirmDeleteId(null)}
                                                className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 transition-colors dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                                            >취소</button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDeleteId(guest.id)}
                                            className="shrink-0 text-slate-300 hover:text-rose-500 transition-colors dark:text-slate-600 dark:hover:text-rose-400"
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
