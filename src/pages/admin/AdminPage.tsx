import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/auth/AuthContext";
import { AppNav } from "../../components/layout/AppNav";
import { Select } from "../../components/ui/Select";
import { getAllInquiries, updateInquiryStatus, deleteInquiry } from "../../firebase/inquiryService";
import type { Inquiry, InquiryStatus } from "../../types/inquiry";
import { MAIN } from "../../routes/route";

const ADMIN_UIDS: string[] = ((import.meta.env.VITE_ADMIN_UIDS as string) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

type FilterTab = "all" | InquiryStatus;

const TAB_LABELS: Record<FilterTab, string> = {
    all: "전체",
    pending: "접수됨",
    in_progress: "처리중",
    completed: "완료",
};

const STATUS_OPTIONS = [
    { value: "pending", label: "접수됨" },
    { value: "in_progress", label: "처리중" },
    { value: "completed", label: "완료" },
];

const STATUS_BADGE: Record<InquiryStatus, { label: string; cls: string }> = {
    pending: { label: "접수됨", cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
    in_progress: { label: "처리중", cls: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800" },
    completed: { label: "완료", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800" },
};

const INQUIRY_TYPE_LABELS: Record<Inquiry["type"], string> = {
    service: "서비스 문의",
    bug: "버그 신고",
    other: "기타",
};

export function AdminPage() {
    const { user, loading } = useAuth();

    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [fetching, setFetching] = useState(true);
    const [filter, setFilter] = useState<FilterTab>("all");
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const isAdmin = ADMIN_UIDS.length > 0 && !!user && ADMIN_UIDS.includes(user.uid);

    useEffect(() => {
        if (!isAdmin) return;
        getAllInquiries()
            .then(setInquiries)
            .catch(() => {})
            .finally(() => setFetching(false));
    }, [isAdmin]);

    if (loading) return null;
    if (!user || !isAdmin) return <Navigate to={MAIN} replace />;

    const filtered = filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);

    const counts = {
        all: inquiries.length,
        pending: inquiries.filter((i) => i.status === "pending").length,
        in_progress: inquiries.filter((i) => i.status === "in_progress").length,
        completed: inquiries.filter((i) => i.status === "completed").length,
    };

    const handleStatusChange = async (id: string, status: InquiryStatus) => {
        await updateInquiryStatus(id, status);
        setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("이 문의를 삭제할까요?")) return;
        await deleteInquiry(id);
        setInquiries((prev) => prev.filter((i) => i.id !== id));
    };

    const toggleExpand = (id: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <AppNav />

            <main className="mx-auto max-w-3xl px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">관리자 페이지</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">문의 내역을 관리합니다.</p>
                </div>

                {/* 통계 */}
                <div className="mb-6 grid grid-cols-4 gap-3">
                    {(["all", "pending", "in_progress", "completed"] as FilterTab[]).map((tab) => (
                        <div key={tab} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{counts[tab]}</p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{TAB_LABELS[tab]}</p>
                        </div>
                    ))}
                </div>

                {/* 필터 탭 */}
                <div className="mb-4 flex gap-2 overflow-x-auto">
                    {(["all", "pending", "in_progress", "completed"] as FilterTab[]).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setFilter(tab)}
                            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                                filter === tab
                                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700"
                            }`}
                        >
                            {TAB_LABELS[tab]} {counts[tab] > 0 && <span className="ml-1 opacity-70">{counts[tab]}</span>}
                        </button>
                    ))}
                </div>

                {/* 문의 목록 */}
                {fetching ? (
                    <div className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">불러오는 중...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">문의 내역이 없습니다.</div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((inq) => {
                            const badge = STATUS_BADGE[inq.status];
                            const isOpen = expanded.has(inq.id);
                            return (
                                <div key={inq.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                    {/* 상단: 유저 정보 + 유형 + 날짜 */}
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{inq.userName}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">{inq.userEmail}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-right">
                                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                                {new Date(inq.createdAt).toLocaleDateString("ko-KR")}
                                            </span>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>{badge.label}</span>
                                        </div>
                                    </div>

                                    {/* 유형 + 제목 */}
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                                            {INQUIRY_TYPE_LABELS[inq.type]}
                                        </span>
                                    </div>
                                    <p className="mb-2 font-semibold text-slate-900 dark:text-slate-100">{inq.title}</p>

                                    {/* 내용 펼치기/접기 */}
                                    <button
                                        type="button"
                                        onClick={() => toggleExpand(inq.id)}
                                        className="mb-2 text-xs font-medium text-rose-500 hover:text-rose-700 transition-colors dark:text-rose-400"
                                    >
                                        {isOpen ? "내용 접기" : "내용 보기"}
                                    </button>
                                    {isOpen && (
                                        <p className="mb-3 whitespace-pre-line rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
                                            {inq.content}
                                        </p>
                                    )}

                                    {/* 상태 변경 + 삭제 */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <Select
                                                value={inq.status}
                                                onValueChange={(v) => handleStatusChange(inq.id, v as InquiryStatus)}
                                                options={STATUS_OPTIONS}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(inq.id)}
                                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:border-rose-300 hover:text-rose-500 transition-colors dark:border-slate-600 dark:text-slate-400 dark:hover:border-rose-500 dark:hover:text-rose-400"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
