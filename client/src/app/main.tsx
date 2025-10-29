import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import ColdStartGate from "../features/news/ui/ColdStartGate";
import { useAuth } from "../state/AuthState"; // ✅ 통일 (AuthContext ❌)
import "../app/styles/index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* ✅ 반드시 AuthProvider가 전체 앱을 감싸야 함 */}
    <useAuth>
      <BrowserRouter>
        <ColdStartGate>
          {(initItems) => <AppRoutes initialItems={initItems} />}
        </ColdStartGate>
      </BrowserRouter>
    </useAuth>
  </React.StrictMode>
);
