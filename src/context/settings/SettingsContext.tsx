import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Settings } from "../../types/settings";
import { loadSettings, saveSettings } from "../../utils/settingsStorage";

type SettingsContextValue = {
    settings: Settings;
    updateSettings: (patch: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>(() => loadSettings());

    useEffect(() => {
        saveSettings(settings);
    }, [settings]);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings,
            updateSettings: (patch) => setSettings((prev) => ({ ...prev, ...patch })),
        }),
        [settings],
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
    return ctx;
}
