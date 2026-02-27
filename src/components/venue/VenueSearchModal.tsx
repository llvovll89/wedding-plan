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

interface VenueSearchModalProps {
    onSelect: (venue: Venue) => void;
    onClose: () => void;
}

const API_KEY = import.meta.env.VITE_KAKAO_API_KEY as string | undefined;

function toVenue(place: KakaoPlace): Venue {
    const address = place.road_address_name || place.address_name;
    const regionWord = address.trim().split(/\s+/)[0] ?? "";
    const REGION_MAP: Record<string, string> = {
        서울특별시: "서울", 부산광역시: "부산", 대구광역시: "대구",
        인천광역시: "인천", 광주광역시: "광주", 대전광역시: "대전",
        울산광역시: "울산", 세종특별자치시: "세종",
        경기도: "경기", 강원도: "강원", 강원특별자치도: "강원",
        충청북도: "충북", 충청남도: "충남",
        전라북도: "전북", 전북특별자치도: "전북", 전라남도: "전남",
        경상북도: "경북", 경상남도: "경남", 제주특별자치도: "제주",
    };
    return {
        name: place.place_name,
        address,
        phone: place.phone,
        region: REGION_MAP[regionWord] ?? regionWord,
    };
}

export function VenueSearchModal({ onSelect, onClose }: VenueSearchModalProps) {
    const [query, setQuery] = useState("예식장");
    const [results, setResults] = useState<KakaoPlace[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const search = useCallback(async (q: string) => {
        if (!q.trim() || q.trim().length < 2) { setResults([]); return; }
        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}&size=15`,
                { headers: { Authorization: `KakaoAK ${API_KEY}` } },
            );
            if (!res.ok) throw new Error(`${res.status}`);
            const data = await res.json() as { documents: KakaoPlace[] };
            setResults(data.documents ?? []);
        } catch {
            setError("검색 중 오류가 발생했어요. API 키를 확인해 주세요.");
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { void search(query); }, 500);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query, search]);

    // API 키 미설정
    if (!API_KEY) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
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
                        <ol className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                            <li className="flex gap-2.5">
                                <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300 text-xs font-bold">1</span>
                                <span><a href="https://developers.kakao.com" target="_blank" rel="noopener noreferrer" className="text-rose-500 underline underline-offset-2">developers.kakao.com</a> 접속 → 로그인 → 내 애플리케이션 → 애플리케이션 추가</span>
                            </li>
                            <li className="flex gap-2.5">
                                <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300 text-xs font-bold">2</span>
                                <span>앱 키 → <strong className="text-slate-700 dark:text-slate-300">REST API 키</strong> 복사</span>
                            </li>
                            <li className="flex gap-2.5">
                                <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300 text-xs font-bold">3</span>
                                <span><code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono text-xs text-slate-700 dark:text-slate-300">.env</code> 파일에 아래 줄 추가 후 서버 재시작</span>
                            </li>
                        </ol>
                        <div className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-mono text-emerald-400">
                            VITE_KAKAO_API_KEY=<span className="text-slate-400">여기에_REST_API_키_붙여넣기</span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full rounded-xl border border-slate-200 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
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
                    {error && (
                        <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{error}</p>
                    )}
                </div>

                {/* 결과 수 */}
                {results.length > 0 && (
                    <p className="px-5 pb-1 text-xs text-slate-400 dark:text-slate-500">
                        {results.length}개 검색됨 · 카카오맵 기준
                    </p>
                )}

                {/* 결과 목록 */}
                <div className="overflow-y-auto flex-1 px-3 pb-4">
                    {!loading && results.length === 0 && query.trim().length >= 2 && !error && (
                        <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                            검색 결과가 없어요
                        </div>
                    )}
                    {!loading && query.trim().length < 2 && (
                        <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                            검색어를 입력하세요
                        </div>
                    )}
                    {results.length > 0 && (
                        <ul className="space-y-1">
                            {results.map((place, i) => (
                                <li key={i}>
                                    <button
                                        type="button"
                                        onClick={() => { onSelect(toVenue(place)); onClose(); }}
                                        className="w-full rounded-xl px-4 py-3 text-left hover:bg-rose-50 active:bg-rose-100 transition-colors dark:hover:bg-rose-900/20"
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="min-w-0 flex-1">
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
                                                    {place.category_name && (
                                                        <p className="truncate text-xs text-slate-300 dark:text-slate-600">{place.category_name}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
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
