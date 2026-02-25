import type { Settings } from "../types/settings";
import { DEFAULT_SETTINGS } from "../types/settings";

const KEY = "wedding-plan:settings:v1";

export function loadSettings(): Settings {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return { ...DEFAULT_SETTINGS };
        return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

export function saveSettings(s: Settings) {
    localStorage.setItem(KEY, JSON.stringify(s));
}
