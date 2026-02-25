import { Route, Routes } from "react-router-dom";
import { routesPath } from "./routes/route";
import { PlanProvider } from "./context/plan/PlanContext";
import { AuthProvider } from "./context/auth/AuthContext";
import { SettingsProvider } from "./context/settings/SettingsContext";
import { ThemeProvider } from "./context/theme/ThemeContext";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
import { PLAN, SETTINGS, CHECKLIST } from "./routes/route";

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
          </Routes>
        </PlanProvider>
      </SettingsProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
