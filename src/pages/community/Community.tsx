import { useEffect, useState } from "react";
import { AppNav } from "../../components/layout/AppNav";
import { useAuth } from "../../context/auth/AuthContext";
import { getPosts, createPost, deletePost } from "../../firebase/communityService";
import type { CommunityPost } from "../../types/community";
import { REGIONS } from "../../types/settings";
import { Link } from "react-router-dom";
import { LOGIN } from "../../routes/route";

function formatKRW(n: number) {
    return `${n.toLocaleString("ko-KR")}원`;
}
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}
function formatWeddingDate(d: string) {
    if (!d) return "";
    const [y, m] = d.split("-");
    return `${y}년 ${m}월`;
}

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-slate-400 dark:focus:bg-slate-700";

// ─── 글쓰기 모달 ────────────────────────────────────────────
function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [weddingDate, setWeddingDate] = useState("");
    const [venue, setVenue] = useState("");
    const [region, setRegion] = useState("");
    const [totalCost, setTotalCost] = useState<number | "">("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!title.trim() || !content.trim()) { setError("제목과 내용은 필수예요."); return; }
        setSubmitting(true); setError("");
        try {
            await createPost(user, {
                title: title.trim(),
                content: content.trim(),
                weddingDate,
                venue: venue.trim(),
                region,
                totalCost: totalCost === "" ? 0 : totalCost,
                costBreakdown: {},
            });
            onCreated();
            onClose();
        } catch {
            setError("저장에 실패했어요. 잠시 후 다시 시도해주세요.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center px-0 sm:px-4">
            <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-800">
                <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 rounded-t-3xl sm:rounded-t-3xl dark:border-slate-700 dark:bg-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">후기 작성</p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
                    >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none">
                            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
                    {/* 제목 */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">제목 <span className="text-rose-500">*</span></label>
                        <input
                            className={inputClass}
                            placeholder="예: 2024년 5월 강남 결혼 후기"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* 결혼 날짜 / 지역 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">결혼 날짜</label>
                            <input
                                type="date"
                                className={inputClass}
                                value={weddingDate}
                                onChange={(e) => setWeddingDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">지역</label>
                            <select
                                className={inputClass}
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                            >
                                <option value="">선택 안 함</option>
                                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* 예식장 / 총 비용 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">예식장</label>
                            <input
                                className={inputClass}
                                placeholder="예식장 이름"
                                value={venue}
                                onChange={(e) => setVenue(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">총 비용</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    className={`${inputClass} pr-7`}
                                    value={totalCost}
                                    onChange={(e) => setTotalCost(e.target.value === "" ? "" : Number(e.target.value))}
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">원</span>
                            </div>
                        </div>
                    </div>

                    {/* 내용 */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">후기 <span className="text-rose-500">*</span></label>
                        <textarea
                            rows={5}
                            className={`${inputClass} resize-none`}
                            placeholder="예식 준비 과정, 비용, 업체 후기 등 자유롭게 남겨주세요."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
                    >
                        {submitting ? "등록 중..." : "후기 등록"}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ─── 게시글 카드 ────────────────────────────────────────────
function PostCard({
    post,
    currentUserId,
    onDelete,
}: {
    post: CommunityPost;
    currentUserId: string | null;
    onDelete: (id: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const isOwner = currentUserId === post.authorId;
    const preview = post.content.length > 120 && !expanded
        ? post.content.slice(0, 120) + "…"
        : post.content;

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            {/* 작성자 + 날짜 */}
            <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {post.authorPhotoURL ? (
                        <img src={post.authorPhotoURL} alt="" className="h-7 w-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                            {post.authorName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{post.authorName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(post.createdAt)}</span>
                    {isOwner && (
                        <button
                            type="button"
                            onClick={() => onDelete(post.id)}
                            className="text-xs text-slate-400 hover:text-rose-500 transition-colors dark:text-slate-500 dark:hover:text-rose-400"
                        >
                            삭제
                        </button>
                    )}
                </div>
            </div>

            {/* 제목 */}
            <p className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">{post.title}</p>

            {/* 뱃지 정보 */}
            <div className="mb-3 flex flex-wrap gap-2">
                {post.weddingDate && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-100 px-2.5 py-0.5 text-xs text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300">
                        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                            <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M1 5h10M4 1v2M8 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        {formatWeddingDate(post.weddingDate)}
                    </span>
                )}
                {post.region && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                            <path d="M6 1C4.07 1 2.5 2.57 2.5 4.5c0 2.8 3.5 6.5 3.5 6.5s3.5-3.7 3.5-6.5C9.5 2.57 7.93 1 6 1z" stroke="currentColor" strokeWidth="1.2" />
                            <circle cx="6" cy="4.5" r="1" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                        {post.region}
                    </span>
                )}
                {post.venue && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
                        💒 {post.venue}
                    </span>
                )}
                {post.totalCost > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300">
                        💰 {formatKRW(post.totalCost)}
                    </span>
                )}
            </div>

            {/* 내용 */}
            <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line dark:text-slate-400">{preview}</p>

            {post.content.length > 120 && (
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-2 text-xs font-medium text-rose-500 hover:text-rose-700 transition-colors dark:text-rose-400 dark:hover:text-rose-300"
                >
                    {expanded ? "접기" : "더보기"}
                </button>
            )}
        </div>
    );
}

// ─── Community 페이지 ────────────────────────────────────────
export function Community() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    const loadPosts = async () => {
        setLoading(true); setError("");
        try {
            const data = await getPosts(30);
            setPosts(data);
        } catch {
            setError("게시글을 불러오지 못했어요. Firestore 설정을 확인해주세요.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPosts(); }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm("이 후기를 삭제할까요?")) return;
        try {
            await deletePost(id);
            setPosts((prev) => prev.filter((p) => p.id !== id));
        } catch {
            alert("삭제에 실패했어요.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <AppNav />

            <main className="mx-auto max-w-2xl px-4 py-8">
                {/* 헤더 */}
                <div className="mb-6 flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">결혼 후기</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">실제 결혼 비용과 솔직한 후기를 공유해요.</p>
                    </div>

                    {user ? (
                        <button
                            type="button"
                            onClick={() => setShowCreate(true)}
                            className="shrink-0 flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors shadow-sm"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                            후기 작성
                        </button>
                    ) : (
                        <Link
                            to={LOGIN}
                            className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            로그인 후 작성
                        </Link>
                    )}
                </div>

                {/* 로딩 */}
                {loading && (
                    <div className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">불러오는 중...</div>
                )}

                {/* 에러 */}
                {!loading && error && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* 빈 상태 */}
                {!loading && !error && posts.length === 0 && (
                    <div className="py-20 text-center text-sm text-slate-400 dark:text-slate-500">
                        아직 작성된 후기가 없어요.<br />첫 번째 결혼 후기를 남겨보세요!
                    </div>
                )}

                {/* 게시글 목록 */}
                {!loading && !error && posts.length > 0 && (
                    <div className="grid gap-3">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                currentUserId={user?.uid ?? null}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* 글쓰기 모달 */}
            {showCreate && (
                <CreateModal
                    onClose={() => setShowCreate(false)}
                    onCreated={loadPosts}
                />
            )}
        </div>
    );
}
