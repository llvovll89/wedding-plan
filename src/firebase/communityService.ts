import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";
import type { CommunityPost, CreatePostInput } from "../types/community";
import type { User } from "firebase/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function validateCommunityImage(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) return "JPG, PNG, WEBP, GIF 형식만 업로드할 수 있습니다.";
    if (file.size > MAX_FILE_SIZE) return "파일 크기는 5MB 이하여야 합니다.";
    return null;
}

export async function uploadCommunityImages(
    uid: string,
    files: File[],
): Promise<{ urls: string[]; paths: string[] }> {
    const urls: string[] = [];
    const paths: string[] = [];
    for (const file of files) {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const storagePath = `community/${uid}/${timestamp}_${safeName}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
        paths.push(storagePath);
    }
    return { urls, paths };
}

const COLLECTION = "communityPosts";

function toPost(id: string, data: Record<string, unknown>): CommunityPost {
    const ts = data.createdAt as Timestamp | null;
    return {
        id,
        authorId: (data.authorId as string) ?? "",
        authorName: (data.authorName as string) ?? "익명",
        authorPhotoURL: (data.authorPhotoURL as string | null) ?? null,
        title: (data.title as string) ?? "",
        content: (data.content as string) ?? "",
        weddingDate: (data.weddingDate as string) ?? "",
        venue: (data.venue as string) ?? "",
        region: (data.region as string) ?? "",
        totalCost: (data.totalCost as number) ?? 0,
        costBreakdown: (data.costBreakdown as CommunityPost["costBreakdown"]) ?? {},
        imageUrls: (data.imageUrls as string[]) ?? [],
        imageStoragePaths: (data.imageStoragePaths as string[]) ?? [],
        createdAt: ts ? ts.toDate().toISOString() : new Date().toISOString(),
    };
}

export async function getPosts(count = 30): Promise<CommunityPost[]> {
    const q = query(
        collection(db, COLLECTION),
        orderBy("createdAt", "desc"),
        limit(count),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toPost(d.id, d.data() as Record<string, unknown>));
}

export async function createPost(user: User, input: CreatePostInput): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
        ...input,
        authorId: user.uid,
        authorName: user.displayName ?? user.email ?? "익명",
        authorPhotoURL: user.photoURL ?? null,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function deletePost(postId: string, storagePaths: string[] = []): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, postId));
    for (const path of storagePaths) {
        try {
            await deleteObject(ref(storage, path));
        } catch {
            // storage 파일이 없어도 Firestore는 이미 삭제됨
        }
    }
}
