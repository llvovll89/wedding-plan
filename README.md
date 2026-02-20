# 💍 Wedding Plan

내가 직접 입력하는 웨딩 플랜 관리 서비스.
흩어진 견적서·메모·예약금을 한 곳에 정리하고, 예산과 일정을 한눈에 확인합니다.

---

## 주요 기능

- **로그인** — Google 소셜 로그인 / 이메일·비밀번호 회원가입 및 로그인 (Firebase Auth)
- **플랜 관리** — 업체·견적 카드 추가·삭제, 카테고리·상태·예약금·잔금 입력
- **예산 합계** — 전체 합계 및 카테고리별 자동 계산
- **예시 데이터** — 로그인 없이도 플랜 화면을 미리 확인
- **모달 네비게이션** — 기능·사용법·무드를 모달로 소개
- **Protected Route** — 미로그인 상태에서 플랜 페이지 접근 시 로그인 페이지로 리다이렉트

---

## 기술 스택

| 분류 | 사용 기술 |
|---|---|
| 프레임워크 | React 19 + TypeScript |
| 빌드 도구 | Vite |
| 스타일 | Tailwind CSS v4 |
| 라우팅 | React Router v7 |
| 인증·DB | Firebase Authentication + Firestore |

---

## 디렉토리 구조

```
src/
├── components/
│   ├── auth/
│   │   └── UserMenu.tsx        # 아바타 드롭다운 (유저 정보 + 로그아웃)
│   ├── main/
│   │   ├── SampleDataModal.tsx # 예시 데이터 모달
│   │   └── NavSectionModal.tsx # 기능·사용법·무드 모달
│   └── routing/
│       └── ProtectedRoute.tsx  # 인증 보호 라우트
├── context/
│   ├── auth/
│   │   └── AuthContext.tsx     # Google·이메일 로그인, 로그아웃
│   └── plan/
│       └── PlanContext.tsx     # 플랜 상태 관리 (useReducer)
├── firebase/
│   └── firebase.ts             # Firebase 초기화 (auth, db)
├── pages/
│   ├── auth/Login.tsx          # 로그인·회원가입 페이지
│   ├── main/Main.tsx           # 랜딩 페이지
│   ├── plan/Plan.tsx           # 플랜 관리 페이지
│   └── notfound/NotFound.tsx
├── routes/
│   └── route.ts                # 경로 상수 및 라우트 목록
├── types/
│   └── plan.ts                 # PlanItem, PlanState 타입 정의
└── utils/
    └── planStorage.ts          # 플랜 로컬 저장소 유틸
```

---

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 Firebase 프로젝트 정보를 입력합니다.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

> Firebase Console → 프로젝트 설정 → 웹 앱에서 확인할 수 있습니다.

### 3. Firebase 설정

Firebase Console → Authentication → Sign-in method 에서 아래 두 제공업체를 활성화합니다.

- **Google**
- **이메일/비밀번호**

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. 빌드

```bash
npm run build
```

---

## 환경 변수

| 키 | 설명 |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API 키 |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase 인증 도메인 |
| `VITE_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage 버킷 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase 메시징 발신자 ID |
| `VITE_FIREBASE_APP_ID` | Firebase 앱 ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Analytics 측정 ID |

---

## 라이선스

MIT
