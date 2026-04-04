import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { SessionDiagnosisProvider } from "@/context/SessionDiagnosisContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SessionDiagnosisProvider>
      <App />
    </SessionDiagnosisProvider>
  </StrictMode>,
);
