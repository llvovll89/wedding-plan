import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/auth/AuthContext";
import { LOGIN } from "../../routes/route";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) return null; // 필요하면 스피너 UI로 교체
    if (!user) return <Navigate to={LOGIN} replace />;

    return <>{children}</>;
}