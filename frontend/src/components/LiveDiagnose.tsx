import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Bug,
  Camera,
  CheckCircle,
  Download,
  Eye,
  FileImage,
  Heart,
  Info,
  List,
  Loader2,
  Microscope,
  Pill,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Stethoscope,
  CloudUpload,
  Cpu,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { type DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSessionDiagnosis } from "@/context/SessionDiagnosisContext";
import { jsPDF } from "jspdf";
import { diseaseDetails, diseaseImages, normalizePrediction, type DiseaseKey } from "@/lib/diseaseKnowledge";

type PredictResponse = {
  prediction: string;
  confidence: number;
  all_probs: Record<string, number>;
  gradcam_b64: string;
  error?: string;
};

const CLASS_ICONS: Record<string, typeof Bug> = {
  Coccidiosis: Bug,
  Healthy: Heart,
  Newcastle: Zap,
  Salmonella: AlertTriangle,
};

const STEPS = [
  { key: "pre", label: "Preprocessing", Icon: Sparkles },
  { key: "neural", label: "Neural propagation", Icon: Cpu },
  { key: "model", label: "Pathogen classification", Icon: Microscope },
  { key: "cam", label: "Visual explanation", Icon: Eye },
] as const;

function ConfidenceRing({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const p = Math.min(100, Math.max(0, value)) / 100;
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg className="-rotate-90 transform" viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-teal-700"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - p) }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-semibold tabular-nums text-slate-900">{value.toFixed(0)}%</span>
        <span className="text-[10px] font-medium text-slate-500">confidence</span>
      </div>
    </div>
  );
}

function MortalityMeter({ level }: { level: DiseaseKey }) {
  const d = diseaseDetails[level];
  const stops = { low: 18, moderate: 45, high: 72, critical: 94 }[d.mortalityRisk];
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-700">Mortality risk (indicative)</p>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full bg-teal-700"
          initial={{ width: 0 }}
          whileInView={{ width: `${stops}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>Low</span>
        <span>Critical</span>
      </div>
    </div>
  );
}

function BulletList({ items, variant }: { items: string[]; variant: "ok" | "warn" }) {
  const Icon = variant === "ok" ? CheckCircle : AlertCircle;
  return (
    <ul className="space-y-2">
      {items.map((t) => (
        <li key={t.slice(0, 40)} className="flex gap-2 text-xs leading-relaxed text-slate-600">
          <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" strokeWidth={1.75} />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export function LiveDiagnose() {
  const { recordDiagnosis } = useSessionDiagnosis();
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [plotRevision, setPlotRevision] = useState(0);
  const [toast, setToast] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    resetInput();
  };

  const onPickFile = useCallback((file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      setToast({ type: "error", text: "File exceeds 10MB limit." });
      return;
    }
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setSelectedFile(file);
    setResult(null);
    resetInput();
  }, []);

  const runAnalyze = useCallback(async () => {
    if (!selectedFile) return;
    setLoading(true);
    setResult(null);
    setAnalyzeStep(0);
    try {
      const fd = new FormData();
      fd.append("image", selectedFile);
      const res = await fetch("/predict", { method: "POST", body: fd });
      const data = (await res.json()) as PredictResponse;
      if (!res.ok || data.error) throw new Error(data.error || "Request failed");
      setResult(data);
      setPlotRevision((n) => n + 1);
      recordDiagnosis({ prediction: data.prediction, confidence: data.confidence, fileName: selectedFile.name });
      setToast({ type: "success", text: "Analysis complete." });
    } catch (e) {
      setToast({ type: "error", text: e instanceof Error ? e.message : "Diagnostic error" });
    } finally {
      setLoading(false);
      setAnalyzeStep(0);
      resetInput();
    }
  }, [selectedFile, recordDiagnosis]);

  useEffect(() => {
    if (!loading) return;
    setAnalyzeStep(0);
    const t1 = window.setTimeout(() => setAnalyzeStep(1), 400);
    const t2 = window.setTimeout(() => setAnalyzeStep(2), 1400);
    const t3 = window.setTimeout(() => setAnalyzeStep(3), 2600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [loading]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const onDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onPickFile(e.dataTransfer.files?.[0]);
    },
    [onPickFile],
  );

  const diseaseKey = result ? normalizePrediction(result.prediction) : null;
  const isHealthy = result?.prediction === "Healthy";

  const downloadReport = () => {
    if (!result) return;
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleString();

    // Title
    doc.setFontSize(22);
    doc.setTextColor(13, 148, 136); // Teal 600
    doc.text("PoultryDx Clinical Report", 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${dateStr}`, 20, 32);
    doc.line(20, 35, 190, 35);

    // Primary Diagnosis
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Primary Diagnostic Findings", 20, 50);
    
    doc.setFontSize(12);
    doc.text(`Condition Predicted: ${result.prediction}`, 20, 60);
    doc.text(`Confidence Score: ${result.confidence.toFixed(2)}%`, 20, 68);
    doc.text(`Sample Filename: ${selectedFile?.name || "clinical_capture.jpg"}`, 20, 76);

    // Probabilities
    doc.setFontSize(14);
    doc.text("Class Probability Breakdown", 20, 95);
    doc.setFontSize(10);
    let y = 105;
    Object.entries(result.all_probs).forEach(([cls, prob]) => {
      doc.text(`${cls}:`, 25, y);
      doc.text(`${prob.toFixed(2)}%`, 70, y);
      y += 8;
    });

    // Caveat
    doc.line(20, 150, 190, 150);
    doc.setFontSize(9);
    doc.setTextColor(150);
    const splitText = doc.splitTextToSize(
      "DISCLAIMER: This report is generated by an AI-assisted diagnostic model (ResNet50). It is intended for screening and educational purposes only. Final clinical decisions should be made by a qualified veterinarian or laboratory professional.",
      170
    );
    doc.text(splitText, 20, 160);

    doc.save("poultrydx-clinical-report.pdf");
    setToast({ type: "success", text: "Report exported as PDF." });
  };

  const diagnoseAnother = () => {
    setResult(null);
    clearSelection();
    setPlotRevision((n) => n + 1);
  };

  return (
    <div className="relative space-y-8">
      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`fixed right-6 top-24 z-50 flex items-center gap-2 rounded-lg border px-4 py-2 text-sm shadow-md ${
              toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-teal-200 bg-teal-50 text-teal-900"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle className="h-4 w-4 shrink-0" />
            )}
            {toast.text}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Card className="border-slate-200/90 bg-white shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900">
            <Upload className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
            <CardTitle className="text-lg font-semibold">Diagnose</CardTitle>
          </div>
          <CardDescription className="text-sm leading-relaxed">
            Upload a fecal or clinical sample image for AI-assisted classification. This tool supports screening workflows
            only — confirm with laboratory and veterinary diagnosis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => onPickFile(e.target.files?.[0])}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => onPickFile(e.target.files?.[0])}
          />

          <motion.div
            animate={
              selectedFile && !loading
                ? { borderColor: ["rgb(204 251 241)", "rgb(45 212 191)", "rgb(204 251 241)"] }
                : {}
            }
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className={`rounded-xl border-2 border-dashed ${selectedFile ? "border-teal-200" : "border-slate-200"} bg-slate-50/60`}
          >
            <motion.button
              type="button"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.005 }}
              whileTap={{ scale: loading ? 1 : 0.995 }}
              onClick={() => {
                resetInput();
                inputRef.current?.click();
              }}
              onDragEnter={onDrag}
              onDragOver={onDrag}
              onDragLeave={onDrag}
              onDrop={onDrop}
              className="flex w-full cursor-pointer flex-col items-center px-6 py-14 text-slate-700 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-teal-700" />
              ) : (
                <>
                  {!selectedFile && !result ? (
                    <>
                      <Stethoscope className="mb-3 h-16 w-16 text-slate-300" strokeWidth={1.1} />
                      <p className="text-sm font-semibold text-slate-800">No diagnosis yet</p>
                      <p className="mt-1 max-w-sm text-xs text-slate-500">Upload a fecal sample image to get started.</p>
                    </>
                  ) : null}
                  <CloudUpload className="mb-3 mt-2 h-12 w-12 text-teal-700" strokeWidth={1.25} />
                </>
              )}
              <span className="text-sm font-medium text-slate-900">Drag & drop fecal sample image</span>
              <span className="mt-2 text-xs text-slate-500">Supports JPG, PNG up to 10MB</span>
            </motion.button>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" variant="secondary" className="gap-2" disabled={loading} onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" strokeWidth={1.75} />
              Choose file
            </Button>
            <Button type="button" variant="secondary" className="gap-2" disabled={loading} onClick={() => cameraRef.current?.click()}>
              <Camera className="h-4 w-4" strokeWidth={1.75} />
              Take photo
            </Button>
            <Button type="button" className="gap-2" disabled={!selectedFile || loading} onClick={() => void runAnalyze()}>
              <Microscope className="h-4 w-4" strokeWidth={1.75} />
              Analyze
            </Button>
          </div>

          {selectedFile && previewUrl ? (
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-3">
              <img src={previewUrl} alt="" className="h-20 w-20 rounded-md border border-slate-100 object-cover" />
              <div className="min-w-0 flex-1 text-xs">
                <p className="truncate font-medium text-slate-900">{selectedFile.name}</p>
                <p className="text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={clearSelection} aria-label="Remove file">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          {loading ? (
            <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/80 p-5">
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-3/5 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                {STEPS.map((s, i) => (
                  <div key={s.key} className="flex items-center gap-2 text-xs">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        analyzeStep > i ? "bg-teal-100 text-teal-800" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      <s.Icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <span className={analyzeStep > i ? "font-medium text-teal-900" : "text-slate-600"}>{s.label}</span>
                    {analyzeStep > i ? <CheckCircle className="h-4 w-4 text-teal-600" /> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {result ? (
        <motion.div key={plotRevision} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div
            className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 ${
              isHealthy ? "border-teal-200 bg-teal-50/80" : "border-amber-200 bg-amber-50/80"
            }`}
          >
            {isHealthy ? (
              <ShieldCheck className="h-6 w-6 text-teal-800" strokeWidth={1.75} />
            ) : (
              <ShieldAlert className="h-6 w-6 text-amber-800" strokeWidth={1.75} />
            )}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Severity</p>
              <p className="text-lg font-semibold text-slate-900">{result.prediction}</p>
            </div>
            <Badge variant="secondary" className="ml-auto gap-1">
              {isHealthy ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
              {isHealthy ? "Low concern (model)" : "Review recommended"}
            </Badge>
          </div>

          <Card className="border-slate-200/90 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileImage className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
                <CardTitle className="text-base font-semibold">Analysis output</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <ConfidenceRing value={result.confidence} />
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-700">Class probabilities</p>
                  {Object.entries(result.all_probs).map(([cls, prob]) => {
                    const Icon = CLASS_ICONS[cls] ?? AlertCircle;
                    return (
                      <div key={cls} className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-slate-600" strokeWidth={1.75} />
                        <span className="w-28 shrink-0 text-xs text-slate-600">{cls}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <motion.div
                            className="h-full rounded-full bg-teal-700"
                            initial={{ width: 0 }}
                            animate={{ width: `${prob}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs tabular-nums text-slate-700">{prob.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Eye className="h-4 w-4 text-teal-700" strokeWidth={1.75} />
                  AI attention map
                </div>
                {result.gradcam_b64 ? (
                  <img
                    src={result.gradcam_b64}
                    alt="Model saliency overlay"
                    className="w-full max-w-sm rounded-lg border border-slate-200 object-contain"
                  />
                ) : (
                  <p className="text-xs text-slate-500">Heatmap not available (model offline or saliency failed).</p>
                )}
              </div>
            </CardContent>
            <CardContent className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <Button type="button" variant="secondary" className="gap-2" onClick={downloadReport}>
                <Download className="h-4 w-4" strokeWidth={1.75} />
                Download report
              </Button>
              <Button type="button" className="gap-2" onClick={diagnoseAnother}>
                <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
                Diagnose another
              </Button>
            </CardContent>
          </Card>

          {diseaseKey ? (
            <Card className="border-slate-200/90 bg-white shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <BookOpen className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
                  <CardTitle className="text-base font-semibold">Disease reference</CardTitle>
                </div>
                <CardDescription className="text-xs">Educational summary for the predicted class.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-hidden rounded-lg border border-slate-100">
                  <img
                    src={diseaseImages[diseaseKey]}
                    alt=""
                    className="h-40 w-full object-cover"
                  />
                </div>
                {diseaseDetails[diseaseKey].zoonotic ? (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-900">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Zoonotic risk: can transmit to humans — follow hygiene and cooking guidance.
                  </div>
                ) : null}
                <MortalityMeter level={diseaseKey} />
                <p className="text-xs font-medium text-slate-600">{diseaseDetails[diseaseKey].dangerStat}</p>
                <div className="flex items-start gap-2 rounded-lg border border-teal-100 bg-teal-50/60 px-3 py-2 text-xs text-teal-950">
                  <Siren className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span>{diseaseDetails[diseaseKey].recommendedAction}</span>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-slate-100/90 p-1">
                    <TabsTrigger value="overview" className="gap-1.5 text-[10px] sm:text-xs">
                      <Info className="h-3.5 w-3.5" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="symptoms" className="gap-1.5 text-[10px] sm:text-xs">
                      <List className="h-3.5 w-3.5" />
                      Symptoms
                    </TabsTrigger>
                    <TabsTrigger value="cause" className="gap-1.5 text-[10px] sm:text-xs">
                      <Microscope className="h-3.5 w-3.5" />
                      Cause
                    </TabsTrigger>
                    <TabsTrigger value="treatment" className="gap-1.5 text-[10px] sm:text-xs">
                      <Pill className="h-3.5 w-3.5" />
                      Treatment
                    </TabsTrigger>
                    <TabsTrigger value="prevention" className="gap-1.5 text-[10px] sm:text-xs">
                      <Shield className="h-3.5 w-3.5" />
                      Prevention
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="mt-4">
                    <BulletList items={diseaseDetails[diseaseKey].overview} variant="ok" />
                  </TabsContent>
                  <TabsContent value="symptoms" className="mt-4">
                    <BulletList items={diseaseDetails[diseaseKey].symptoms} variant="warn" />
                  </TabsContent>
                  <TabsContent value="cause" className="mt-4">
                    <BulletList items={diseaseDetails[diseaseKey].cause} variant="ok" />
                  </TabsContent>
                  <TabsContent value="treatment" className="mt-4">
                    <BulletList items={diseaseDetails[diseaseKey].treatment} variant="warn" />
                  </TabsContent>
                  <TabsContent value="prevention" className="mt-4">
                    <BulletList items={diseaseDetails[diseaseKey].prevention} variant="ok" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : null}
        </motion.div>
      ) : null}
    </div>
  );
}
