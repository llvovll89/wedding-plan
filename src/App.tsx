import { Route, Routes } from "react-router-dom";
import { routesPath } from "./routes/route";
import { PlanProvider } from "./context/plan/PlanContext";
import { AuthProvider } from "./context/auth/AuthContext";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
import { PLAN } from "./routes/route";

function App() {
  return (
    <AuthProvider>
      <PlanProvider>
        <Routes>
          {routesPath.map((r) => {
            const el = <r.component />;

            // ✅ /plan만 로그인 필요로 처리(원하면 route 정의에 protected 플래그로 확장 가능)
            if (r.path === PLAN) {
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
    </AuthProvider>
  );
}

export default App;
