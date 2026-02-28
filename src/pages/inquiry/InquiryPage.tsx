import { useEffect, useState } from "react";
import { useAuth } from "../../context/auth/AuthContext";
import { AppNav } from "../../components/layout/AppNav";
import { Select } from "../../components/ui/Select";
import { createInquiry, getUserInquiries } from "../../firebase/inquiryService";
import type { Inquiry, InquiryType } from "../../types/inquiry";

const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
    service: "서비스 문의",
    bug: "버그 신고",
    other: "기타",
};

const STATUS_BADGE: Record<Inquiry["status"], { label: string; cls: string }> = {
    pending: { label: "접수됨", cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
    in_progress: { label: "처리중", cls: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800" },
    completed: { label: "완료", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800" },
};

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-rose-400/50 dark:focus:ring-rose-400/10";

export function InquiryPage() {
    const { user } = useAuth();

    const [inquiryType, setInquiryType] = useState<InquiryType>("service");
    const [inquiryTitle, setInquiryTitle] = useState("");
    const [inquiryContent, setInquiryContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [myInquiries, setMyInquiries] = useState<Inquiry[]>([]);
    const [inquiriesLoading, setInquiriesLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        setInquiriesLoading(true);
        getUserInquiries(user.uid)
            .then(setMyInquiries)
            .catch(() => {})
            .finally(() => setInquiriesLoading(false));
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!inquiryTitle.trim() || !inquiryContent.trim()) {
            setError("제목과 내용을 입력해주세요.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            await createInquiry(user, { type: inquiryType, title: inquiryTitle.trim(), content: inquiryContent.trim() });
            setInquiryTitle("");
            setInquiryContent("");
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            const updated = await getUserInquiries(user.uid);
            setMyInquiries(updated);
        } catch {
            setError("제출에 실패했어요. 잠시 후 다시 시도해주세요.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <AppNav />

            <main className="mx-auto max-w-xl px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">문의하기</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">서비스 이용 중 불편하신 점이나 문의 사항을 남겨주세요.</p>
                </div>

                {/* 문의 폼 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">문의 유형</label>
                            <Select
                                value={inquiryType}
                                onValueChange={(v) => setInquiryType(v as InquiryType)}
                                options={[
                                    { value: "service", label: "서비스 문의" },
                                    { value: "bug", label: "버그 신고" },
                                    { value: "other", label: "기타" },
                                ]}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">제목</label>
                            <input
                                className={inputClass}
                                placeholder="문의 제목을 입력해주세요"
                                value={inquiryTitle}
                                onChange={(e) => setInquiryTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">내용</label>
                            <textarea
                                rows={5}
                                className={`${inputClass} resize-none`}
                                placeholder="문의 내용을 자세히 적어주세요."
                                value={inquiryContent}
                                onChange={(e) => setInquiryContent(e.target.value)}
                            />
                        </div>
                        {error && (
                            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
                        )}
                        {success && (
                            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">접수되었습니다. 빠르게 검토하겠습니다.</p>
                        )}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600"
                        >
                            {submitting ? "제출 중..." : "문의 제출"}
                        </button>
                    </form>
                </div>

                {/* 내 문의 내역 */}
                {(myInquiries.length > 0 || inquiriesLoading) && (
                    <div className="mt-6">
                        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">내 문의 내역</h2>
                        {inquiriesLoading ? (
                            <p className="text-xs text-slate-400 dark:text-slate-500">불러오는 중...</p>
                        ) : (
                            <div className="space-y-2">
                                {myInquiries.map((inq) => {
                                    const badge = STATUS_BADGE[inq.status];
                                    return (
                                        <div key={inq.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{inq.title}</p>
                                                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                                                        {INQUIRY_TYPE_LABELS[inq.type]} · {new Date(inq.createdAt).toLocaleDateString("ko-KR")}
                                                    </p>
                                                </div>
                                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>{badge.label}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
