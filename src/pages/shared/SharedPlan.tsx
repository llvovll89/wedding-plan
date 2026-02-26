import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getShare, type SharedPlanDoc } from "../../firebase/shareService";
import { usePlan } from "../../context/plan/PlanContext";
import { useAuth } from "../../context/auth/AuthContext";
import { AppNav } from "../../components/layout/AppNav";
import { PLAN, LOGIN } from "../../routes/route";
import type { PlanCategory, PlanStatus } from "../../types/plan";

const CATEGORY_LABEL: Record<PlanCategory, string> = {
    sdeume: "스드메", venue: "예식장", studio: "웨딩촬영",
    snapshot: "스냅", mc: "사회자", honeymoon: "신혼여행", etc: "기타",
};
const STATUS_LABEL: Record<PlanStatus, string> = {
    planned: "예정", in_progress: "진행중", confirmed: "확정", paid: "결제완료",
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

export function SharedPlan() {
    const { shareId } = useParams<{ shareId: string }>();
    const { user } = useAuth();
    const { importPlan } = usePlan();

    const [doc, setDoc] = useState<SharedPlanDoc | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [imported, setImported] = useState(false);

    useEffect(() => {
        if (!shareId) return;
        setLoading(true);
        getShare(shareId)
            .then((data) => {
                if (!data) setError("공유 링크를 찾을 수 없어요.");
                else setDoc(data);
            })
            .catch(() => setError("불러오는 중 오류가 발생했어요."))
            .finally(() => setLoading(false));
    }, [shareId]);

    const handleImport = () => {
        if (!doc) return;
        if (!window.confirm("현재 내 플랜을 지우고 이 플랜으로 교체할까요?")) return;
        importPlan(doc.planData);
        setImported(true);
    };

    const total = doc
        ? doc.planData.items.reduce((s, it) => s + (it.payment.deposit ?? 0) + (it.payment.balance ?? 0), 0)
        : 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <AppNav />

            <div className="mx-auto max-w-2xl px-4 py-8">
                {loading && (
                    <div className="py-20 text-center text-sm text-slate-400 dark:text-slate-500">
                        불러오는 중...
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center dark:border-red-900/40 dark:bg-red-900/20">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                        <Link to={PLAN} className="mt-3 inline-block text-xs text-slate-500 hover:text-slate-700 underline dark:text-slate-400">
                            내 플랜으로 돌아가기
                        </Link>
                    </div>
                )}

                {doc && (
                    <>
                        {/* 헤더 카드 */}
                        <div className="mb-5 rounded-2xl bg-linear-to-r from-rose-500 to-rose-600 p-5 text-white shadow-lg">
                            <p className="text-xs font-medium text-rose-200 mb-1">공유된 웨딩 플랜</p>
                            <h1 className="text-xl font-bold">
                                {doc.settings.groomName || "신랑"} ♥ {doc.settings.brideName || "신부"}
                            </h1>
                            {doc.settings.weddingDate && (
                                <p className="mt-1 text-sm text-rose-100">
                                    {new Date(doc.settings.weddingDate).toLocaleDateString("ko-KR", {
                                        year: "numeric", month: "long", day: "numeric",
                                    })}
                                </p>
                            )}
                            <p className="mt-2 text-xs text-rose-200">공유자: {doc.ownerName}</p>
                        </div>

                        {/* 요약 */}
                        <div className="mb-5 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-xs text-slate-400 mb-1">플랜 항목</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{doc.planData.items.length}개</p>
                            </div>
                            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-xs text-slate-400 mb-1">납부 합계</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatKRW(total)}</p>
                            </div>
                        </div>

                        {/* 가져오기 버튼 */}
                        <div className="mb-5">
                            {imported ? (
                                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 dark:bg-emerald-900/20 dark:border-emerald-700">
                                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">내 플랜으로 가져왔어요!</p>
                                    <Link to={PLAN} className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400">
                                        내 플랜 보기 →
                                    </Link>
                                </div>
                            ) : user ? (
                                <button
                                    type="button"
                                    onClick={handleImport}
                                    className="w-full rounded-2xl bg-rose-600 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
                                >
                                    내 플랜으로 가져오기
                                </button>
                            ) : (
                                <Link
                                    to={LOGIN}
                                    className="block w-full rounded-2xl border border-rose-200 bg-rose-50 py-3 text-center text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-colors dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300"
                                >
                                    로그인 후 내 플랜으로 가져오기
                                </Link>
                            )}
                        </div>

                        {/* 항목 목록 */}
                        <div className="grid gap-3">
                            {doc.planData.items.map((it) => {
                                const depositAmt = it.payment.deposit ?? 0;
                                const balanceAmt = it.payment.balance ?? 0;
                                const payTotal = depositAmt + balanceAmt;
                                return (
                                    <div key={it.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                        <div className="mb-2 flex items-center gap-2 flex-wrap">
                                            <span className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
                                                {CATEGORY_LABEL[it.category]}
                                            </span>
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[it.status]}`}>
                                                {STATUS_LABEL[it.status]}
                                            </span>
                                        </div>
                                        <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{it.name}</p>
                                        {payTotal > 0 && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="rounded-xl bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
                                                    <p className="text-xs text-blue-400">예약금</p>
                                                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">{formatKRW(depositAmt)}</p>
                                                </div>
                                                <div className="rounded-xl bg-rose-50 px-3 py-2 dark:bg-rose-900/20">
                                                    <p className="text-xs text-rose-400">잔금</p>
                                                    <p className="text-sm font-semibold text-rose-600 dark:text-rose-300">{formatKRW(balanceAmt)}</p>
                                                </div>
                                            </div>
                                        )}
                                        {it.memo && (
                                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap">{it.memo}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
