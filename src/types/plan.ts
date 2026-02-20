export type PlanStatus = "planned" | "in_progress" | "confirmed" | "paid";

export type PlanCategory =
    | "sdeume"
    | "venue"
    | "studio"
    | "snapshot"
    | "mc"
    | "honeymoon"
    | "etc";

export type Money = number; // KRW: 정수(원)로 저장 권장

export interface PlanItemPayment {
    deposit?: Money; // 예약금
    balance?: Money; // 잔금(또는 나머지)
}

export interface PlanItem {
    id: string;
    category: PlanCategory;
    name: string;
    status: PlanStatus;

    dueDate?: string; // YYYY-MM-DD (일정 연결용)
    payment: PlanItemPayment;

    memo?: string;
    link?: string;

    createdAt: string; // ISO
    updatedAt: string; // ISO
}

export interface PlanState {
    items: PlanItem[];
}