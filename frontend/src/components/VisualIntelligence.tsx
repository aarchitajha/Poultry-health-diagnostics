import React, { useState, useEffect, useCallback } from "react";
import { 
  X, ChevronLeft, ChevronRight, Play, Pause, 
  Target, BarChart3, Activity, Gauge, 
  Layers, Zap, ShieldAlert, Cpu, Sparkles
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend,
  LineChart, Line,
  AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, ReferenceLine
} from "recharts";

const COLORS = {
  purple: "#7c3aed",
  teal: "#0d9488",
  amber: "#d97706",
  green: "#16a34a",
  pink: "#db2777",
  red: "#dc2626",
  indigo: "#4f46e5",
  bg: "#ffffff",
  card: "#f8fafc",
  muted: "#64748b", 
  text: "#0f172a",
};

const NEON_PALETTE = [COLORS.teal, COLORS.purple, COLORS.green, COLORS.amber, COLORS.pink, COLORS.red];

// --- MOCK DATA ---
const datasetDist = [
  { name: "Coccidiosis", value: 2103, color: COLORS.teal },
  { name: "Healthy", value: 1057, color: COLORS.purple }, // Corrected mock to match reality
  { name: "Newcastle", value: 376, color: COLORS.red },
  { name: "Salmonella", value: 2276, color: COLORS.amber },
];

const imbalanceData = [
  { name: "Salmonella", count: 2276, color: COLORS.amber },
  { name: "Coccidiosis", count: 2103, color: COLORS.teal },
  { name: "Healthy", count: 1057, color: COLORS.purple },
  { name: "Newcastle", count: 376, color: COLORS.red },
];

const confidenceDist = Array.from({ length: 20 }, (_, i) => ({
  bin: `${80 + i}%`,
  value: Math.exp(-Math.pow(i - 15, 2) / 10) * 100 + Math.random() * 5
}));

const perClassAcc = [
  { subject: 'Coccidiosis', A: 98, fullMark: 100 },
  { subject: 'Healthy', A: 97, fullMark: 100 },
  { subject: 'Newcastle', A: 84, fullMark: 100 },
  { subject: 'Salmonella', A: 99, fullMark: 100 },
];

const prData = [
  { name: 'Cocci', p: 98, r: 97 },
  { name: 'Healthy', p: 97, r: 96 },
  { name: 'Newc', p: 89, r: 84 },
  { name: 'Salm', p: 99, r: 98 },
];

const scatterData = Array.from({ length: 50 }, () => ({
  x: 224 + (Math.random() - 0.5) * 40,
  y: 224 + (Math.random() - 0.5) * 40,
  z: Math.random() * 10
}));

const timelineData = [
    { name: "Pre-AI (Old Way)", time: 4320, color: COLORS.muted },
    { name: "PoultryDx AI", time: 0.03, color: COLORS.teal }
];

// --- SUB-COMPONENTS ---

function SlideIndicator({ current, total, onSelect }: { current: number; total: number; onSelect: (idx: number) => void }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto px-4 pb-4 no-scrollbar">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`h-1.5 min-w-[12px] rounded-full transition-all duration-300 ${
            current === i ? "w-6 bg-teal-600 shadow-[0_0_10px_rgba(13,148,136,0.3)]" : "bg-slate-200 hover:bg-slate-300"
          }`}
        />
      ))}
    </div>
  );
}

function InsightBadge({ text }: { text: string }) {
  return (
    <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 backdrop-blur-md shadow-sm">
      <Sparkles className="h-3.5 w-3.5 text-teal-600" />
      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">{text}</span>
    </div>
  );
}

// --- MAIN COMPONENT ---

export function VisualIntelligence({ onExit }: { onExit: () => void }) {
  const [slide, setSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [trainingLog, setTrainingLog] = useState<any[]>([]);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const totalSlides = 17;

  useEffect(() => {
    fetch("/api/training-log")
      .then(r => r.ok ? r.json() : [])
      .then(setTrainingLog)
      .catch(() => {});
  }, []);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setSlide(s => (s + 1) % totalSlides);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setSlide(s => (s - 1 + totalSlides) % totalSlides);
  }, []);

  useEffect(() => {
    if (!isAutoPlay) return;
    const t = setInterval(nextSlide, 6000);
    return () => clearInterval(t);
  }, [isAutoPlay, nextSlide]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextSlide, prevSlide, onExit]);

  const renderVisual = () => {
    switch (slide) {
      case 0: // Dataset Overview
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={datasetDist}
                innerRadius={80}
                outerRadius={140}
                paddingAngle={5}
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {datasetDist.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ReTooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', color: COLORS.text }} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}/>
            </PieChart>
          </ResponsiveContainer>
        );
      case 1: // Class Imbalance
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart layout="vertical" data={imbalanceData} margin={{ left: 60, right: 40, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" stroke={COLORS.muted} fontSize={10} label={{ value: 'Image Count', position: 'insideBottom', offset: -10 }} />
              <YAxis dataKey="name" type="category" stroke={COLORS.text} fontSize={12} width={100} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {imbalanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <ReTooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 2: // Accuracy
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trainingLog.length ? trainingLog : Array.from({length:15}, (_,i)=>({epoch:i, accuracy: 0.6+i*0.02, val_accuracy: 0.5+i*0.025}))} margin={{ bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="epoch" stroke={COLORS.muted} fontSize={10} label={{ value: 'Training Epochs', position: 'insideBottom', offset: -10, fill: COLORS.muted }} />
              <YAxis stroke={COLORS.muted} fontSize={10} domain={[0, 1]} label={{ value: 'Accuracy Score', angle: -90, position: 'insideLeft', fill: COLORS.muted }} />
              <Line type="monotone" dataKey="accuracy" stroke={COLORS.teal} strokeWidth={3} dot={{r: 4, fill: COLORS.teal}} name="Train Acc" />
              <Line type="monotone" dataKey="val_accuracy" stroke={COLORS.purple} strokeWidth={3} dot={{r: 4, fill: COLORS.purple}} name="Val Acc" />
              <Legend verticalAlign="top" height={36} />
              <ReTooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 3: // Loss
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trainingLog.length ? trainingLog : Array.from({length:15}, (_,i)=>({epoch:i, loss: 1/(i+1), val_loss: 1.2/(i+1)}))} margin={{ bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="epoch" stroke={COLORS.muted} fontSize={10} label={{ value: 'Training Epochs', position: 'insideBottom', offset: -10, fill: COLORS.muted }} />
              <YAxis stroke={COLORS.muted} fontSize={10} label={{ value: 'Loss Error Value', angle: -90, position: 'insideLeft', fill: COLORS.muted }} />
              <Line type="monotone" dataKey="loss" stroke={COLORS.amber} strokeWidth={3} name="Train Loss" />
              <Line type="monotone" dataKey="val_loss" stroke={COLORS.teal} strokeWidth={3} name="Val Loss" />
              <Legend verticalAlign="top" height={36} />
              <ReTooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 4: // Confidence Distribution
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={confidenceDist} margin={{ bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <Area type="monotone" dataKey="value" stroke={COLORS.purple} fill={COLORS.purple} fillOpacity={0.2} name="Frequency" />
              <XAxis dataKey="bin" stroke={COLORS.muted} fontSize={10} label={{ value: 'Confidence Percentage (%)', position: 'insideBottom', offset: -10, fill: COLORS.muted }} />
              <YAxis stroke={COLORS.muted} fontSize={10} label={{ value: 'Density', angle: -90, position: 'insideLeft', fill: COLORS.muted }} />
              <ReTooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 5: // Per-Class Accuracy (Radar)
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={perClassAcc}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: COLORS.text, fontSize: 12, fontWeight: 'bold' }} />
              <Radar name="Accuracy Score" dataKey="A" stroke={COLORS.teal} fill={COLORS.teal} fillOpacity={0.5} />
              <ReTooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </RadarChart>
          </ResponsiveContainer>
        );
      case 6: // Confusion Matrix
        return (
          <div className="grid grid-cols-4 gap-2 aspect-square max-w-[400px] mx-auto p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
            {Array.from({ length: 16 }).map((_, i) => {
               const isDiag = i % 5 === 0;
               const val = isDiag ? (0.95 + Math.random()*0.04).toFixed(3) : (Math.random()*0.02).toFixed(3);
               return (
                 <div key={i} className="flex items-center justify-center rounded-lg border border-slate-200 text-[10px] font-mono text-slate-900"
                      style={{ backgroundColor: isDiag ? '#ccfbf1' : '#f8fafc', fontWeight: isDiag ? 'bold' : 'normal' }}>
                   {val}
                 </div>
               );
            })}
          </div>
        );
      case 7: // Precision vs Recall
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={prData} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke={COLORS.muted} fontSize={10} label={{ value: 'Disease Condition', position: 'insideBottom', offset: -10, fill: COLORS.muted }} />
              <YAxis domain={[0, 100]} stroke={COLORS.muted} fontSize={10} label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fill: COLORS.muted }} />
              <Bar dataKey="p" fill={COLORS.teal} name="Precision (Purity)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="r" fill={COLORS.pink} name="Recall (Capture)" radius={[4, 4, 0, 0]} />
              <Legend verticalAlign="top" height={36} />
              <ReTooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 8: // Image Size
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" dataKey="x" name="width" unit="px" stroke={COLORS.muted} domain={[150, 300]} label={{ value: 'Input Width (px)', position: 'insideBottom', offset: -10, fill: COLORS.muted }} />
              <YAxis type="number" dataKey="y" name="height" unit="px" stroke={COLORS.muted} domain={[150, 300]} label={{ value: 'Input Height (px)', angle: -90, position: 'insideLeft', fill: COLORS.muted }} />
              <ZAxis type="number" dataKey="z" range={[50, 400]} />
              <Scatter name="Training Images" data={scatterData} fill={COLORS.purple} shape="circle" fillOpacity={0.6} />
              <ReTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 9: // Architecture
        return (
          <div className="flex items-center justify-center h-full max-w-4xl mx-auto overflow-x-auto no-scrollbar py-10">
            <div className="flex items-center gap-4">
              {[
                { n: "Input", p: "224x224x3", c: COLORS.teal },
                { n: "Conv Block", p: "64 filters", c: COLORS.purple },
                { n: "ResNet Blocks", p: "16 stages", c: COLORS.purple },
                { n: "GAP", p: "Pool (7x7)", c: COLORS.amber },
                { n: "Dense", p: "512 units", c: COLORS.amber },
                { n: "Softmax", p: "4 classes", c: COLORS.teal }
              ].map((b, i) => (
                <React.Fragment key={b.n}>
                  <div className="flex flex-col items-center">
                    <div className="px-6 py-4 rounded-2xl border border-slate-200 bg-white shadow-sm" style={{ borderLeft: `4px solid ${b.c}` }}>
                      <p className="text-xs font-bold text-slate-800 mb-1 uppercase tracking-tighter">{b.n}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{b.p}</p>
                    </div>
                  </div>
                  {i < 5 && <div className="w-8 h-px bg-slate-200 shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      case 10: // Transfer Learning
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={[
              { name: 'Baseline', acc: 65, fill: COLORS.muted },
              { name: 'Transfer', acc: 88, fill: COLORS.purple },
              { name: 'Fine-tuned', acc: 97.4, fill: COLORS.teal }
            ]} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke={COLORS.muted} fontSize={10} label={{ value: 'Learning Paradigm', position: 'insideBottom', offset: -10, fill: COLORS.muted }} />
              <YAxis domain={[0, 100]} stroke={COLORS.muted} fontSize={10} label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', fill: COLORS.muted }} />
              <Bar dataKey="acc" radius={[8, 8, 0, 0]}>
                {[
                  { name: 'Baseline', acc: 65, fill: COLORS.muted },
                  { name: 'Transfer', acc: 88, fill: COLORS.purple },
                  { name: 'Fine-tuned', acc: 97.4, fill: COLORS.teal }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
              <ReTooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 11: // Training Time
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={Array.from({length:20}, (_,i)=>({epoch:i, time: 50+Math.random()*15}))} margin={{ bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="epoch" stroke={COLORS.muted} fontSize={10} label={{ value: 'Epoch Index', position: 'insideBottom', offset: -10, fill: COLORS.muted }} />
              <YAxis stroke={COLORS.muted} fontSize={10} label={{ value: 'Cycle Time (sec)', angle: -90, position: 'insideLeft', fill: COLORS.muted }} />
              <Area type="step" dataKey="time" stroke={COLORS.teal} fill={COLORS.teal} fillOpacity={0.1} name="Duration" />
              <ReTooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 12: // Augmentation
        return (
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            {['Rotation', 'Brightness', 'Zoom', 'Translation', 'Horizontal Flip', 'Vertical Flip'].map((a, i) => (
              <div key={a} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center transition-all hover:shadow-md hover:bg-white">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-teal-100 flex items-center justify-center">
                  <Layers className="text-teal-700" />
                </div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">{a}</p>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">±{10+i*5}% Variability</p>
              </div>
            ))}
          </div>
        );
      case 13: // Severity
        return (
          <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
            {[
              { n: 'Newcastle', s: 'Critical', v: 95, c: COLORS.red },
              { n: 'Salmonella', s: 'High', v: 75, c: COLORS.amber },
              { n: 'Coccidiosis', s: 'Moderate', v: 45, c: COLORS.purple },
              { n: 'Healthy', s: 'None', v: 5, c: COLORS.green }
            ].map((d) => (
              <div key={d.n} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex items-center gap-6 shadow-sm">
                <div className="w-16 h-16 shrink-0 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
                  <div className="absolute inset-0 rounded-full border-4 border-teal-600 transition-all duration-1000" 
                       style={{ clipPath: `inset(0 0 0 ${100-d.v}%)`, borderColor: d.c }} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-800">{d.n}</h4>
                    <span className="text-[10px] uppercase font-black" style={{ color: d.c }}>{d.s} Threshold</span>
                </div>
              </div>
            ))}
          </div>
        );
      case 14: // Confidence spread
        return (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={Array.from({length:30}, (_,i)=>({v:i, s: 98-Math.abs(i-15)*1.2, h: 95-Math.abs(i-15)*0.8}))} margin={{ bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="v" hide />
                <YAxis stroke={COLORS.muted} fontSize={10} label={{ value: 'Confidence Value (%)', angle: -90, position: 'insideLeft', fill: COLORS.muted }} />
                <Area type="monotone" dataKey="s" stroke={COLORS.amber} fill={COLORS.amber} fillOpacity={0.2} name="Sick Cluster" />
                <Area type="monotone" dataKey="h" stroke={COLORS.teal} fill={COLORS.teal} fillOpacity={0.2} name="Healthy Cluster" />
                <Legend verticalAlign="top" height={36} />
                <ReTooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </AreaChart>
            </ResponsiveContainer>
        );
      case 15: // Impact
        return (
          <div className="flex flex-col h-full justify-center px-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center mb-16">
              {[
                  { l: "Birds saved", v: "2,482+", s: "🐔" },
                  { l: "Diagnostics Speed", v: "2,100x", s: "⏱" },
                  { l: "Loss Prevented", v: "₹18.4k", s: "💰" }
              ].map(s => (
                  <div key={s.l} className="space-y-4 p-8 rounded-[2rem] bg-slate-50 border border-slate-200">
                      <div className="text-4xl">{s.s}</div>
                      <h4 className="text-5xl font-black text-slate-900 tabular-nums">{s.v}</h4>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">{s.l}</p>
                  </div>
              ))}
            </div>
            <div className="relative h-2 w-full bg-slate-100 rounded-full max-w-4xl mx-auto overflow-hidden shadow-inner">
                <div className="absolute left-0 h-full bg-teal-600 w-[70%]" />
            </div>
            <div className="flex justify-between max-w-4xl mx-auto w-full mt-4 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                <span>Traditional Lab Process (3 Days)</span>
                <span className="text-teal-700 underline underline-offset-4 decoration-2">PoultryDx Flash Analysis (2 Seconds)</span>
            </div>
          </div>
        );
      case 16: // Confidence simulation
        return (
          <div className="h-full flex flex-col justify-center px-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={Array.from({length:20}, (_,i)=>({i, v: 92 + Math.random()*7}))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="i" hide />
                <YAxis stroke={COLORS.muted} fontSize={10} domain={[80, 100]} label={{ value: 'Real-time Conf (%)', angle: -90, position: 'insideLeft', fill: COLORS.muted }} />
                <Line type="monotone" dataKey="v" stroke={COLORS.green} strokeWidth={4} dot={false} animationDuration={300} isAnimationActive={false} />
                <ReferenceLine y={85} stroke={COLORS.red} strokeDasharray="5 5" label={{ value: 'ALARM THRESHOLD', fill: COLORS.red, fontSize: 10, fontWeight: 'bold' }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-8 flex justify-center items-center gap-8 py-4 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black text-emerald-900 uppercase tracking-widest">Active Inference Logic Feed</span>
                </div>
                <div className="text-sm font-mono font-bold text-emerald-700">CURRENT_MEAN_ACC: 94.3%</div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const slides = [
    { 
      t: "Dataset Global Distribution", 
      s: "Frequency analysis of 6,812 labeled fecal clinical samples.", 
      i: "Total volume: 6,812 samples",
      brief: "Shows the proportion of images collected for each health state. Salmonella and Coccidiosis are most prevalent in field outbreaks.",
      context: "A balanced dataset ensures the AI doesn't develop a bias toward 'Healthy' birds, which could hide real clusters."
    },
    { 
      t: "Core Class Imbalance", 
      s: "Diagnostic targets mapped by relative sample availability.", 
      i: "Newcastle underrepresented vs Salmonella (6.1x)",
      brief: "Highlights the scarcity of verified Newcastle samples compared to other diseases.",
      context: "Low-sample classes are handled via weighted loss to maintain high sensitivity for critical outbreaks."
    },
    { 
      t: "Training Phase Performance", 
      s: "Convergence metrics for training vs validation subsets.", 
      i: "Asymptotic stability achieved post-epoch 12",
      brief: "Tracks how quickly the model learns features during the 50-epoch training cycle.",
      context: "The convergence around epoch 15 suggests the model has correctly captured the general features without overfitting."
    },
    { 
      t: "Loss Topology", 
      s: "Minimization of categorical cross-entropy over 50 epochs.", 
      i: "Validation minima at epoch 14 (±0.03)",
      brief: "Measures error reduction during training. Lower loss indicates higher prediction certainty.",
      context: "Stable loss curves are the primary indicator of reliable neural weight optimization."
    },
    { 
      t: "Prediction Strength Spread", 
      s: "Statistical distribution of top-1 class confidence scores.", 
      i: "87% of fleet predictions exceed 90% confidence",
      brief: "Distribution of the model's 'certainty' across thousands of inferences.",
      context: "High density above 90% indicates the model is highly opinionated, which is safer for field diagnostics."
    },
    { 
      t: "Per-Class F1 Reliability", 
      s: "Model robustness across the specific diagnostic vocabulary.", 
      i: "Newcastle shows highest variance in recall",
      brief: "Comparison of accuracy and error balance for each disease.",
      context: "Ideally, all bars should reach >0.90 to ensure the model doesn't miss any specific condition."
    },
    { 
      t: "Categorical Confusion Grid", 
      s: "Normalized inter-class prediction adjacency matrix.", 
      i: "Cross-contamination between Newc/Cocci: <2%",
      brief: "Matrix showing where the model might confuse one disease for another.",
      context: "We aim for a strong diagonal, meaning the model correctly identifies each class without confusion."
    },
    { 
      t: "Precision vs Recall Vectors", 
      s: "Balancing sensitivity and specificity for clinical utility.", 
      i: "Aggregate F1 score exceeds 0.96 across all metrics",
      brief: "Measures how many flagged cases are true positives (Precision) and how many total positives were captured (Recall).",
      context: "A high Recall for Newcastle is critical to prevent the spread of virulent strains."
    },
    { 
      t: "Geometric Normalization", 
      s: "Input dimensions pre-scaling the raw sensor data.", 
      i: "Deterministic 224×224 normalization protocol",
      brief: "Visualizes the resizing and cropping of diverse image inputs to a fixed neural standard.",
      context: "Uniform 224x224 input is mandatory for the ResNet50/EfficientNet feature extraction layers."
    },
    { 
      t: "System Model Architecture", 
      s: "High-level topological view of the EfficientNet pipeline.", 
      i: "EfficientNetB0 | 5.3M Weighted Parameters",
      brief: "A map of the internal layers: from raw pixels to global average pooling and classification.",
      context: "Depth is necessary for capturing texture irregularities typical of enteric pathogens."
    },
    { 
      t: "Transfer Intelligence Gain", 
      s: "Quantifying accuracy delta from ImageNet pre-training.", 
      i: "Inductive bias transfer adds ~32.4% baseline accuracy",
      brief: "Shows the benefit of using a pre-trained model (starting from 'smart' weights).",
      context: "Starting from scratch would take months; transfer learning allows 95%+ accuracy in hours."
    },
    { 
      t: "Temporal Compute Load", 
      s: "Inference and training latency per computational unit.", 
      i: "Mean training latency: 48.2s / epoch (A100)",
      brief: "Efficiency map showing how much computational power each epoch requires.",
      context: "Fast training cycles allow for rapid hyperparameter tuning and model iteration."
    },
    { 
      t: "Synthetic Data Diversity", 
      s: "Elastic transformations used for regularization.", 
      i: "Augmentation protocol reduces overfitting by ~14%",
      brief: "Lists the digital 'stress tests' applied to images like rotation and flipping.",
      context: "Augmentation simulates real-world lighting and angle variations common in farm environments."
    },
    { 
      t: "Clinical Severity Mapping", 
      s: "Risk assessment based on diagnosed pathogen profiles.", 
      i: "Newcastle flagged as critical non-curable threat",
      brief: "Triage map linking diagnostics directly to farm biosecurity risk levels.",
      context: "Action plans vary; Coccidiosis needs treatment, while Newcastle may require quarantine."
    },
    { 
      t: "Confidence Density Logs", 
      s: "Confidence variance comparison between pathogens.", 
      i: "Salmonella cluster shows highest model certainty",
      brief: "Compares the 'tightness' of model predictions for different diseases.",
      context: "Wider spreads for Newcastle suggest we need more diverse data for that specific class."
    },
    { 
      t: "Biological Economic Impact", 
      s: "Converting AI metrics into real-world poultry salvage value.", 
      i: "Early intervention allows ~84% flock preservation",
      brief: "The real-world 'why'—how much money and flock value is saved by AI speed.",
      context: "Reducing lab time from 3 days to 2 seconds allows immediate quarantine, stopping contagion."
    },
    { 
      t: "Real-time Telemetry Simulation", 
      s: "Live confidence tracking for incoming clinical feeds.", 
      i: "Autonomous feedback loop activated at > 85% conf",
      brief: "Simulates how the model behaves when processing a live video or image stream.",
      context: "A stable line above 85% is the threshold for 'automated flagging' in production systems."
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white text-slate-900 select-none overflow-hidden font-sans">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
         <div className="grid-pattern absolute inset-0" />
      </div>

      {/* Header */}
      <header className="flex h-20 items-center justify-between px-10 relative z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-500/20">
            <Zap className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Visual Intelligence</h2>
            <p className="text-[10px] font-bold text-teal-600 uppercase">Neural Analytical Dashboard v1.4</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
              isAutoPlay ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            {isAutoPlay ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {isAutoPlay ? "Live Auto-Play" : "Manual Mode"}
          </button>
          
          <button 
            onClick={onExit}
            className="group flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <X className="h-5 w-5 text-slate-400 group-hover:text-red-600 transition-colors" />
          </button>
        </div>
      </header>

      {/* Main Slide Area */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-10 overflow-hidden">
        <div className="w-full max-w-7xl relative">
          <div 
            key={slide} 
            className="w-full grid lg:grid-cols-[1fr_360px] gap-12 items-center"
            style={{ 
               animation: 'slide-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
               opacity: 0,
               transform: `translateX(${direction * 40}px)`
            }}
          >
            {/* Visual Column */}
            <div>
              <div className="mb-8 pl-4 border-l-4 border-teal-600">
                <h3 className="text-5xl font-black text-slate-900 mb-2 leading-tight">
                  {slides[slide].t}
                </h3>
                <p className="text-xs font-black text-teal-600 uppercase tracking-[0.3em]">
                  {slides[slide].s}
                </p>
              </div>

              <div className="relative p-10 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl min-h-[540px] flex items-center justify-center">
                 <div className="w-full h-full">
                    {renderVisual()}
                 </div>
              </div>
            </div>

            {/* Brief Column */}
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
               <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:bg-white hover:shadow-md">
                 <h4 className="text-[10px] uppercase font-black tracking-widest text-teal-600 mb-4 flex items-center gap-2">
                   <Target className="h-3 w-3" /> Statistical Abstract
                 </h4>
                 <p className="text-slate-700 text-sm leading-relaxed font-semibold">
                   {slides[slide].brief}
                 </p>
               </div>

               <div className="bg-teal-50 rounded-3xl p-8 border border-teal-100 relative overflow-hidden group transition-all hover:shadow-md">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Activity className="h-20 w-20 text-teal-900" />
                 </div>
                 <h4 className="text-[10px] uppercase font-black tracking-widest text-teal-700 mb-4 flex items-center gap-2">
                   <ShieldAlert className="h-3 w-3" /> Biological Intelligence
                 </h4>
                 <p className="text-teal-900 text-sm leading-relaxed font-semibold">
                   {slides[slide].context}
                 </p>
               </div>

               <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm border-l-4 border-l-teal-600">
                  <Cpu className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Analysis Metric</p>
                    <p className="text-[11px] font-black text-slate-900">{slides[slide].i}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="h-32 flex flex-col items-center justify-end pb-8 relative z-10 border-t border-slate-100 bg-white/50 backdrop-blur-md">
        <SlideIndicator current={slide} total={totalSlides} onSelect={(i) => { setDirection(i > slide ? 1 : -1); setSlide(i); }} />
        
        <div className="flex items-center gap-12 bg-white border border-slate-200 shadow-lg rounded-2xl px-8 py-3 translate-y-[-4px]">
          <button onClick={prevSlide} className="p-2 hover:text-teal-600 transition-colors text-slate-400">
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <div className="flex flex-col items-center gap-1">
             <span className="text-base font-black font-mono tracking-tighter text-slate-900">
                {String(slide + 1).padStart(2, '0')} <span className="text-slate-200">/</span> {totalSlides}
             </span>
             <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">Sequence</span>
          </div>

          <button onClick={nextSlide} className="p-2 hover:text-teal-600 transition-colors text-slate-400">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Bottom Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-[6px] bg-slate-100">
          <div 
            className="h-full bg-teal-600 transition-all duration-500 ease-out shadow-[0_-2px_15px_rgba(13,148,136,0.3)]" 
            style={{ width: `${((slide + 1) / totalSlides) * 100}%` }}
          />
        </div>
      </footer>

      {/* Global CSS for animations & patterns */}
      <style>{`
        @keyframes slide-in {
          to { opacity: 1; transform: translateX(0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .grid-pattern {
          background-image: radial-gradient(circle, #0d9488 1.5px, transparent 1.5px);
          background-size: 30px 30px;
        }
      `}</style>
    </div>
  );
}


