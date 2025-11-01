import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import ColdStartGate from "../features/news/ui/ColdStartGate";
import "../app/styles/index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
      <BrowserRouter>
        <ColdStartGate>
          {(initItems) => <AppRoutes initialItems={initItems} />}
        </ColdStartGate>
      </BrowserRouter>
  </React.StrictMode>
);
