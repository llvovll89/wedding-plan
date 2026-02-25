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

    estimatedCost?: Money; // 예상 비용 (초기 입력)
    actualCost?: Money;    // 실제 비용 (확정 후 업데이트)

    memo?: string;
    link?: string;

    createdAt: string; // ISO
    updatedAt: string; // ISO
}

export interface PlanState {
    items: PlanItem[];
}