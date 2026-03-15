import type { GiftSide } from "./giftLedger";

export type GuestAttendance = "attending" | "not_attending" | "unknown";

export interface GuestEntry {
    id: string;
    name: string;
    side: GiftSide;
    attendance: GuestAttendance;
    mealCount: number;     // 식사 수 (기본 1)
    phone?: string;
    relation?: string;
    note?: string;
    createdAt: string;     // ISO
}
