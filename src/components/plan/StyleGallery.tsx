import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/auth/AuthContext";
import {
    uploadStyleImage,
    loadStyleImages,
    deleteStyleImage,
    validateStyleImageFile,
    STYLE_CATEGORIES,
    STYLE_CATEGORY_LABEL,
    type StyleCategory,
    type StyleImage,
} from "../../firebase/styleImageService";

export function StyleGallery() {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeCategory, setActiveCategory] = useState<StyleCategory>("dress");
    const [images, setImages] = useState<StyleImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        loadStyleImages(user.uid)
            .then(setImages)
            .finally(() => setLoading(false));
    }, [user]);

    const filtered = images.filter((img) => img.category === activeCategory);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        e.target.value = "";

        const err = validateStyleImageFile(file);
        if (err) { setUploadError(err); return; }

        setUploadError("");
        setUploading(true);
        try {
            const image = await uploadStyleImage(user.uid, file, activeCategory);
            setImages((prev) => [image, ...prev]);
        } catch {
            setUploadError("업로드에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (img: StyleImage) => {
        if (!user) return;
        setDeletingId(img.id);
        try {
            await deleteStyleImage(user.uid, img.id, img.storagePath);
            setImages((prev) => prev.filter((i) => i.id !== img.id));
        } finally {
            setDeletingId(null);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-sm text-slate-400 dark:text-slate-500">
                    로그인하면 스타일 레퍼런스 이미지를 저장할 수 있어요.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* 카테고리 탭 */}
            <div className="mb-5 flex flex-wrap gap-2">
                {STYLE_CATEGORIES.map((cat) => {
                    const count = images.filter((img) => img.category === cat).length;
                    return (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setActiveCategory(cat)}
                            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                                activeCategory === cat
                                    ? "bg-rose-500 text-white shadow-sm"
                                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                            }`}
                        >
                            {STYLE_CATEGORY_LABEL[cat]}
                            {count > 0 && (
                                <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                                    activeCategory === cat
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                                }`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* 업로드 버튼 + 에러 */}
            <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {STYLE_CATEGORY_LABEL[activeCategory]}
                </span>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 rounded-full bg-rose-500 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
                >
                    {uploading ? (
                        <>
                            <svg className="h-3 w-3 animate-spin" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" />
                            </svg>
                            업로드 중...
                        </>
                    ) : (
                        <>
                            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none">
                                <path d="M8 2v8M4 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            이미지 추가
                        </>
                    )}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {uploadError && (
                <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {uploadError}
                </p>
            )}

            {/* 이미지 그리드 */}
            {loading ? (
                <div className="flex h-32 items-center justify-center text-sm text-slate-400">
                    불러오는 중...
                </div>
            ) : filtered.length === 0 ? (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 py-12 text-rose-400 hover:bg-rose-50 hover:border-rose-300 transition-colors dark:border-rose-800 dark:bg-rose-900/10 dark:text-rose-500"
                >
                    <svg className="h-8 w-8 opacity-60" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M3 15l5-4 4 3 3-2.5 6 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm">{STYLE_CATEGORY_LABEL[activeCategory]} 레퍼런스 이미지를 추가해보세요</span>
                </button>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {filtered.map((img) => (
                        <div
                            key={img.id}
                            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
                        >
                            <button
                                type="button"
                                className="block w-full"
                                onClick={() => setLightboxUrl(img.url)}
                            >
                                <div className="aspect-[3/4] overflow-hidden">
                                    <img
                                        src={img.url}
                                        alt={img.name}
                                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                    />
                                </div>
                            </button>
                            <div className="px-2.5 py-2">
                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{img.name}</p>
                            </div>
                            {/* 삭제 버튼 */}
                            <button
                                type="button"
                                onClick={() => handleDelete(img)}
                                disabled={deletingId === img.id}
                                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-rose-500/80 transition-all disabled:opacity-50"
                                aria-label="이미지 삭제"
                            >
                                {deletingId === img.id ? (
                                    <svg className="h-3 w-3 animate-spin" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2.5" strokeDasharray="28" strokeDashoffset="10" />
                                    </svg>
                                ) : (
                                    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none">
                                        <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 라이트박스 */}
            {lightboxUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
                    onClick={() => setLightboxUrl(null)}
                >
                    <img
                        src={lightboxUrl}
                        alt="레퍼런스 이미지"
                        className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        type="button"
                        onClick={() => setLightboxUrl(null)}
                        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                        aria-label="닫기"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 16 16" fill="none">
                            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
