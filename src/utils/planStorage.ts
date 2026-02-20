import type { PlanState } from "../types/plan";

const KEY = "wedding-plan:v1";

export function loadPlanState(): PlanState {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return { items: [] };
        const parsed = JSON.parse(raw) as PlanState;
        return { items: Array.isArray(parsed.items) ? parsed.items : [] };
    } catch {
        return { items: [] };
    }
}

export function savePlanState(state: PlanState) {
    localStorage.setItem(KEY, JSON.stringify(state));
}