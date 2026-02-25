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
import { db } from "./firebase";
import type { CommunityPost, CreatePostInput } from "../types/community";
import type { User } from "firebase/auth";

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

export async function deletePost(postId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, postId));
}
