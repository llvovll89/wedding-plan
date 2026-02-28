import { useCallback, useEffect, useRef, useState } from "react";
import type { Venue } from "../../types/venue";

interface KakaoPlace {
    place_name: string;
    road_address_name: string;
    address_name: string;
    phone: string;
    category_name: string;
    place_url: string;
}

interface KakaoResponse {
    documents: KakaoPlace[];
    meta: { is_end: boolean; total_count: number };
}

interface VenueSearchModalProps {
    onSelect: (venue: Venue) => void;
    onClose: () => void;
}

const API_KEY = import.meta.env.VITE_KAKAO_API_KEY as string | undefined;
const PAGE_SIZE = 15;

const REGION_MAP: Record<string, string> = {
    서울특별시: "서울", 부산광역시: "부산", 대구광역시: "대구",
    인천광역시: "인천", 광주광역시: "광주", 대전광역시: "대전",
    울산광역시: "울산", 세종특별자치시: "세종",
    경기도: "경기", 강원도: "강원", 강원특별자치도: "강원",
    충청북도: "충북", 충청남도: "충남",
    전라북도: "전북", 전북특별자치도: "전북", 전라남도: "전남",
    경상북도: "경북", 경상남도: "경남", 제주특별자치도: "제주",
};

function toVenue(place: KakaoPlace): Venue {
    const address = place.road_address_name || place.address_name;
    const regionWord = address.trim().split(/\s+/)[0] ?? "";
    return {
        name: place.place_name,
        address,
        phone: place.phone,
        region: REGION_MAP[regionWord] ?? regionWord,
    };
}

async function fetchPlaces(q: string, page: number): Promise<KakaoResponse> {
    const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}&size=${PAGE_SIZE}&page=${page}`,
        { headers: { Authorization: `KakaoAK ${API_KEY}` } },
    );
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json() as Promise<KakaoResponse>;
}

export function VenueSearchModal({ onSelect, onClose }: VenueSearchModalProps) {
    const [query, setQuery] = useState("예식장");
    const [results, setResults] = useState<KakaoPlace[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isEnd, setIsEnd] = useState(true);
    const [error, setError] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // refs로 IntersectionObserver 내부의 stale closure 방지
    const queryRef = useRef(query);
    const pageRef = useRef(1);
    const loadingRef = useRef(false);
    const loadingMoreRef = useRef(false);
    const isEndRef = useRef(true);

    useEffect(() => { queryRef.current = query; }, [query]);
    useEffect(() => { loadingRef.current = loading; }, [loading]);
    useEffect(() => { loadingMoreRef.current = loadingMore; }, [loadingMore]);
    useEffect(() => { isEndRef.current = isEnd; }, [isEnd]);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const doSearch = useCallback(async (q: string) => {
        if (!q.trim() || q.trim().length < 2) {
            setResults([]);
            setIsEnd(true);
            isEndRef.current = true;
            return;
        }
        loadingRef.current = true;
        setLoading(true);
        setError("");
        setResults([]);
        setIsEnd(true);
        isEndRef.current = true;
        try {
            const data = await fetchPlaces(q, 1);
            setResults(data.documents ?? []);
            setIsEnd(data.meta.is_end);
            isEndRef.current = data.meta.is_end;
            pageRef.current = 2;
        } catch {
            setError("검색 중 오류가 발생했어요. API 키를 확인해 주세요.");
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    const doLoadMore = useCallback(async () => {
        if (loadingRef.current || loadingMoreRef.current || isEndRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        try {
            const data = await fetchPlaces(queryRef.current, pageRef.current);
            setResults((prev) => [...prev, ...(data.documents ?? [])]);
            setIsEnd(data.meta.is_end);
            isEndRef.current = data.meta.is_end;
            pageRef.current += 1;
        } catch {
            // load-more 실패는 조용히 무시
        } finally {
            loadingMoreRef.current = false;
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { void doSearch(query); }, 500);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query, doSearch]);

    // sentinel이 보이면 다음 페이지 로드
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) void doLoadMore(); },
            { threshold: 0.1 },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [doLoadMore]);

    if (!API_KEY) {
        return (
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm">
                <div className="w-full sm:w-[440px] flex flex-col rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
                    <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-700">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">예식장 검색</h2>
                        <button type="button" onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition-colors dark:hover:bg-slate-700">
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                        </button>
                    </div>
                    <div className="flex flex-col gap-4 px-6 py-8">
                        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 dark:bg-amber-900/20 dark:border-amber-800">
                            <span className="text-xl">🔑</span>
                            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">카카오 API 키 설정이 필요해요</p>
                        </div>
                        <div className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-mono text-emerald-400">
                            VITE_KAKAO_API_KEY=<span className="text-slate-400">여기에_REST_API_키_붙여넣기</span>
                        </div>
                        <button type="button" onClick={onClose} className="w-full rounded-xl border border-slate-200 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700">
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm">
            <div className="w-full sm:w-[480px] max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
                {/* 헤더 */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">예식장 검색</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-700 dark:hover:text-slate-300"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* 검색 입력 */}
                <div className="px-4 pt-3 pb-2">
                    <div className="relative">
                        {loading ? (
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="60" strokeDashoffset="20" />
                            </svg>
                        ) : (
                            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 16 16" fill="none">
                                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        )}
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="예: 대구 예식장, 골든로즈 웨딩"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-rose-400/50 dark:focus:ring-rose-400/10"
                        />
                    </div>
                    {error && <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{error}</p>}
                </div>

                {/* 결과 수 */}
                {results.length > 0 && (
                    <p className="px-5 pb-1 text-xs text-slate-400 dark:text-slate-500">
                        {results.length}개 로드됨 · 카카오맵 기준
                    </p>
                )}

                {/* 결과 목록 */}
                <div className="overflow-y-auto flex-1 px-3 pb-4">
                    {!loading && results.length === 0 && query.trim().length >= 2 && !error && (
                        <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">검색 결과가 없어요</div>
                    )}
                    {!loading && query.trim().length < 2 && (
                        <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">검색어를 입력하세요</div>
                    )}
                    {results.length > 0 && (
                        <ul className="space-y-1">
                            {results.map((place, i) => (
                                <li key={i} className="flex items-center gap-1 rounded-xl hover:bg-rose-50 active:bg-rose-100 transition-colors dark:hover:bg-rose-900/20">
                                    <button
                                        type="button"
                                        onClick={() => { onSelect(toVenue(place)); onClose(); }}
                                        className="flex-1 min-w-0 px-4 py-3 text-left"
                                    >
                                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                                            {place.place_name}
                                        </p>
                                        {(place.road_address_name || place.address_name) && (
                                            <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
                                                {place.road_address_name || place.address_name}
                                            </p>
                                        )}
                                        <div className="mt-0.5 flex items-center gap-2">
                                            {place.phone && (
                                                <p className="text-xs text-slate-400 dark:text-slate-500">{place.phone}</p>
                                            )}
                                        </div>
                                    </button>
                                    {place.place_url && (
                                        <a
                                            href={place.place_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="shrink-0 mr-2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors dark:text-slate-500 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                                            title="카카오맵에서 보기"
                                        >
                                            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                                                <path d="M6.5 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                                <path d="M9.5 2H14v4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M14 2L8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                            </svg>
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* 무한스크롤 sentinel */}
                    <div ref={sentinelRef} className="h-1" />

                    {/* 추가 로딩 인디케이터 */}
                    {loadingMore && (
                        <div className="flex justify-center py-3">
                            <svg className="h-5 w-5 animate-spin text-rose-400" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="60" strokeDashoffset="20" />
                            </svg>
                        </div>
                    )}
                    {!loading && !loadingMore && !isEnd && results.length > 0 && (
                        <p className="py-2 text-center text-xs text-slate-300 dark:text-slate-600">스크롤하여 더 보기</p>
                    )}
                    {!loading && isEnd && results.length > 0 && (
                        <p className="py-3 text-center text-xs text-slate-300 dark:text-slate-600">모든 결과를 불러왔어요</p>
                    )}
                </div>

                {/* 하단 출처 */}
                <div className="border-t border-slate-100 px-5 py-2.5 dark:border-slate-700">
                    <p className="text-xs text-slate-300 dark:text-slate-600 text-right">Powered by Kakao Local Search</p>
                </div>
            </div>
        </div>
    );
}
