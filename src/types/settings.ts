export interface Settings {
    // 예산
    totalBudget: number;       // 결혼 총 예산 (KRW), 0 = 미설정

    // 결혼 정보
    weddingDate: string;       // YYYY-MM-DD, "" = 미설정
    groomName: string;
    brideName: string;
    region: string;            // 예식 지역
    guestCount: number;        // 예상 하객 수, 0 = 미설정
}

export const DEFAULT_SETTINGS: Settings = {
    totalBudget: 0,
    weddingDate: "",
    groomName: "",
    brideName: "",
    region: "",
    guestCount: 0,
};

export const REGIONS = [
    "서울", "경기", "인천", "부산", "대구",
    "광주", "대전", "울산", "세종", "강원",
    "충북", "충남", "전북", "전남", "경북", "경남", "제주",
] as const;
