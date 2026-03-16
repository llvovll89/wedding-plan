export interface InvitationConfig {
  // settings에서 연동 (저장 시 함께 기록)
  groomName: string;
  brideName: string;
  weddingDate: string; // YYYY-MM-DD

  // 예식 시간
  weddingTime: string; // "HH:mm"

  // 예식장 정보
  venueName: string;
  hallName: string;
  address: string;

  // 가족 정보
  groomFatherName: string;
  groomMotherName: string;
  groomPhone: string;
  brideFatherName: string;
  brideMotherName: string;
  bridePhone: string;

  // 교통 정보
  subway: string;
  bus: string;
  parking: string;

  // 계좌 정보
  groomBank: string;
  groomAccount: string;
  brideBank: string;
  brideAccount: string;

  // 청첩장 설정
  templateId: '1' | '2' | '3';

  // 메타
  updatedAt?: string;
}

export const DEFAULT_INVITATION_CONFIG: InvitationConfig = {
  groomName: '',
  brideName: '',
  weddingDate: '',
  weddingTime: '14:00',
  venueName: '',
  hallName: '',
  address: '',
  groomFatherName: '',
  groomMotherName: '',
  groomPhone: '',
  brideFatherName: '',
  brideMotherName: '',
  bridePhone: '',
  subway: '',
  bus: '',
  parking: '',
  groomBank: '',
  groomAccount: '',
  brideBank: '',
  brideAccount: '',
  templateId: '1',
};
