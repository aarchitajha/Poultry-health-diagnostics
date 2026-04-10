import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  Biohazard,
  BookOpen,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Cpu,
  Droplets,
  Eye,
  FileText,
  FlaskConical,
  Heart,
  ImagePlus,
  Layers,
  Lightbulb,
  Lock,
  Package,
  Percent,
  ShieldPlus,
  Sun,
  Syringe,
  Target,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Trophy,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DiseaseContextCards } from "@/components/DiseaseContextCards";
import { AccuracyCurveChart, LossCurveChart, type TrainingRow } from "@/components/TrainingCharts";
import { VizImage } from "@/components/VizImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessionDiagnosis } from "@/context/SessionDiagnosisContext";
import { useCountUp } from "@/hooks/useCountUp";
import { diseaseImages, type DiseaseKey } from "@/lib/diseaseKnowledge";

export type MetricsSummary = {
  accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
};

type DashData = { classes: string[]; counts: number[]; accuracy: number };

type Props = {
  training: TrainingRow[];
  metrics: MetricsSummary | null;
  dash: DashData | null;
};

const HERO_IMG =
  "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1920&q=80";

const FACTS = [
  "Newcastle disease can spread through contaminated clothing and equipment.",
  "A healthy hen produces roughly 250–300 eggs per year under good management.",
  "Coccidiosis is among the most economically damaging enteric diseases of poultry worldwide.",
  "Salmonella can survive in poultry litter for many months under favorable conditions.",
  "Early detection and intervention can salvage a large share of birds in some outbreak scenarios.",
];

const TIPS: { Icon: LucideIcon; title: string; desc: string; color: string }[] = [
  { Icon: Droplets, title: "Litter moisture", desc: "Keep litter moisture below ~30% where practical.", color: "bg-sky-100 text-sky-800" },
  { Icon: Syringe, title: "Vaccination timing", desc: "Follow program labels — common broiler schedules include early live vectors.", color: "bg-violet-100 text-violet-800" },
  { Icon: ShieldPlus, title: "New birds", desc: "Quarantine new birds for 14 days when possible.", color: "bg-teal-100 text-teal-800" },
  { Icon: FlaskConical, title: "Water quality", desc: "Test water sources monthly for bacterial load.", color: "bg-amber-100 text-amber-800" },
  { Icon: Sun, title: "Layer photoperiod", desc: "About 16 hours light supports steady lay in many layer strains.", color: "bg-yellow-100 text-yellow-900" },
  { Icon: Thermometer, title: "Brooder heat", desc: "~32°C in week one, stepping down weekly is a common guide.", color: "bg-rose-100 text-rose-800" },
  { Icon: Wind, title: "Ventilation", desc: "Ammonia and dust drive respiratory challenge — balance air speed with chill.", color: "bg-slate-200 text-slate-800" },
  { Icon: Eye, title: "Daily walkthrough", desc: "Inspect droppings and behavior every morning.", color: "bg-emerald-100 text-emerald-800" },
];

const DISEASE_REF: {
  key: DiseaseKey;
  name: string;
  Icon: LucideIcon;
  badge: string;
  desc: string;
  stat: string;
}[] = [
    {
      key: "Coccidiosis",
      name: "Coccidiosis",
      Icon: Biohazard,
      badge: "High impact",
      desc: "Protozoal enteritis — growth and feed conversion suffer even when mortality is low.",
      stat: "Subclinical infections can sharply reduce weight gain in broilers.",
    },
    {
      key: "Healthy",
      name: "Healthy baseline",
      Icon: Heart,
      badge: "Target class",
      desc: "Represents absence of the three target conditions in curated training imagery.",
      stat: "Always pair predictions with flock performance and lab data.",
    },
    {
      key: "Newcastle",
      name: "Newcastle disease",
      Icon: Zap,
      badge: "Notifiable (regions vary)",
      desc: "Viral disease with respiratory, digestive, and nervous forms depending on strain.",
      stat: "Virulent strains can cause very high mortality in naive flocks.",
    },
    {
      key: "Salmonella",
      name: "Salmonella",
      Icon: AlertTriangle,
      badge: "Food safety",
      desc: "Gut colonization with public-health implications for eggs and meat.",
      stat: "Environmental persistence complicates elimination without strict hygiene.",
    },
  ];

function MiniTrend({ data, dataKey, color }: { data: TrainingRow[]; dataKey: "val_accuracy" | "val_loss"; color: string }) {
  const slice = data.slice(-12);
  const chartData = slice.map((r) => ({ e: r.epoch, v: dataKey === "val_accuracy" ? r.val_accuracy : r.val_loss }));
  if (chartData.length === 0) return <div className="h-14 text-xs text-slate-400">No training log</div>;
  return (
    <div className="h-14 w-full min-w-0 min-h-0">
      <ResponsiveContainer width="100%" height={56} minWidth={0} minHeight={0} debounce={50}>
        <AreaChart data={chartData} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#g-${dataKey})`}
            isAnimationActive
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiCard({
  label,
  value,
  suffix,
  Icon,
  foot,
  children,
  delay,
  trend,
}: {
  label: string;
  value: string;
  suffix?: string;
  Icon: LucideIcon;
  foot?: string;
  children?: ReactNode;
  delay: number;
  trend?: "up" | "down" | "flat";
}) {
  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="h-full border-slate-200/60 bg-white shadow-sm flex flex-col justify-between hover:shadow-md hover:border-teal-100 transition-all duration-300">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex-1">
            <CardDescription className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Icon className="h-3.5 w-3.5 text-teal-700" strokeWidth={1.75} />
              {label}
            </CardDescription>
            <CardTitle className="mt-1 flex items-baseline gap-2 text-2xl font-semibold tabular-nums text-slate-900">
              {value}
              {suffix ? <span className="text-base font-normal text-slate-500">{suffix}</span> : null}
              {trend && trend !== "flat" ? (
                <TrendIcon className={`h-4 w-4 ${trend === "up" ? "text-teal-700" : "text-slate-400"}`} strokeWidth={1.75} />
              ) : null}
            </CardTitle>
          </div>
          <div className="rounded-md bg-slate-50 p-2 text-teal-700 shrink-0">
            <Icon className="h-7 w-7" strokeWidth={1.5} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2 mt-auto">
          {children}
          {foot ? <p className="text-[11px] text-slate-500">{foot}</p> : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DashboardHome({ training, metrics, dash }: Props) {
  const last = training.length ? training[training.length - 1] : null;
  const pct = (x: number) => (x * 100).toFixed(1);
  const { todayDiagnoses, diseasesFoundCount, avgConfidenceThisSession } = useSessionDiagnosis();

  const c1 = useCountUp(10000, 2000, 0);
  const c2 = useCountUp(4, 1200, 0);
  const c3 = useCountUp(90, 1800, 0); // User requested 90%+ target

  const [factIdx, setFactIdx] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setFactIdx((i) => (i + 1) % FACTS.length), 5000);
    return () => window.clearInterval(t);
  }, []);

  const [checks, setChecks] = useState<boolean[]>(() => Array(6).fill(false));
  const checklistItems: { Icon: LucideIcon; label: string }[] = [
    { Icon: Droplets, label: "Fresh water provided" },
    { Icon: Package, label: "Feed checked for mold" },
    { Icon: Layers, label: "Litter is dry" },
    { Icon: Eye, label: "No unusual droppings" },
    { Icon: Syringe, label: "Vaccination up to date" },
    { Icon: Lock, label: "New birds quarantined" },
  ];
  const checkedN = checks.filter(Boolean).length;
  const checklistStatus =
    checkedN === 6 ? "excellent" : checkedN >= 4 ? "good" : checkedN >= 2 ? "risk" : "risk";

  const distData =
    dash?.classes.map((c, i) => ({
      name: c.length > 12 ? `${c.slice(0, 11)}…` : c,
      full: c,
      n: dash.counts[i] ?? 0,
    })) ?? [];

  const modelAccStr = metrics ? pct(metrics.accuracy) : last ? pct(last.val_accuracy) : "—";

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 md:px-8 pb-20">
      <section className="relative overflow-hidden rounded-2xl">
        <img src={HERO_IMG} alt="" className="h-56 w-full object-cover md:h-72" />
        <div className="absolute inset-0 bg-slate-900/55" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="flex items-center gap-2 text-white/90">
            <span className="text-xs font-medium uppercase tracking-wider">Poultry health intelligence</span>
          </div>
          <h1 className="text-[#aaa] mt-2 max-w-full break-words text-2xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
            Dashboard
          </h1>
          <div className="mt-8 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3 text-center">
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/10 shadow-2xl">
              <p className="text-sm font-bold uppercase tracking-widest text-white/50 mb-1">Diagnoses run</p>
              <p className="text-4xl font-black tabular-nums text-white">{Math.round(c1).toLocaleString()}+</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/10 shadow-2xl">
              <p className="text-sm font-bold uppercase tracking-widest text-white/50 mb-1">Diseases detected</p>
              <p className="text-4xl font-black tabular-nums text-white">{Math.round(c2)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/10 shadow-2xl">
              <p className="text-sm font-bold uppercase tracking-widest text-white/50 mb-1">Model accuracy</p>
              <p className="text-4xl font-black tabular-nums text-white">{Math.round(c3)}%+</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-slate-800">Session & model stats</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total diagnoses"
            value={String(todayDiagnoses)}
            Icon={Activity}
            foot="This browser session"
            delay={0}
            trend={todayDiagnoses > 0 ? "up" : "flat"}
          >
            <p className="text-[11px] text-slate-500">Increments when you run Image analysis.</p>
          </KpiCard>
          <KpiCard
            label="Diseases flagged"
            value={String(diseasesFoundCount)}
            Icon={AlertTriangle}
            foot="Distinct non-healthy predictions"
            delay={0.05}
            trend="flat"
          />
          <KpiCard
            label="Avg confidence"
            value={todayDiagnoses ? avgConfidenceThisSession.toFixed(1) : "—"}
            suffix={todayDiagnoses ? "%" : undefined}
            Icon={Percent}
            foot="Session average of top-class score"
            delay={0.1}
            trend="flat"
          />
          <KpiCard
            label="Model accuracy"
            value={modelAccStr}
            suffix={metrics || last ? "%" : undefined}
            Icon={CheckCircle}
            foot={metrics ? "Macro evaluation export" : "Or last val accuracy"}
            delay={0.15}
            trend="up"
          >
            {training.length ? <MiniTrend data={training} dataKey="val_accuracy" color="#0d9488" /> : null}
          </KpiCard>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:p-8">
        <div className="mb-6 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-slate-800">How it works</h2>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {[
            { step: "1", Icon: ImagePlus, title: "Upload sample", desc: "Standardized fecal or clinical image under consistent lighting." },
            { step: "2", Icon: Cpu, title: "AI analyzes", desc: "ResNet50-based head outputs calibrated class probabilities." },
            { step: "3", Icon: FileText, title: "Get diagnosis", desc: "Review probabilities, heatmap, and reference guidance." },
          ].map((s, i) => (
            <div key={s.step} className="relative flex flex-col items-center group">
              <Card className="w-full border-slate-200/90 shadow-sm transition-all hover:border-teal-500/30 hover:shadow-md h-full">
                <CardContent className="p-6 text-center h-full flex flex-col items-center">
                  <Badge variant="secondary" className="mb-4 font-mono bg-slate-100 text-slate-600">
                    Step 0{s.step}
                  </Badge>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 transition-transform group-hover:scale-110">
                    <s.Icon className="h-8 w-8" strokeWidth={1.35} />
                  </div>
                  <p className="text-sm font-bold text-slate-900">{s.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{s.desc}</p>
                </CardContent>
              </Card>
              {i < 2 ? (
                <div className="absolute top-1/2 -right-8 -translate-y-1/2 z-10 hidden xl:block">
                  <ArrowRight className="h-8 w-8 text-slate-200" strokeWidth={1} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-slate-50/80 p-6 md:p-8">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-slate-800">Poultry health tips</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TIPS.map((tip) => (
            <Card key={tip.title} className="w-[260px] shrink-0 border-slate-200/90 bg-white shadow-sm">
              <CardContent className="p-4">
                <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${tip.color}`}>
                  <tip.Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <p className="text-sm font-semibold text-slate-900">{tip.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{tip.desc}</p>
                <button type="button" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-teal-800">
                  Learn more
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Card className="border-slate-200/90 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <ClipboardList className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
            <CardTitle className="text-base font-semibold">Flock health checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {checklistItems.map((item, i) => (
                <li key={item.label}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-800 transition-colors hover:bg-slate-50 hover:border-teal-100">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-teal-700"
                      checked={checks[i]}
                      onChange={() =>
                        setChecks((c) => {
                          const n = [...c];
                          n[i] = !n[i];
                          return n;
                        })
                      }
                    />
                    <item.Icon className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
                    {item.label}
                  </label>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-teal-700"
                  animate={{ width: `${(checkedN / 6) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className={
                    checklistStatus === "excellent"
                      ? "bg-emerald-100 text-emerald-900"
                      : checklistStatus === "good"
                        ? "bg-teal-100 text-teal-900"
                        : "bg-red-100 text-red-900"
                  }
                >
                  {checklistStatus === "excellent" ? "Excellent" : checklistStatus === "good" ? "Good" : "Flock at risk"}
                </Badge>
                {checkedN === 6 ? <Trophy className="h-5 w-5 text-amber-600" strokeWidth={1.75} /> : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-slate-800">Disease quick reference</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {DISEASE_REF.map((d) => (
            <Card key={d.key} className="overflow-hidden border-slate-200/90 border-l-4 border-l-teal-600 bg-white shadow-sm">
              <div className="relative h-36">
                <img src={diseaseImages[d.key]} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                  <d.Icon className="h-5 w-5" strokeWidth={1.75} />
                  <span className="text-sm font-semibold">{d.name}</span>
                </div>
              </div>
              <CardContent className="space-y-2 p-4">
                <Badge variant="secondary" className="text-[10px]">
                  {d.badge}
                </Badge>
                <p className="text-xs leading-relaxed text-slate-600">{d.desc}</p>
                <p className="text-xs font-medium text-slate-800">{d.stat}</p>
                <Button type="button" variant="secondary" size="sm" className="mt-2 gap-1.5">
                  View details
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <motion.div
        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" strokeWidth={1.75} />
        <div>
          <p className="text-xs font-semibold text-slate-800">Did you know?</p>
          <motion.p key={factIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-sm text-slate-600">
            {FACTS[factIdx]}
          </motion.p>
        </div>
      </motion.div>

      <section className="rounded-2xl bg-slate-50/80 p-6 md:p-8">
        <div className="mb-2 flex items-center gap-2">
          <Target className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-slate-800">Evaluation metrics</h2>
        </div>
        <p className="mb-5 text-xs text-slate-500">Macro-averaged scores from `metrics_summary.json` when available.</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Accuracy"
            value={metrics ? pct(metrics.accuracy) : last ? pct(last.val_accuracy) : "—"}
            suffix={metrics || last ? "%" : undefined}
            Icon={CheckCircle}
            foot={metrics ? "Test subset (training script)" : last ? "Last epoch val accuracy" : undefined}
            delay={0}
            trend="up"
          >
            {training.length ? <MiniTrend data={training} dataKey="val_accuracy" color="#0d9488" /> : null}
          </KpiCard>
          <KpiCard
            label="Precision (macro)"
            value={metrics ? pct(metrics.precision_macro) : "—"}
            suffix={metrics ? "%" : undefined}
            Icon={Activity}
            foot="Unweighted mean over classes"
            delay={0.05}
            trend="flat"
          >
            {training.length ? <MiniTrend data={training} dataKey="val_loss" color="#64748b" /> : null}
          </KpiCard>
          <KpiCard
            label="Recall (macro)"
            value={metrics ? pct(metrics.recall_macro) : "—"}
            suffix={metrics ? "%" : undefined}
            Icon={Layers}
            foot="Unweighted mean over classes"
            delay={0.1}
            trend="flat"
          />
          <KpiCard
            label="F1 score (macro)"
            value={metrics ? pct(metrics.f1_macro) : "—"}
            suffix={metrics ? "%" : undefined}
            Icon={TrendingUp}
            foot="Harmonic mean of precision & recall"
            delay={0.15}
            trend="flat"
          />
        </div>
      </section>

      <section className="rounded-2xl bg-emerald-50/40 p-6 md:p-8">
        <div className="mb-2 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-slate-800">Target conditions</h2>
        </div>
        <p className="mb-4 text-xs text-slate-600">Field context for model classes — not a substitute for veterinary diagnosis.</p>
        <DiseaseContextCards />
      </section>

      <section className="rounded-2xl bg-slate-50/80 p-6 md:p-8">
        <div className="mb-2 flex items-center gap-2">
          <ChevronRight className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-slate-800">Disease distribution (evaluation sample)</h2>
        </div>
        <p className="mb-4 text-xs text-slate-500">From `dashboard_data.json`.</p>
        <motion.div
          className="h-56 rounded-xl border border-slate-200/90 bg-white p-3 min-w-0 min-h-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {distData.length ? (
            <ResponsiveContainer width="100%" height={224} minWidth={0} minHeight={0} debounce={50}>
              <BarChart data={distData} margin={{ top: 8, right: 8, left: 4, bottom: 28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={48} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  formatter={(v: any) => [v, "Count"]}
                  labelFormatter={(_, payload) => (payload?.[0]?.payload as { full?: string })?.full ?? ""}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar
                  dataKey="n"
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">No dashboard export found.</div>
          )}
        </motion.div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-slate-800">Figure previews</h2>
        </div>
        <Tabs defaultValue="eda" className="w-full">
          <TabsList className="bg-slate-100/90">
            <TabsTrigger value="eda" className="gap-1.5">
              <BarChart2 className="h-3.5 w-3.5" />
              EDA
            </TabsTrigger>
            <TabsTrigger value="train" className="gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Training curves
            </TabsTrigger>
          </TabsList>
          <TabsContent value="eda" className="mt-4 rounded-xl bg-slate-50/80 p-4 md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <VizImage src="/static/eda_plots/01_class_dist_bar.png" alt="Class distribution" delay={0} />
              <VizImage src="/static/eda_plots/03_sample_image_grid.png" alt="Sample grid" delay={0.05} />
            </div>
          </TabsContent>
          <TabsContent value="train" className="mt-4 rounded-xl bg-slate-50/80 p-4 md:p-6">
            {training.length ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <LossCurveChart data={training} chartKey="dash-loss" />
                <AccuracyCurveChart data={training} chartKey="dash-acc" />
              </div>
            ) : (
              <p className="text-sm text-slate-500">Add `model/training_log.csv` by running training.</p>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
