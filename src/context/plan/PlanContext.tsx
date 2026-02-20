import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { PlanCategory, PlanItem, PlanState } from "../../types/plan";
import { loadPlanState, savePlanState } from "../../utils/planStorage";

type Action =
    | { type: "ADD_ITEM"; item: PlanItem }
    | { type: "UPDATE_ITEM"; id: string; patch: Partial<PlanItem> }
    | { type: "REMOVE_ITEM"; id: string }
    | { type: "REPLACE_STATE"; state: PlanState };

function reducer(state: PlanState, action: Action): PlanState {
    switch (action.type) {
        case "REPLACE_STATE":
            return action.state;

        case "ADD_ITEM":
            return { ...state, items: [action.item, ...state.items] };

        case "UPDATE_ITEM":
            return {
                ...state,
                items: state.items.map((it) =>
                    it.id === action.id
                        ? { ...it, ...action.patch, updatedAt: new Date().toISOString() }
                        : it,
                ),
            };

        case "REMOVE_ITEM":
            return { ...state, items: state.items.filter((it) => it.id !== action.id) };

        default:
            return state;
    }
}

function sumPayment(it: PlanItem): number {
    return (it.payment.deposit ?? 0) + (it.payment.balance ?? 0);
}

function totalsByCategory(items: PlanItem) {
    // (오타 방지용으로 아래 selector에서만 사용)
    return items;
}

type PlanSelectors = {
    total: number;
    byCategory: Record<PlanCategory, number>;
};

type PlanContextValue = {
    state: PlanState;
    addItem: (input: Omit<PlanItem, "id" | "createdAt" | "updatedAt">) => void;
    updateItem: (id: string, patch: Partial<PlanItem>) => void;
    removeItem: (id: string) => void;
    clearAll: () => void; // ✅ 추가
    selectors: PlanSelectors;
};

const PlanContext = createContext<PlanContextValue | null>(null);

function createId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const ALL_CATEGORIES: PlanCategory[] = [
    "sdeume",
    "venue",
    "studio",
    "snapshot",
    "mc",
    "honeymoon",
    "etc",
];

export function PlanProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, undefined, () => loadPlanState());

    useEffect(() => {
        savePlanState(state);
    }, [state]);

    const selectors = useMemo<PlanSelectors>(() => {
        const byCategory = Object.fromEntries(ALL_CATEGORIES.map((c) => [c, 0])) as Record<
            PlanCategory,
            number
        >;

        for (const it of state.items) {
            byCategory[it.category] = (byCategory[it.category] ?? 0) + sumPayment(it);
        }

        const total = Object.values(byCategory).reduce((a, b) => a + b, 0);
        return { total, byCategory };
    }, [state.items]);

    const value = useMemo<PlanContextValue>(
        () => ({
            state,
            selectors,
            addItem: (input) => {
                const now = new Date().toISOString();
                dispatch({
                    type: "ADD_ITEM",
                    item: {
                        ...input,
                        id: createId(),
                        createdAt: now,
                        updatedAt: now,
                    },
                });
            },
            updateItem: (id, patch) => dispatch({ type: "UPDATE_ITEM", id, patch }),
            removeItem: (id) => dispatch({ type: "REMOVE_ITEM", id }),
            clearAll: () => dispatch({ type: "REPLACE_STATE", state: { items: [] } }), // ✅ 추가
        }),
        [state, selectors],
    );

    return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
    const ctx = useContext(PlanContext);
    if (!ctx) throw new Error("usePlan must be used within PlanProvider");
    return ctx;
}