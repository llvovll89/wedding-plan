import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { format, parseISO, isValid } from "date-fns";
import { ko } from "date-fns/locale";

interface DatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const DAY_PICKER_CLASS = {
    root: "w-[272px]",
    months: "flex flex-col",
    month: "w-full",
    month_caption: "flex items-center justify-between pb-3 px-1",
    caption_label: "text-sm font-semibold text-slate-800 dark:text-slate-200",
    nav: "flex items-center gap-1",
    button_previous: [
        "flex h-7 w-7 items-center justify-center rounded-lg",
        "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
        "transition-colors outline-none",
        "dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200",
    ].join(" "),
    button_next: [
        "flex h-7 w-7 items-center justify-center rounded-lg",
        "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
        "transition-colors outline-none",
        "dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200",
    ].join(" "),
    month_grid: "w-full",
    weekdays: "flex mb-1",
    weekday: "flex-1 text-center text-xs font-medium text-slate-400 dark:text-slate-500 py-1.5",
    week: "flex mt-0.5",
    day: "flex-1 flex items-center justify-center p-0.5",
    day_button: [
        "w-9 h-9 flex items-center justify-center",
        "rounded-lg text-sm text-slate-700",
        "hover:bg-rose-50 hover:text-rose-600",
        "transition-colors outline-none",
        "dark:text-slate-300 dark:hover:bg-rose-900/20 dark:hover:text-rose-300",
    ].join(" "),
    selected: "",
    today: "",
    outside: "opacity-30",
    disabled: "opacity-20 pointer-events-none",
    hidden: "invisible",
    range_start: "",
    range_end: "",
    range_middle: "",
} as const;

const DAY_PICKER_MODIFIERS = {
    selected: "!bg-rose-500 !text-white hover:!bg-rose-600 hover:!text-white dark:hover:!bg-rose-600",
    today: "!font-semibold !text-rose-500 dark:!text-rose-400",
} as const;

export function DatePicker({
    value,
    onChange,
    placeholder = "날짜를 선택해주세요",
    className = "",
}: DatePickerProps) {
    const [open, setOpen] = useState(false);

    const parsed = value ? parseISO(value) : undefined;
    const selectedDate = parsed && isValid(parsed) ? parsed : undefined;

    const displayText = selectedDate
        ? format(selectedDate, "yyyy년 M월 d일 (eee)", { locale: ko })
        : placeholder;

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    type="button"
                    className={[
                        "flex w-full items-center gap-2.5",
                        "rounded-xl border border-slate-200 bg-white px-3.5 py-2.5",
                        "text-left text-sm outline-none",
                        "transition-all hover:border-slate-300",
                        "focus:border-rose-300 focus:ring-2 focus:ring-rose-100",
                        "data-[state=open]:border-rose-300 data-[state=open]:ring-2 data-[state=open]:ring-rose-100",
                        "dark:border-slate-600 dark:bg-slate-800",
                        "dark:hover:border-slate-500",
                        "dark:data-[state=open]:border-rose-400/50 dark:data-[state=open]:ring-rose-400/10",
                        className,
                    ].join(" ")}
                >
                    <svg
                        className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"
                        viewBox="0 0 16 16"
                        fill="none"
                    >
                        <rect
                            x="2" y="3" width="12" height="11" rx="2"
                            stroke="currentColor" strokeWidth="1.3"
                        />
                        <path
                            d="M5 1.5V4M11 1.5V4M2 7h12"
                            stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"
                        />
                    </svg>
                    <span
                        className={[
                            "flex-1",
                            selectedDate
                                ? "text-slate-800 dark:text-slate-200"
                                : "text-slate-400 dark:text-slate-500",
                        ].join(" ")}
                    >
                        {displayText}
                    </span>
                    {selectedDate && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange("");
                            }}
                            className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors dark:text-slate-600 dark:hover:text-slate-400"
                        >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
                                <path
                                    d="M4 4l8 8M12 4l-8 8"
                                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    )}
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    align="start"
                    sideOffset={6}
                    className={[
                        "z-50 w-auto rounded-2xl p-4 outline-none",
                        "border border-slate-200/80 bg-white",
                        "shadow-xl shadow-slate-900/10",
                        "data-[state=open]:animate-select-in data-[state=closed]:animate-select-out",
                        "dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/30",
                    ].join(" ")}
                >
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            if (date) {
                                onChange(format(date, "yyyy-MM-dd"));
                                setOpen(false);
                            }
                        }}
                        locale={ko}
                        showOutsideDays
                        classNames={DAY_PICKER_CLASS}
                        modifiersClassNames={DAY_PICKER_MODIFIERS}
                    />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
