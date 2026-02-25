export type ChecklistTiming =
    | "D-12개월+"
    | "D-6~12개월"
    | "D-3~6개월"
    | "D-1~3개월"
    | "D-1개월"
    | "D-2주"
    | "D-Day";

export interface ChecklistItem {
    id: string;
    timing: ChecklistTiming;
    category: string;
    task: string;
    checked: boolean;
}
