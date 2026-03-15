import type { GiftEntry } from "../types/giftLedger";

const KEY = "wedding-plan:gift-ledger:v1";

export function loadGiftEntries(): GiftEntry[] {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as GiftEntry[];
    } catch {
        return [];
    }
}

export function saveGiftEntries(entries: GiftEntry[]): void {
    localStorage.setItem(KEY, JSON.stringify(entries));
}
