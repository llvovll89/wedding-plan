import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { useAuth } from "../../context/auth/AuthContext";
import {
    uploadMoodImage,
    loadMoodImages,
    deleteMoodImage,
    validateImageFile,
    type MoodImage,
} from "../../firebase/moodImageService";

export type NavSection = "features" | "how" | "gallery";

const SECTION_TITLE: Record<NavSection, string> = {
    features: "기능",
    how: "사용법",
    gallery: "무드",
};

function FeaturesContent() {
    const items = [
        {
            icon: "🗂️",
            title: "업체/견적 저장",
            desc: "스드메·예식장·스냅·사회자 등 업체별로 금액, 메모, 링크를 카드 형태로 저장합니다.",
            detail: ["카테고리별 분류 (스드메, 예식장, 스냅 등)", "견적서 링크 첨부", "메모 자유롭게 기록"],
        },
        {
            icon: "💰",
            title: "예산 카테고리 합계",
            desc: "예약금과 잔금을 분리 입력하고, 상태(예정/확정/결제완료)별로 합계를 자동 계산합니다.",
            detail: ["예약금 / 잔금 분리 입력", "상태별 필터 합계", "전체 예산 한눈에 확인"],
        },
        {
            icon: "📅",
            title: "일정/체크리스트 연결",
            desc: "날짜가 입력된 항목은 일정으로 자동 연결되고, 해야 할 일은 체크리스트로 관리합니다.",
            detail: ["D-day 자동 계산", "날짜 입력 시 일정 자동 등록", "체크리스트로 누락 방지"],
        },
    ];

    return (
        <div className="space-y-4">
            <div className="mb-6">
                <p className="text-sm text-slate-500">"기록 → 정리 → 확인"에 집중한 기능입니다. 연동 대신, 내가 입력한 데이터가 기준이 됩니다.</p>
            </div>
            {items.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-100 bg-white p-5">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                            <div className="font-semibold text-slate-900">{item.title}</div>
                            <div className="mt-1 text-sm text-slate-500">{item.desc}</div>
                            <ul className="mt-3 space-y-1">
                                {item.detail.map((d) => (
                                    <li key={d} className="flex items-center gap-2 text-xs text-slate-600">
                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                                        {d}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function HowContent() {
    const steps = [
        {
            n: "01",
            t: "로그인 후 플랜 페이지 이동",
            d: "구글 또는 이메일로 로그인하면 나만의 플랜 공간이 생깁니다.",
            tip: "로그인 없이는 데이터가 저장되지 않아요.",
        },
        {
            n: "02",
            t: "항목 추가 & 데이터 입력",
            d: "카테고리(스드메/예식장 등)를 선택하고, 금액·날짜·상태·메모를 입력하세요.",
            tip: "예약금과 잔금은 분리해서 입력하면 합계가 자동으로 계산돼요.",
        },
        {
            n: "03",
            t: "한눈에 확인",
            d: "저장된 항목은 카드로 표시되고, 예산 합계를 실시간으로 확인할 수 있어요.",
            tip: "날짜를 입력한 항목은 D-day 흐름으로 확인할 수 있어요.",
        },
    ];

    return (
        <div className="space-y-4">
            <p className="mb-6 text-sm text-slate-500">"연동"이 아니라 "내 기록"으로 완성되는 플랜입니다. 딱 3단계로 시작할 수 있어요.</p>
            {steps.map((step, idx) => (
                <div key={step.n} className="relative flex gap-4">
                    {/* 연결선 */}
                    {idx < steps.length - 1 && (
                        <div className="absolute left-5 top-10 h-full w-px bg-rose-100" />
                    )}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-sm font-bold text-rose-600">
                        {step.n}
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 flex-1">
                        <div className="font-semibold text-slate-900">{step.t}</div>
                        <div className="mt-1 text-sm text-slate-500">{step.d}</div>
                        <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                            <span className="shrink-0">💡</span>
                            <span>{step.tip}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function GalleryContent() {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [userImages, setUserImages] = useState<MoodImage[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [loadingImages, setLoadingImages] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        setLoadingImages(true);
        loadMoodImages(user.uid)
            .then(setUserImages)
            .finally(() => setLoadingImages(false));
    }, [user]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        e.target.value = "";

        const err = validateImageFile(file);
        if (err) { setUploadError(err); return; }

        setUploadError("");
        setUploading(true);
        try {
            const image = await uploadMoodImage(user.uid, file);
            setUserImages((prev) => [image, ...prev]);
        } catch {
            setUploadError("업로드에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (image: MoodImage) => {
        if (!user) return;
        setDeletingId(image.id);
        try {
            await deleteMoodImage(user.uid, image.id, image.storagePath);
            setUserImages((prev) => prev.filter((img) => img.id !== image.id));
        } finally {
            setDeletingId(null);
        }
    };

    const presetMoods = [
        { label: "모던 미니멀", color: "from-slate-100 via-white to-slate-50", tag: "#심플 #화이트" },
        { label: "로맨틱 가든", color: "from-rose-100 via-white to-pink-50", tag: "#플라워 #야외" },
        { label: "빈티지 클래식", color: "from-amber-100 via-white to-yellow-50", tag: "#빈티지 #골드" },
        { label: "보타니컬", color: "from-emerald-100 via-white to-green-50", tag: "#그린 #자연" },
        { label: "럭셔리 블랙", color: "from-slate-200 via-slate-100 to-white", tag: "#블랙 #고급" },
        { label: "파스텔 드림", color: "from-purple-100 via-pink-50 to-rose-50", tag: "#파스텔 #몽환" },
    ];

    return (
        <div>
            <p className="mb-4 text-sm text-slate-500">나만의 웨딩 무드 보드를 만들어보세요. 이미지를 업로드해서 영감을 모아두세요.</p>

            {/* 내 이미지 섹션 */}
            {user ? (
                <div className="mb-6">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-widest text-rose-500">내 무드 이미지</span>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
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
                        <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {uploadError}
                        </p>
                    )}

                    {loadingImages ? (
                        <div className="flex h-16 items-center justify-center text-sm text-slate-400">불러오는 중...</div>
                    ) : userImages.length === 0 ? (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 py-5 text-sm text-rose-400 hover:bg-rose-50 hover:border-rose-300 transition-colors dark:border-rose-800 dark:bg-rose-900/10 dark:text-rose-500"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                                <path d="M8 2v8M4 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            첫 번째 무드 이미지를 업로드해보세요
                        </button>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {userImages.map((img) => (
                                <div key={img.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700">
                                    <div className="aspect-[4/3] overflow-hidden">
                                        <img
                                            src={img.url}
                                            alt={img.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="px-2.5 py-2">
                                        <p className="truncate text-xs text-slate-600 dark:text-slate-400">{img.name}</p>
                                    </div>
                                    {/* 삭제 버튼 */}
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(img)}
                                        disabled={deletingId === img.id}
                                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all disabled:opacity-50"
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
                </div>
            ) : (
                <div className="mb-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/50">
                    로그인하면 나만의 무드 이미지를 업로드할 수 있어요
                </div>
            )}

            {/* 프리셋 무드 */}
            <div>
                <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-slate-400">무드 레퍼런스</span>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {presetMoods.map((mood) => (
                        <div key={mood.label} className="overflow-hidden rounded-2xl border border-rose-100/70 bg-white shadow-sm">
                            <div className={`aspect-[4/3] bg-linear-to-br ${mood.color} flex items-end p-3`}>
                                <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-slate-500 backdrop-blur-sm">
                                    {mood.tag}
                                </span>
                            </div>
                            <div className="px-3 py-2">
                                <div className="text-sm font-medium text-slate-800">{mood.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const SECTION_CONTENT: Record<NavSection, () => ReactElement> = {
    features: FeaturesContent,
    how: HowContent,
    gallery: GalleryContent,
};

interface Props {
    section: NavSection;
    onClose: () => void;
}

export function NavSectionModal({ section, onClose }: Props) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const Content = SECTION_CONTENT[section];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-50 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-slate-100 bg-white px-6 py-4">
                    <div className="text-base font-semibold text-slate-900">{SECTION_TITLE[section]}</div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* 본문 */}
                <div className="p-6">
                    <Content />
                </div>
            </div>
        </div>
    );
}
