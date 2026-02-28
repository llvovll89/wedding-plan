import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/AuthContext";
import { MAIN } from "../../routes/route";

type Mode = "login" | "signup";

const FIREBASE_ERRORS: Record<string, string> = {
    "auth/user-not-found": "등록되지 않은 이메일입니다.",
    "auth/wrong-password": "비밀번호가 올바르지 않습니다.",
    "auth/invalid-credential": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "auth/email-already-in-use": "이미 사용 중인 이메일입니다.",
    "auth/weak-password": "비밀번호는 8자 이상이어야 합니다.",
    "auth/invalid-email": "올바른 이메일 형식이 아닙니다.",
    "auth/popup-closed-by-user": "로그인 창이 닫혔습니다. 다시 시도해주세요.",
    "auth/cancelled-popup-request": "로그인 요청이 취소됐습니다.",
    "auth/email-not-verified": "이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.",
};

function validatePassword(pw: string): string | null {
    if (pw.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
    if (!/[A-Z]/.test(pw)) return "대문자를 1자 이상 포함해야 합니다.";
    if (!/[a-z]/.test(pw)) return "소문자를 1자 이상 포함해야 합니다.";
    if (!/[0-9]/.test(pw)) return "숫자를 1자 이상 포함해야 합니다.";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) return "특수문자를 1자 이상 포함해야 합니다.";
    return null;
}

function parseError(err: unknown): string {
    if (err && typeof err === "object" && "code" in err) {
        return FIREBASE_ERRORS[(err as { code: string }).code] ?? "오류가 발생했습니다. 다시 시도해주세요.";
    }
    return "오류가 발생했습니다. 다시 시도해주세요.";
}

export const Login = () => {
    const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
    const navigate = useNavigate();

    // 이미 로그인된 상태면 메인으로 리다이렉트 (뒤로가기 방지)
    if (user) return <Navigate to={MAIN} replace />;

    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (mode === "signup") {
            const pwError = validatePassword(password);
            if (pwError) { setError(pwError); return; }
            if (password !== confirmPassword) { setError("비밀번호가 일치하지 않습니다."); return; }
        }
        setIsLoading(true);
        try {
            if (mode === "login") {
                await signInWithEmail(email, password);
                navigate(MAIN, { replace: true });
            } else {
                await signUpWithEmail(email, password);
                setVerificationSent(true);
            }
        } catch (err) {
            setError(parseError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setIsLoading(true);
        try {
            await signInWithGoogle();
            navigate(MAIN, { replace: true });
        } catch (err) {
            setError(parseError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode((prev) => (prev === "login" ? "signup" : "login"));
        setError("");
        setConfirmPassword("");
    };

    if (verificationSent) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
                <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-slate-100 text-center dark:bg-slate-800 dark:border-slate-700">
                    <div className="mb-4 flex justify-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl dark:bg-slate-700">
                            ✉️
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2 dark:text-slate-100">메일을 확인해주세요</h2>
                    <p className="text-sm text-slate-500 mb-1 dark:text-slate-400">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span> 으로
                    </p>
                    <p className="text-sm text-slate-500 mb-6 dark:text-slate-400">인증 메일을 보냈어요. 링크를 클릭하면 가입이 완료됩니다.</p>
                    <button
                        type="button"
                        onClick={() => { setVerificationSent(false); setMode("login"); setPassword(""); setError(""); }}
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                        로그인 하러 가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                {/* 메인으로 */}
                <Link
                    to={MAIN}
                    className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
                >
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                        <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    메인으로
                </Link>

                {/* 헤더 */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {mode === "login" ? "로그인" : "회원가입"}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {mode === "login"
                            ? "웨딩 플랜을 저장하고 불러오세요."
                            : "계정을 만들고 플랜을 시작하세요."}
                    </p>
                </div>

                {/* Google 로그인 */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    Google로 {mode === "login" ? "로그인" : "가입"}
                </button>

                {/* 구분선 */}
                <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                    <span className="text-xs text-slate-400 dark:text-slate-500">또는 이메일로</span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                </div>

                {/* 이메일/비밀번호 폼 */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-400">
                            이메일
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-slate-400 dark:focus:ring-slate-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-400">
                            비밀번호
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={mode === "signup" ? "8자 이상 입력해주세요" : "비밀번호 입력"}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-slate-400 dark:focus:ring-slate-400"
                        />
                        {mode === "signup" && (
                            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                                8자 이상 · 대소문자 · 숫자 · 특수문자 포함
                            </p>
                        )}
                    </div>

                    {mode === "signup" && (
                        <div>
                            <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-400">
                                비밀번호 확인
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="비밀번호를 다시 입력해주세요"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-slate-400 dark:focus:ring-slate-400"
                            />
                        </div>
                    )}

                    {/* 에러 메시지 */}
                    {error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                        {isLoading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
                    </button>
                </form>

                {/* 모드 전환 */}
                <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    {mode === "login" ? "아직 계정이 없으신가요?" : "이미 계정이 있으신가요?"}
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="ml-1 font-medium text-slate-900 underline underline-offset-2 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-100"
                    >
                        {mode === "login" ? "회원가입" : "로그인"}
                    </button>
                </p>
            </div>
        </div>
    );
};
