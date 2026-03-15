import type { GuestEntry } from "../types/guest";

const KEY = "wedding-plan:guest-list:v1";

export function loadGuests(): GuestEntry[] {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as GuestEntry[];
    } catch {
        return [];
    }
}

export function saveGuests(entries: GuestEntry[]): void {
    localStorage.setItem(KEY, JSON.stringify(entries));
}
