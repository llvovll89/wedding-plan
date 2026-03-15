export type GiftSide = "groom" | "bride";

export interface GiftEntry {
    id: string;
    name: string;
    side: GiftSide;
    amount: number;
    relation?: string;
    note?: string;
    createdAt: string; // ISO
}
