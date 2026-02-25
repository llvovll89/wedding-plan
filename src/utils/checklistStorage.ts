import type { ChecklistItem } from "../types/checklist";
import { DEFAULT_CHECKLIST } from "../data/checklist";

const KEY = "wedding_checklist";

export function loadChecklist(): ChecklistItem[] {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_CHECKLIST.map((item) => ({ ...item }));
    try {
        return JSON.parse(raw) as ChecklistItem[];
    } catch {
        return DEFAULT_CHECKLIST.map((item) => ({ ...item }));
    }
}

export function saveChecklist(items: ChecklistItem[]): void {
    localStorage.setItem(KEY, JSON.stringify(items));
}
