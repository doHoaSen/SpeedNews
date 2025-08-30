// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ColdStartGate from "./components/ColdStartGate";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ColdStartGate>
      {(initItems) => <App initialItems={initItems} />}
    </ColdStartGate>
  </React.StrictMode>
);
