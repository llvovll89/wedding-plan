import { Route, Routes } from "react-router-dom";
import { routesPath } from "./routes/route";
import { PlanProvider } from "./context/plan/PlanContext";
import { AuthProvider } from "./context/auth/AuthContext";
import { SettingsProvider } from "./context/settings/SettingsContext";
import { ThemeProvider } from "./context/theme/ThemeContext";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
import { PLAN, SETTINGS, CHECKLIST } from "./routes/route";
import { SharedPlan } from "./pages/shared/SharedPlan";

const PROTECTED_PATHS: string[] = [PLAN, SETTINGS, CHECKLIST]; // Community는 읽기는 공개

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <SettingsProvider>
        <PlanProvider>
          <Routes>
            {routesPath.map((r) => {
              const el = <r.component />;

              if (PROTECTED_PATHS.includes(r.path)) {
                return (
                  <Route
                    key={r.path}
                    path={r.path}
                    element={<ProtectedRoute>{el}</ProtectedRoute>}
                  />
                );
              }

              return <Route key={r.path} path={r.path} element={el} />;
            })}
            {/* 공유 플랜 공개 페이지 (인증 불필요) */}
            <Route path="/shared/:shareId" element={<SharedPlan />} />
          </Routes>
        </PlanProvider>
      </SettingsProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
