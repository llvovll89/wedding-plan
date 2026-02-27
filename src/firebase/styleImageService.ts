import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp,
    type Timestamp,
} from "firebase/firestore";
import { storage, db } from "./firebase";

export type StyleCategory = "dress" | "tuxedo" | "bouquet" | "hair" | "accessories" | "etc";

export const STYLE_CATEGORY_LABEL: Record<StyleCategory, string> = {
    dress: "드레스",
    tuxedo: "턱시도",
    bouquet: "부케",
    hair: "헤어·메이크업",
    accessories: "소품·액세서리",
    etc: "기타",
};

export const STYLE_CATEGORIES = Object.keys(STYLE_CATEGORY_LABEL) as StyleCategory[];

export interface StyleImage {
    id: string;
    name: string;
    url: string;
    storagePath: string;
    category: StyleCategory;
    createdAt: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function validateStyleImageFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) return "JPG, PNG, WEBP, GIF 형식만 업로드할 수 있습니다.";
    if (file.size > MAX_FILE_SIZE) return "파일 크기는 5MB 이하여야 합니다.";
    return null;
}

export async function uploadStyleImage(
    uid: string,
    file: File,
    category: StyleCategory,
): Promise<StyleImage> {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `users/${uid}/style/${category}/${timestamp}_${safeName}`;

    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const docRef = await addDoc(collection(db, "users", uid, "styleImages"), {
        name: file.name,
        url,
        storagePath,
        category,
        createdAt: serverTimestamp(),
    });

    return {
        id: docRef.id,
        name: file.name,
        url,
        storagePath,
        category,
        createdAt: new Date().toISOString(),
    };
}

export async function loadStyleImages(uid: string): Promise<StyleImage[]> {
    const q = query(
        collection(db, "users", uid, "styleImages"),
        orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
        const data = d.data();
        const ts = data.createdAt as Timestamp | null;
        return {
            id: d.id,
            name: (data.name as string) ?? "",
            url: (data.url as string) ?? "",
            storagePath: (data.storagePath as string) ?? "",
            category: (data.category as StyleCategory) ?? "etc",
            createdAt: ts ? ts.toDate().toISOString() : new Date().toISOString(),
        };
    });
}

export async function deleteStyleImage(
    uid: string,
    imageId: string,
    storagePath: string,
): Promise<void> {
    await deleteDoc(doc(db, "users", uid, "styleImages", imageId));
    try {
        await deleteObject(ref(storage, storagePath));
    } catch {
        // storage 파일이 없어도 Firestore는 이미 삭제됨
    }
}
