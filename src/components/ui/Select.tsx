import * as RadixSelect from "@radix-ui/react-select";

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
}

// Radix UI는 빈 문자열 value를 허용하지 않으므로 내부적으로 치환
const EMPTY_VALUE = "__none__";

export function Select({
    value,
    onValueChange,
    options,
    placeholder = "선택",
    className = "",
}: SelectProps) {
    return (
        <RadixSelect.Root
            value={value === "" ? undefined : value}
            onValueChange={(v) => onValueChange(v === EMPTY_VALUE ? "" : v)}
        >
            <RadixSelect.Trigger
                className={[
                    "group flex w-full items-center justify-between gap-2",
                    "rounded-xl border border-slate-200 bg-white px-3.5 py-2.5",
                    "text-base sm:text-sm text-slate-800 outline-none",
                    "transition-all hover:border-slate-300",
                    "focus:border-rose-300 focus:ring-2 focus:ring-rose-100",
                    "data-[state=open]:border-rose-300 data-[state=open]:ring-2 data-[state=open]:ring-rose-100",
                    "dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200",
                    "dark:hover:border-slate-500",
                    "dark:data-[state=open]:border-rose-400/50 dark:data-[state=open]:ring-rose-400/10",
                    className,
                ].join(" ")}
            >
                <RadixSelect.Value placeholder={placeholder} />
                <RadixSelect.Icon asChild>
                    <svg
                        className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180 dark:text-slate-500"
                        viewBox="0 0 16 16"
                        fill="none"
                    >
                        <path
                            d="M4 6l4 4 4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </RadixSelect.Icon>
            </RadixSelect.Trigger>

            <RadixSelect.Portal>
                <RadixSelect.Content
                    position="popper"
                    sideOffset={6}
                    className={[
                        "z-50 min-w-[var(--radix-select-trigger-width)]",
                        "max-h-[min(280px,var(--radix-select-content-available-height))]",
                        "overflow-hidden",
                        "rounded-2xl border border-slate-200/80 bg-white",
                        "shadow-xl shadow-slate-900/10",
                        "data-[state=open]:animate-select-in data-[state=closed]:animate-select-out",
                        "dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/30",
                    ].join(" ")}
                >
                    <RadixSelect.Viewport className="scrolls overflow-y-auto p-1.5">
                        {options.map((option) => (
                            <RadixSelect.Item
                                key={option.value || EMPTY_VALUE}
                                value={option.value === "" ? EMPTY_VALUE : option.value}
                                className={[
                                    "relative flex cursor-pointer select-none items-center",
                                    "rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none",
                                    "transition-colors",
                                    "text-slate-700",
                                    "data-[highlighted]:bg-rose-50 data-[highlighted]:text-rose-700",
                                    "data-[state=checked]:font-medium data-[state=checked]:text-rose-600",
                                    "dark:text-slate-300",
                                    "dark:data-[highlighted]:bg-rose-900/20 dark:data-[highlighted]:text-rose-300",
                                    "dark:data-[state=checked]:text-rose-400",
                                ].join(" ")}
                            >
                                <span className="absolute left-3 flex h-4 w-4 items-center justify-center text-rose-500 dark:text-rose-400">
                                    <RadixSelect.ItemIndicator>
                                        <svg
                                            className="h-3.5 w-3.5"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                        >
                                            <path
                                                d="M3 8l4 4 6-6"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </RadixSelect.ItemIndicator>
                                </span>
                                <RadixSelect.ItemText>
                                    {option.label}
                                </RadixSelect.ItemText>
                            </RadixSelect.Item>
                        ))}
                    </RadixSelect.Viewport>
                </RadixSelect.Content>
            </RadixSelect.Portal>
        </RadixSelect.Root>
    );
}
