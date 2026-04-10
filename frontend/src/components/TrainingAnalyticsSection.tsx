import { motion } from "framer-motion";
import { BarChart2, CircleDot, Cpu, ImageIcon, Layers, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetricsSummary } from "@/components/DashboardHome";

type Dash = { classes: string[]; counts: number[]; accuracy: number };

type CmPayload = { labels: string[]; matrix: number[][] };

const COLORS = ["#0d9488", "#0369a1", "#b45309", "#b91c1c"];

function heatColor(v: number) {
  const a = Math.min(1, Math.max(0, v));
  return `rgba(13, 148, 136, ${0.12 + a * 0.78})`;
}

export function TrainingAnalyticsSection({ metrics, dash }: { metrics: MetricsSummary | null; dash: Dash | null }) {
  const [cm, setCm] = useState<CmPayload | null>(null);

  useEffect(() => {
    fetch("/static/train_plots/confusion_matrix.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.labels && Array.isArray(j.matrix)) setCm(j as CmPayload);
        else setCm(null);
      })
      .catch(() => setCm(null));
  }, []);

  const donutData = useMemo(
    () =>
      dash?.classes.map((name, i) => ({
        name,
        value: dash.counts[i] ?? 0,
        color: COLORS[i % COLORS.length],
      })) ?? [],
    [dash],
  );

  const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

  const perf = metrics
    ? [
        { label: "Accuracy", value: metrics.accuracy, Icon: Target },
        { label: "Precision", value: metrics.precision_macro, Icon: CircleDot },
        { label: "Recall", value: metrics.recall_macro, Icon: CircleDot },
        { label: "F1-score", value: metrics.f1_macro, Icon: CircleDot },
      ]
    : [];

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-wrap items-center gap-2 text-slate-900">
        <BarChart2 className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
        <h2 className="text-base font-semibold">Training log & analytics</h2>
      </div>

      <Card className="border-slate-200/90 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Cpu className="h-4 w-4 text-slate-600" strokeWidth={1.75} />
            Model configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { Icon: Cpu, t: "ResNet50 backbone", s: "ImageNet pre-train" },
            { Icon: ImageIcon, t: "224 × 224 input", s: "RGB, standardized" },
            { Icon: Layers, t: "Transfer learning", s: "Frozen then partial unfreeze" },
            { Icon: Target, t: "4 output classes", s: "Softmax classifier" },
          ].map((row) => (
            <div key={row.t} className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-teal-800 shadow-sm">
                <row.Icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">{row.t}</p>
                <p className="text-[11px] text-slate-500">{row.s}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/90 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Dataset distribution (eval sample)</CardTitle>
          </CardHeader>
          <CardContent className="h-64 min-w-0 min-h-0">
            {donutData.length ? (
              <ResponsiveContainer width="100%" height={256} minWidth={0} minHeight={0} debounce={50}>
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={2}
                    isAnimationActive
                    animationDuration={900}
                  >
                    {donutData.map((e) => (
                      <Cell key={e.name} fill={e.color} stroke="#fff" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [v, "Count"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">Load dashboard_data.json from training.</p>
            )}
            {donutData.length ? (
              <ul className="mt-2 flex flex-wrap justify-center gap-3 text-[11px] text-slate-600">
                {donutData.map((d) => (
                  <li key={d.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Confusion matrix (normalized)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {cm ? (
              <table className="w-full min-w-[280px] border-collapse text-center text-xs">
                <thead>
                  <tr>
                    <th className="p-1 text-slate-400">Actual \ Pred</th>
                    {cm.labels.map((l) => (
                      <th key={l} className="p-1 font-medium text-slate-600">
                        {l.slice(0, 4)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cm.matrix.map((row, i) => (
                    <tr key={cm.labels[i]}>
                      <td className="p-1 text-left font-medium text-slate-600">{cm.labels[i]}</td>
                      {row.map((cell, j) => (
                        <td key={`${i}-${j}`} className="p-1">
                          <motion.div
                            className="rounded px-1 py-2 font-mono tabular-nums text-slate-900"
                            style={{ backgroundColor: heatColor(cell) }}
                            initial={{ opacity: 0, scale: 0.92 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: (i * row.length + j) * 0.03 }}
                          >
                            {cell.toFixed(2)}
                          </motion.div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-500">Run training to emit confusion_matrix.json (or use the static heatmap figure below).</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/90 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Model performance summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {perf.length ? (
            perf.map((m, i) => (
              <div key={m.label} className="space-y-2">
                <div className="flex items-center gap-2">
                  <m.Icon className="h-4 w-4 text-teal-700" strokeWidth={1.75} />
                  <span className="text-xs font-medium text-slate-700">{m.label}</span>
                </div>
                <p className="text-lg font-semibold tabular-nums text-slate-900">{pct(m.value)}</p>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className="h-full rounded-full bg-teal-700"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min(100, m.value * 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">Metrics appear after metrics_summary.json is generated.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
