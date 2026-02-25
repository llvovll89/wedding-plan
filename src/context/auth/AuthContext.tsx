import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../firebase/firebase";

type AuthValue = {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            // 이메일 미인증 유저는 로그인 상태로 취급하지 않음 (Google은 emailVerified=true)
            setUser(u && u.emailVerified ? u : null);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const value = useMemo<AuthValue>(
        () => ({
            user,
            loading,
            signInWithGoogle: async () => {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
            },
            signInWithEmail: async (email: string, password: string) => {
                const credential = await signInWithEmailAndPassword(auth, email, password);
                if (!credential.user.emailVerified) {
                    await signOut(auth);
                    throw { code: "auth/email-not-verified" };
                }
            },
            signUpWithEmail: async (email: string, password: string) => {
                const credential = await createUserWithEmailAndPassword(auth, email, password);
                await sendEmailVerification(credential.user);
                await signOut(auth);
            },
            logout: async () => {
                await signOut(auth);
            },
        }),
        [user, loading],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}