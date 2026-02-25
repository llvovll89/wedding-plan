import type { ChecklistItem } from "../types/checklist";

let _id = 1;
function id() {
    return `default_${_id++}`;
}

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
    // ── D-12개월+ ──────────────────────────────────────────
    { id: id(), timing: "D-12개월+", category: "예식장", task: "예식장 투어 및 계약", checked: false },
    { id: id(), timing: "D-12개월+", category: "예산", task: "총 결혼 예산 확정", checked: false },
    { id: id(), timing: "D-12개월+", category: "날짜", task: "결혼 날짜 확정", checked: false },
    { id: id(), timing: "D-12개월+", category: "하객", task: "양가 초청 인원 협의", checked: false },

    // ── D-6~12개월 ─────────────────────────────────────────
    { id: id(), timing: "D-6~12개월", category: "스드메", task: "스튜디오 촬영 업체 선정 및 계약", checked: false },
    { id: id(), timing: "D-6~12개월", category: "스드메", task: "드레스샵 선정 및 계약", checked: false },
    { id: id(), timing: "D-6~12개월", category: "스드메", task: "메이크업샵 선정 및 계약", checked: false },
    { id: id(), timing: "D-6~12개월", category: "신혼여행", task: "신혼여행지 결정 및 항공 예약", checked: false },
    { id: id(), timing: "D-6~12개월", category: "신혼여행", task: "신혼여행 숙소 예약", checked: false },
    { id: id(), timing: "D-6~12개월", category: "청첩장", task: "청첩장 문구 초안 작성", checked: false },

    // ── D-3~6개월 ──────────────────────────────────────────
    { id: id(), timing: "D-3~6개월", category: "스냅", task: "웨딩 스냅 촬영 업체 계약", checked: false },
    { id: id(), timing: "D-3~6개월", category: "사회자", task: "사회자·축가 섭외", checked: false },
    { id: id(), timing: "D-3~6개월", category: "예물", task: "예물(반지·시계 등) 구입", checked: false },
    { id: id(), timing: "D-3~6개월", category: "한복", task: "한복 맞춤 또는 대여 예약", checked: false },
    { id: id(), timing: "D-3~6개월", category: "신혼집", task: "신혼집 계약 완료", checked: false },
    { id: id(), timing: "D-3~6개월", category: "청첩장", task: "청첩장 인쇄 및 발송", checked: false },
    { id: id(), timing: "D-3~6개월", category: "예단", task: "예단·예물 리스트 협의", checked: false },

    // ── D-1~3개월 ──────────────────────────────────────────
    { id: id(), timing: "D-1~3개월", category: "드레스", task: "드레스 가봉(1차)", checked: false },
    { id: id(), timing: "D-1~3개월", category: "부케", task: "부케·장식 꽃 업체 계약", checked: false },
    { id: id(), timing: "D-1~3개월", category: "예식장", task: "식순·음악 예식장과 협의", checked: false },
    { id: id(), timing: "D-1~3개월", category: "하객", task: "모바일 청첩장 발송", checked: false },
    { id: id(), timing: "D-1~3개월", category: "신혼여행", task: "신혼여행 짐 목록 작성", checked: false },
    { id: id(), timing: "D-1~3개월", category: "신혼집", task: "신혼집 가구·가전 구매", checked: false },
    { id: id(), timing: "D-1~3개월", category: "피로연", task: "피로연 장소 및 메뉴 확정", checked: false },

    // ── D-1개월 ────────────────────────────────────────────
    { id: id(), timing: "D-1개월", category: "드레스", task: "드레스 가봉(최종)", checked: false },
    { id: id(), timing: "D-1개월", category: "스드메", task: "스드메 최종 리허설 일정 확인", checked: false },
    { id: id(), timing: "D-1개월", category: "예식장", task: "예식 리허설 참석", checked: false },
    { id: id(), timing: "D-1개월", category: "하객", task: "하객 답례품 준비", checked: false },
    { id: id(), timing: "D-1개월", category: "혼수", task: "혼수 이사 준비", checked: false },
    { id: id(), timing: "D-1개월", category: "잔금", task: "각 업체 잔금 납부 일정 확인", checked: false },
    { id: id(), timing: "D-1개월", category: "신혼여행", task: "여권·비자 유효기간 확인", checked: false },

    // ── D-2주 ──────────────────────────────────────────────
    { id: id(), timing: "D-2주", category: "잔금", task: "예식장 잔금 납부", checked: false },
    { id: id(), timing: "D-2주", category: "잔금", task: "스드메 잔금 납부", checked: false },
    { id: id(), timing: "D-2주", category: "준비물", task: "식장 당일 가져갈 물품 챙기기", checked: false },
    { id: id(), timing: "D-2주", category: "혼인신고", task: "혼인신고 서류 준비", checked: false },
    { id: id(), timing: "D-2주", category: "신혼여행", task: "신혼여행 환전/여행자보험 가입", checked: false },
    { id: id(), timing: "D-2주", category: "하객", task: "당일 혼주 측 역할 최종 배분", checked: false },

    // ── D-Day ──────────────────────────────────────────────
    { id: id(), timing: "D-Day", category: "준비물", task: "혼인신고서·도장 지참", checked: false },
    { id: id(), timing: "D-Day", category: "준비물", task: "신부 드레스·소품 최종 확인", checked: false },
    { id: id(), timing: "D-Day", category: "준비물", task: "신랑 예복·소품 최종 확인", checked: false },
    { id: id(), timing: "D-Day", category: "당일", task: "메이크업실 도착 (예정 시간보다 30분 일찍)", checked: false },
    { id: id(), timing: "D-Day", category: "당일", task: "신혼여행 짐 미리 이동", checked: false },
    { id: id(), timing: "D-Day", category: "당일", task: "사회자·스냅 기사 최종 연락", checked: false },
    { id: id(), timing: "D-Day", category: "당일", task: "혼인신고 제출", checked: false },
];
