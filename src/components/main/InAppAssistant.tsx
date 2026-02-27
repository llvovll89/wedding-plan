import { useState, useEffect, useRef } from "react";
import type { NavSection } from "./NavSectionModal";

interface Props {
    onSelect: (section: NavSection) => void;
}

const ITEMS: { key: NavSection; label: string; icon: string }[] = [
    { key: "gallery", label: "무드", icon: "🌸" },
    { key: "how", label: "사용법", icon: "📖" },
    { key: "features", label: "기능", icon: "🗂️" },
];

export function InAppAssistant({ onSelect }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    return (
        <div ref={ref} className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
            {/* 메뉴 아이템 */}
            {open && (
                <div className="flex flex-col items-end gap-2 mb-1">
                    {ITEMS.map(({ key, label, icon }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => { onSelect(key); setOpen(false); }}
                            className="flex items-center gap-2.5 rounded-full bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-md hover:bg-slate-50 hover:shadow-lg transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <span>{icon}</span>
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* 메인 버튼 */}
            <button
                type="button"
                aria-label={open ? "닫기" : "도움말 열기"}
                onClick={() => setOpen((v) => !v)}
                className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all ${
                    open
                        ? "bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500"
                        : "bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500"
                } text-white`}
            >
                {open ? (
                    <svg className="h-5 w-5" viewBox="0 0 16 16" fill="none">
                        <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                ) : (
                    <svg className="h-5 w-5" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M6.5 6.2a1.5 1.5 0 0 1 3 0c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        <circle cx="8" cy="11.5" r="0.8" fill="currentColor" />
                    </svg>
                )}
            </button>
        </div>
    );
}
