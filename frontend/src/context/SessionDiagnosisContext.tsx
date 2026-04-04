import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type DiagnosisHistoryItem = {
  id: string;
  prediction: string;
  confidence: number;
  at: number;
  fileName?: string;
};

type Ctx = {
  todayDiagnoses: number;
  diseasesFoundCount: number;
  history: DiagnosisHistoryItem[];
  avgConfidenceThisSession: number;
  recordDiagnosis: (payload: { prediction: string; confidence: number; fileName?: string }) => void;
};

const SessionDiagnosisContext = createContext<Ctx | null>(null);

export function SessionDiagnosisProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<DiagnosisHistoryItem[]>([]);

  const recordDiagnosis = useCallback(({ prediction, confidence, fileName }: { prediction: string; confidence: number; fileName?: string }) => {
    setHistory((h) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        prediction,
        confidence,
        at: Date.now(),
        fileName,
      },
      ...h,
    ]);
  }, []);

  const value = useMemo(() => {
    const todayDiagnoses = history.length;
    const diseaseSet = new Set(history.map((h) => h.prediction).filter((p) => p !== "Healthy"));
    const diseasesFoundCount = diseaseSet.size;
    const avgConfidenceThisSession =
      history.length > 0 ? history.reduce((s, h) => s + h.confidence, 0) / history.length : 0;
    return {
      todayDiagnoses,
      diseasesFoundCount,
      history,
      avgConfidenceThisSession,
      recordDiagnosis,
    };
  }, [history, recordDiagnosis]);

  return <SessionDiagnosisContext.Provider value={value}>{children}</SessionDiagnosisContext.Provider>;
}

export function useSessionDiagnosis() {
  const c = useContext(SessionDiagnosisContext);
  if (!c) throw new Error("useSessionDiagnosis outside provider");
  return c;
}
