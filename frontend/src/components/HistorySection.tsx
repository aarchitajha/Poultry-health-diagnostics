import { motion } from "framer-motion";
import { ClipboardList, Stethoscope } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSessionDiagnosis } from "@/context/SessionDiagnosisContext";

export function HistorySection() {
  const { history } = useSessionDiagnosis();

  if (history.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ClipboardList className="mb-4 h-14 w-14 text-slate-300" strokeWidth={1.25} />
        <p className="text-sm font-semibold text-slate-800">No diagnoses in history yet</p>
        <p className="mt-2 max-w-sm text-xs text-slate-500">
          Session history fills as you run analyses from Image analysis. Entries are kept until you refresh the page.
        </p>
      </motion.div>
    );
  }

  return (
    <Card className="border-slate-200/90 bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
          <CardTitle className="text-base font-semibold">Session history</CardTitle>
        </div>
        <CardDescription className="text-xs">Recent runs this browser session (not persisted).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {history.map((h) => (
          <div
            key={h.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm"
          >
            <span className="font-medium text-slate-900">{h.prediction}</span>
            <span className="tabular-nums text-slate-600">{h.confidence.toFixed(1)}%</span>
            <span className="text-xs text-slate-400">
              {new Date(h.at).toLocaleTimeString()}
              {h.fileName ? ` · ${h.fileName}` : ""}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
