import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/AuthContext";
import { LOGIN, SETTINGS } from "../../routes/route";

export function UserMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // 바깥 클릭 시 닫기
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (!user) return null;

    const displayName = user.displayName ?? user.email ?? "사용자";
    const email = user.email ?? "";
    const photoURL = user.photoURL;
    // 이니셜: 이름 첫 글자
    const initial = displayName.charAt(0).toUpperCase();

    const handleLogout = async () => {
        setOpen(false);
        await logout();
        navigate(LOGIN, { replace: true });
    };

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 pl-1 pr-3 py-1 text-sm text-slate-700 hover:bg-white transition-colors dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800"
            >
                {/* 아바타 */}
                {photoURL ? (
                    <img
                        src={photoURL}
                        alt={displayName}
                        className="h-7 w-7 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                        {initial}
                    </div>
                )}
                <span className="hidden sm:inline max-w-[90px] truncate font-medium">{displayName}</span>
                <svg
                    className={`h-3 w-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                    viewBox="0 0 12 12"
                    fill="none"
                >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {/* 드롭다운 */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-100 bg-white shadow-lg z-50 dark:border-slate-700 dark:bg-slate-800">
                    {/* 계정 정보 */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                        {photoURL ? (
                            <img
                                src={photoURL}
                                alt={displayName}
                                className="h-9 w-9 rounded-full object-cover shrink-0"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                                {initial}
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{displayName}</div>
                            {email && (
                                <div className="truncate text-xs text-slate-500 dark:text-slate-400">{email}</div>
                            )}
                        </div>
                    </div>

                    {/* 메뉴 */}
                    <div className="p-1.5 space-y-0.5">
                        <Link
                            to={SETTINGS}
                            onClick={() => setOpen(false)}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
                                <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                            내 설정
                        </Link>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors dark:text-rose-400 dark:hover:bg-rose-900/20"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                                <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            로그아웃
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
