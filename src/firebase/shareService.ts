import {
    collection,
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";
import type { PlanState } from "../types/plan";

export interface SharedPlanSettings {
    groomName: string;
    brideName: string;
    weddingDate: string;
    totalBudget: number;
}

export interface SharedPlanDoc {
    shareId: string;
    ownerId: string;
    ownerName: string;
    planData: PlanState;
    settings: SharedPlanSettings;
    createdAt: string;
}

function generateShareId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: 8 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join("");
}

/** 플랜 스냅샷을 Firestore에 저장하고 shareId를 반환합니다 */
export async function createShare(
    user: User,
    planData: PlanState,
    settings: SharedPlanSettings
): Promise<string> {
    const shareId = generateShareId();
    const ref = doc(collection(db, "sharedPlans"), shareId);
    await setDoc(ref, {
        shareId,
        ownerId: user.uid,
        ownerName: user.displayName || user.email || "사용자",
        planData,
        settings,
        createdAt: serverTimestamp(),
    });
    return shareId;
}

/** shareId로 공유된 플랜을 가져옵니다 */
export async function getShare(shareId: string): Promise<SharedPlanDoc | null> {
    const ref = doc(collection(db, "sharedPlans"), shareId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
        shareId: data.shareId,
        ownerId: data.ownerId,
        ownerName: data.ownerName,
        planData: data.planData,
        settings: data.settings,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    };
}
