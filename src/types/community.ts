import type { PlanCategory } from "./plan";

export interface CommunityPost {
    id: string;
    authorId: string;
    authorName: string;
    authorPhotoURL: string | null;

    title: string;
    content: string;

    // 선택 정보
    weddingDate: string;   // YYYY-MM-DD or ""
    venue: string;         // 예식장 이름 or ""
    region: string;        // 지역 or ""
    totalCost: number;     // 0 = 미입력

    // 카테고리별 비용 (선택)
    costBreakdown: Partial<Record<PlanCategory, number>>;

    // 이미지 첨부 (최대 3장)
    imageUrls: string[];          // 다운로드 URL 목록
    imageStoragePaths: string[];  // 삭제용 Storage 경로 목록

    createdAt: string;     // ISO
}

export type CreatePostInput = Omit<CommunityPost, "id" | "authorId" | "authorName" | "authorPhotoURL" | "createdAt">;
