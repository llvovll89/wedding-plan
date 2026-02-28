import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    getDocs,
    updateDoc,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Inquiry, CreateInquiryInput, InquiryStatus } from "../types/inquiry";
import type { User } from "firebase/auth";

const COLLECTION = "inquiries";

function toInquiry(id: string, data: Record<string, unknown>): Inquiry {
    const createdTs = data.createdAt as Timestamp | null;
    const updatedTs = data.updatedAt as Timestamp | null;
    return {
        id,
        userId: (data.userId as string) ?? "",
        userEmail: (data.userEmail as string) ?? "",
        userName: (data.userName as string) ?? "익명",
        type: (data.type as Inquiry["type"]) ?? "other",
        title: (data.title as string) ?? "",
        content: (data.content as string) ?? "",
        status: (data.status as InquiryStatus) ?? "pending",
        createdAt: createdTs ? createdTs.toDate().toISOString() : new Date().toISOString(),
        updatedAt: updatedTs ? updatedTs.toDate().toISOString() : new Date().toISOString(),
    };
}

export async function createInquiry(user: User, input: CreateInquiryInput): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
        ...input,
        userId: user.uid,
        userEmail: user.email ?? "",
        userName: user.displayName ?? user.email ?? "익명",
        status: "pending" as InquiryStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function getUserInquiries(uid: string): Promise<Inquiry[]> {
    const q = query(
        collection(db, COLLECTION),
        where("userId", "==", uid),
        orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toInquiry(d.id, d.data() as Record<string, unknown>));
}

export async function getAllInquiries(): Promise<Inquiry[]> {
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => toInquiry(d.id, d.data() as Record<string, unknown>));
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
        status,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteInquiry(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
}
