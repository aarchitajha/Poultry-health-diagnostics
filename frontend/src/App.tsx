import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart2,
  BarChart3,
  Bell,
  Bird,
  BookOpen,
  ChevronRight,
  Cpu,
  HelpCircle,
  History,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AboutPage } from "@/components/AboutPage";
import { type MetricsSummary, DashboardHome } from "@/components/DashboardHome";
import { HistorySection } from "@/components/HistorySection";
import { LiveDiagnose } from "@/components/LiveDiagnose";
import { PlotlyLazy } from "@/components/PlotlyLazy";
import { TrainingAnalyticsSection } from "@/components/TrainingAnalyticsSection";
import { AccuracyCurveChart, LearningRateChart, LossCurveChart, type TrainingRow } from "@/components/TrainingCharts";
import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";
import { VisualIntelligence } from "@/components/VisualIntelligence";
import { VizImage } from "@/components/VizImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSessionDiagnosis } from "@/context/SessionDiagnosisContext";

type Section = "dashboard" | "eda" | "training" | "model" | "diagnose" | "history" | "about" | "visual";

const nav: { id: Section; label: string; icon: ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "diagnose", label: "Image analysis", icon: <Stethoscope className="h-4 w-4" /> },
  { id: "eda", label: "Data exploration", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "training", label: "Training & evaluation", icon: <BarChart2 className="h-4 w-4" /> },
  { id: "model", label: "Pipeline & CAM", icon: <Cpu className="h-4 w-4" /> },
  { id: "visual", label: "Visual insights", icon: <Sparkles className="h-4 w-4 text-indigo-500" /> },
  { id: "history", label: "History", icon: <History className="h-4 w-4" /> },
  { id: "about", label: "About", icon: <Settings className="h-4 w-4" /> },
];

const edaPlots = [
  { n: "1", title: "Class Distribution – Bar Chart", desc: "Image counts per class with share annotations.", src: "/static/eda_plots/01_class_dist_bar.png" },
  { n: "2", title: "Class Distribution – Pie Chart", desc: "Class proportions.", src: "/static/eda_plots/02_class_dist_pie.png" },
  { n: "3", title: "Sample Image Grid", desc: "Representative tiles per class.", src: "/static/eda_plots/03_sample_image_grid.png" },
  { n: "4", title: "Pixel Intensity Distribution", desc: "RGB histograms by class.", src: "/static/eda_plots/04_pixel_intensity.png" },
  { n: "5", title: "Image Dimension Analysis", desc: "Width vs height prior to resize.", src: "/static/eda_plots/05_image_dimension.png" },
  { n: "6", title: "Color Channel Heatmaps", desc: "Mean channel activations by class.", src: "/static/eda_plots/06_color_channel_hm.png" },
  { n: "7", title: "Data Augmentation Showcase", desc: "Before / after augmentation.", src: "/static/eda_plots/07_data_aug_showcase.png" },
  { n: "8", title: "Feature Correlation Heatmap", desc: "Correlation of extracted image features.", src: "/static/eda_plots/08_corr_heatmap.png" },
  { n: "9", title: "Per-Class Mean Pixel Heatmap", desc: "Averaged pixel intensities per diagnostic class.", src: "/static/eda_plots/09_class_mean_heatmap.png" },
  { n: "10", title: "Model Confusion Matrix", desc: "Validation set performance breakdown.", src: "/static/train_plots/10_confusion_matrix.png" },
] as const;

const sectionTitles: Record<Section, string> = {
  dashboard: "Dashboard",
  eda: "Exploratory analysis",
  training: "Training & evaluation",
  model: "Inference pipeline",
  diagnose: "Image analysis",
  visual: "Visual intelligence",
  history: "History",
  about: "About",
};

function SectionPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn("space-y-8", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

function VizShell({
  num,
  title,
  desc,
  children,
  delay = 0,
}: {
  num: string;
  title: string;
  desc: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="overflow-hidden border-slate-200/90 bg-white shadow-sm">
        <CardHeader className="space-y-1 p-5 pb-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-mono text-[10px]">
              {num}
            </Badge>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
          </div>
          <CardDescription className="text-xs leading-relaxed">{desc}</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-4">{children}</CardContent>
      </Card>
    </motion.div>
  );
}

function SidebarExtras() {
  const { todayDiagnoses, diseasesFoundCount } = useSessionDiagnosis();
  return (
    <>
      <div className="rounded-lg border border-slate-200/90 bg-white p-3 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Quick stats</p>
        <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
          <li className="flex justify-between gap-2">
            <span>Today&apos;s diagnoses</span>
            <span className="font-semibold tabular-nums text-teal-800">{todayDiagnoses}</span>
          </li>
          <li className="flex justify-between gap-2">
            <span>Diseases found</span>
            <span className="font-semibold tabular-nums text-teal-800">{diseasesFoundCount}</span>
          </li>
        </ul>
      </div>
      <div className="mt-auto space-y-3 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="h-2 w-2 rounded-full bg-teal-600" />
          <span className="font-medium text-slate-800">Ready</span>
          <span className="text-slate-400">· Model status</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <Badge variant="secondary" className="font-mono text-[10px]">
            v1.0.0
          </Badge>
          <button
            type="button"
            title="Help: use Image analysis to run inference; Training shows metrics after you run 02_train.py."
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </>
  );
}

function AppHeader({ section }: { section: Section }) {
  const [q, setQ] = useState("");
  const today = useMemo(() => new Date().toLocaleDateString(undefined, { dateStyle: "medium" }), []);

  return (
    <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-100 px-6 py-2 text-[11px] text-slate-600 md:px-8">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-teal-600" />
          Model loaded
        </span>
        <span className="text-slate-300">|</span>
        <span>ResNet50</span>
        <span className="text-slate-300">|</span>
        <span>4 classes</span>
        <span className="text-slate-300">|</span>
        <span>Last updated: {today}</span>
      </div>
      <div className="flex h-14 items-center gap-4 px-6 md:px-8">
        <div className="flex min-w-0 items-center gap-1 text-xs text-slate-500">
          <span className="font-medium text-slate-400 sm:inline hidden">Home</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 sm:inline hidden" />
          <span className="truncate font-medium text-slate-800">{sectionTitles[section]}</span>
        </div>
        <div className="relative mx-auto max-w-md flex-1 sm:mx-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search diagnostics, diseases, metrics…"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600/20"
          />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" strokeWidth={1.5} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-teal-50 text-xs font-bold text-teal-900"
            title="User"
          >
            DR
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [section, setSection] = useState<Section>("dashboard");
  const [training, setTraining] = useState<TrainingRow[]>([]);
  const [f1, setF1] = useState<Record<string, number> | null>(null);
  const [dash, setDash] = useState<{ classes: string[]; counts: number[]; accuracy: number } | null>(null);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);

  const chartSessionKey = useMemo(() => `t-${training.length}-${training.at(-1)?.epoch ?? 0}`, [training]);

  useEffect(() => {
    fetch("/api/training-log")
      .then((r) => r.json())
      .then((rows: TrainingRow[]) => setTraining(Array.isArray(rows) ? rows : []))
      .catch(() => setTraining([]));
  }, []);

  useEffect(() => {
    fetch("/static/train_plots/f1_data.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => (j && typeof j === "object" ? setF1(j as Record<string, number>) : setF1(null)))
      .catch(() => setF1(null));
  }, []);

  useEffect(() => {
    fetch("/static/train_plots/dashboard_data.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.classes && j?.counts) setDash(j);
        else setDash(null);
      })
      .catch(() => setDash(null));
  }, []);

  useEffect(() => {
    fetch("/static/train_plots/metrics_summary.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (
          j &&
          typeof j.accuracy === "number" &&
          typeof j.precision_macro === "number" &&
          typeof j.recall_macro === "number" &&
          typeof j.f1_macro === "number"
        ) {
          setMetrics(j as MetricsSummary);
        } else setMetrics(null);
      })
      .catch(() => setMetrics(null));
  }, []);

  const f1Plot = useMemo(() => {
    if (!f1) return null;
    const labels = Object.keys(f1);
    const values = labels.map((k) => f1[k]);
    return {
      data: [
        {
          type: "bar" as const,
          x: labels,
          y: values,
          marker: { color: "#0d9488" },
        },
      ],
      layout: {
        title: { text: "Per-class F1 score", font: { size: 14 } },
        yaxis: { title: "F1", range: [0, 1.05], gridcolor: "#e2e8f0", zeroline: false },
        xaxis: { title: "Class" },
        margin: { t: 48, b: 56, l: 48, r: 24 },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: { family: "Inter, Roboto, system-ui, sans-serif", color: "#334155", size: 12 },
        transition: { duration: 500, easing: "cubic-in-out" },
      },
    };
  }, [f1]);

  const dashPlot = useMemo(() => {
    if (!dash) return null;
    return {
      data: [
        {
          type: "bar" as const,
          x: dash.classes,
          y: dash.counts,
          marker: { color: ["#0d9488", "#0369a1", "#b45309", "#b91c1c"] },
        },
      ],
      layout: {
        title: {
          text: `Evaluation sample counts (subset accuracy ${(dash.accuracy * 100).toFixed(1)}%)`,
          font: { size: 14 },
        },
        yaxis: { title: "Count", gridcolor: "#e2e8f0", zeroline: false },
        xaxis: { title: "Class" },
        margin: { t: 48, b: 56, l: 48, r: 24 },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: { family: "Inter, Roboto, system-ui, sans-serif", color: "#334155", size: 12 },
        transition: { duration: 500, easing: "cubic-in-out" },
      },
    };
  }, [dash]);

  const f1PlotKey = f1 ? JSON.stringify(f1) : "none";
  const dashPlotKey = dash ? `${dash.classes.join()}-${dash.counts.join()}` : "none";

  if (section === "visual") {
    return <VisualIntelligence onExit={() => setSection("dashboard")} />;
  }

  return (
    <div className="flex min-h-screen max-w-full overflow-x-hidden bg-white">
      <aside className="sticky top-0 hidden h-screen w-[228px] shrink-0 flex-col gap-6 border-r border-slate-100 bg-slate-50/50 px-5 py-8 md:flex">
        <div className="flex items-center gap-2 px-1 text-lg font-semibold tracking-tight text-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
            <Bird className="h-5 w-5" strokeWidth={1.75} />
          </div>
          PoultryDx
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {nav.map((item) => (
            <Button
              key={item.id}
              variant={section === item.id ? "default" : "ghost"}
              size="sm"
              className={cn(
                "justify-start gap-2.5 rounded-lg text-xs font-medium",
                section !== item.id && "text-slate-600 hover:bg-white hover:text-slate-900",
              )}
              onClick={() => setSection(item.id)}
            >
              <div className="shrink-0">{item.icon}</div>
              <span className="truncate text-left">{item.label}</span>
            </Button>
          ))}
        </nav>
        <SidebarExtras />
      </aside>

      {/* Mobile nav indicator/bar */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 md:hidden">
        {nav.slice(0, 5).map((item) => (
            <Button 
                key={item.id} 
                size="icon" 
                variant={section === item.id ? "default" : "secondary"}
                className="h-10 w-10 rounded-full shadow-lg"
                onClick={() => setSection(item.id)}
            >
                {item.icon}
            </Button>
        ))}
      </div>

      <div className="flex min-h-screen flex-1 flex-col min-w-0">
        <AppHeader section={section} />

        <main className="flex-1 px-8 pb-12 pt-4">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
            {section === "dashboard" && (
              <SectionPanel key="dash">
                <div className="rounded-2xl bg-slate-50/90 p-6 md:p-8">
                  <DashboardHome training={training} metrics={metrics} dash={dash} />
                </div>
              </SectionPanel>
            )}

            {section === "eda" && (
              <SectionPanel key="eda">
                <div className="rounded-2xl bg-slate-50/90 p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-2 text-slate-900">
                    <BarChart3 className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
                    <h2 className="text-base font-semibold">Exploratory analysis</h2>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Figures 1–8 from the study pipeline (static exports). Charts fade in as you scroll; source plots are
                    Matplotlib / Seaborn.
                  </p>
                  <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    {edaPlots.map((p, i) => (
                      <VizShell key={p.n} num={p.n} title={p.title} desc={p.desc} delay={i * 0.04}>
                        <VizImage src={p.src} alt={p.title} delay={0} />
                      </VizShell>
                    ))}
                  </div>
                </div>
              </SectionPanel>
            )}

            {section === "training" && (
              <SectionPanel key="training">
                <div className="rounded-2xl bg-slate-50/90 p-6 md:p-8 space-y-8">
                  <TrainingAnalyticsSection metrics={metrics} dash={dash} />
                  <div className="flex items-center gap-2 text-slate-800">
                    <BarChart2 className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
                    <p className="text-sm font-semibold">Training curves & error analysis</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    Training dynamics (9–11), error analysis (12–14), and interactive summaries (16–17).
                  </p>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <VizShell num="9" title="Loss" desc="Training vs validation loss (CSV + static figure)." delay={0}>
                      {training.length ? (
                        <LossCurveChart data={training} chartKey={`${chartSessionKey}-loss`} />
                      ) : (
                        <p className="text-xs text-slate-500">No training log.</p>
                      )}
                      <VizImage src="/static/train_plots/09_10_train_curves.png" alt="Training curves export" delay={0.06} />
                    </VizShell>

                    <VizShell num="10" title="Accuracy" desc="Training vs validation accuracy." delay={0.04}>
                      {training.length ? (
                        <AccuracyCurveChart data={training} chartKey={`${chartSessionKey}-acc`} />
                      ) : (
                        <p className="text-xs text-slate-500">No training log.</p>
                      )}
                    </VizShell>

                    <VizShell num="11" title="Learning rate" desc="Scheduled learning rate (log scale)." delay={0.08}>
                      {training.length ? <LearningRateChart data={training} chartKey={`${chartSessionKey}-lr`} /> : null}
                      <VizImage src="/static/train_plots/11_lr_schedule.png" alt="LR schedule" delay={0.06} />
                    </VizShell>

                    <VizShell num="12" title="Confusion matrix" desc="Row-normalized confusion matrix." delay={0.1}>
                      <VizImage src="/static/train_plots/12_conf_matrix.png" alt="Confusion matrix" />
                    </VizShell>

                    <VizShell num="13" title="ROC (one-vs-rest)" desc="ROC curves with AUC by class." delay={0.12}>
                      <VizImage src="/static/train_plots/13_roc_curves.png" alt="ROC" />
                    </VizShell>

                    <VizShell num="14" title="Precision–recall" desc="Per-class precision vs recall." delay={0.14}>
                      <VizImage src="/static/train_plots/14_pr_curves.png" alt="PR curves" />
                    </VizShell>
                  </div>

                  <VizShell num="16" title="F1 by class" desc="Interactive bar chart from evaluation export." delay={0.16}>
                    {f1Plot ? (
                      <PlotlyLazy key={f1PlotKey} data={f1Plot.data} layout={f1Plot.layout} />
                    ) : (
                      <p className="text-xs text-slate-500">Run `02_train.py` to emit f1_data.json.</p>
                    )}
                  </VizShell>

                  <VizShell num="17" title="Evaluation dashboard" desc="Class counts on the sampled evaluation subset." delay={0.18}>
                    {dashPlot ? (
                      <PlotlyLazy key={dashPlotKey} data={dashPlot.data} layout={dashPlot.layout} />
                    ) : (
                      <p className="text-xs text-slate-500">Missing dashboard_data.json.</p>
                    )}
                  </VizShell>
                </div>
              </SectionPanel>
            )}

            {section === "model" && (
              <SectionPanel key="model">
                <div className="rounded-2xl bg-slate-50/90 p-6 md:p-8 space-y-8">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
                    <h2 className="text-base font-semibold text-slate-900">Inference pipeline</h2>
                  </div>
                  <VizShell num="Flow" title="System pipeline architecture" desc="Technical overview of high-level layers and inference flow." delay={0}>
                    <ArchitectureDiagram />
                  </VizShell>
                  <VizShell
                    num="15"
                    title="Class activation maps"
                    desc="GradCAM-style montage on sample tiles (training export)."
                    delay={0.06}
                  >
                    <VizImage src="/static/train_plots/15_gradcam_montage.png" alt="GradCAM montage" />
                  </VizShell>
                </div>
              </SectionPanel>
            )}

            {section === "diagnose" && (
              <SectionPanel key="diagnose">
                <div className="mx-auto max-w-4xl rounded-2xl bg-slate-50/90 p-6 md:p-8">
                  <div className="mb-6 flex flex-wrap items-center gap-2">
                    <Stethoscope className="h-6 w-6 text-teal-700" strokeWidth={1.75} />
                    <h2 className="text-lg font-semibold text-slate-900">Diagnose</h2>
                    <span className="ml-1 inline-flex items-center gap-1 text-xs text-slate-500" title="Disease reference appears after analysis">
                      <BookOpen className="h-4 w-4" strokeWidth={1.75} />
                      Disease reference
                    </span>
                  </div>
                  <LiveDiagnose />
                </div>
              </SectionPanel>
            )}

            {section === "history" && (
              <SectionPanel key="history">
                <div className="mx-auto max-w-2xl rounded-2xl bg-slate-50/90 p-6 md:p-8">
                  <div className="mb-4 flex items-center gap-2">
                    <History className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
                    <h2 className="text-base font-semibold text-slate-900">Session history</h2>
                  </div>
                  <HistorySection />
                </div>
              </SectionPanel>
            )}

            {section === "about" && (
              <SectionPanel key="about">
                <div className="rounded-2xl bg-slate-50/90 p-6 md:p-10">
                  <div className="mb-6 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
                    <h2 className="text-base font-semibold text-slate-900">About</h2>
                  </div>
                  <AboutPage />
                </div>
              </SectionPanel>
            )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
