import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Zap, Target, Activity, Cpu, Maximize2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartLightbox } from "@/components/ChartLightbox";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5000";

export function VisualIntelligence({ onExit }: { onExit: () => void }) {
  const [plots, setPlots] = useState<{ filename: string; title: string; src: string }[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`${API_BASE}/api/eda-plots`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        // Filter out junk or specific indices if needed
        const filtered = data.filter((_: any, index: number) => index !== 15);
        setPlots(filtered);
      })
      .catch(() => {
        const fallback = [
          { filename: "01_class_dist_bar.png", title: "Class Distribution – Bar Chart", src: "/static/eda_plots/01_class_dist_bar.png" },
          { filename: "02_class_dist_pie.png", title: "Class Distribution – Pie Chart", src: "/static/eda_plots/02_class_dist_pie.png" },
          { filename: "03_sample_image_grid.png", title: "Sample Image Grid", src: "/static/eda_plots/03_sample_image_grid.png" },
          { filename: "04_pixel_intensity.png", title: "Pixel Intensity Distribution", src: "/static/eda_plots/04_pixel_intensity.png" },
          { filename: "05_image_dimension.png", title: "Image Dimension Analysis", src: "/static/eda_plots/05_image_dimension.png" },
          { filename: "06_color_channel_hm.png", title: "Color Channel Heatmaps", src: "/static/eda_plots/06_color_channel_hm.png" },
          { filename: "07_data_aug_showcase.png", title: "Data Augmentation Showcase", src: "/static/eda_plots/07_data_aug_showcase.png" },
          { filename: "08_corr_heatmap.png", title: "Feature Correlation Heatmap", src: "/static/eda_plots/08_corr_heatmap.png" },
          { filename: "09_class_mean_heatmap.png", title: "Per-Class Mean Pixel Heatmap", src: "/static/eda_plots/09_class_mean_heatmap.png" },
          { filename: "10_confusion_matrix.png", title: "Model Confusion Matrix", src: "/static/train_plots/10_confusion_matrix.png" }
        ];
        setPlots(fallback);
      });
  }, []);

  const handleImageError = (filename: string) => {
    setFailedImages(prev => ({ ...prev, [filename]: true }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white text-slate-900 select-none overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="grid-pattern absolute inset-0" />
      </div>

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

        <button
          onClick={onExit}
          className="group flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-colors"
        >
          <X className="h-5 w-5 text-slate-400 group-hover:text-red-600 transition-colors" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-10 py-12 custom-scrollbar relative z-10 pb-32">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="pl-4 border-l-4 border-teal-600">
            <h3 className="text-3xl font-black text-slate-900 mb-1 leading-tight tracking-tight">
              Clinical Visual Insights
            </h3>
            <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.3em]">
              Deep Feature Analysis & Statistical Distributions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {plots.map((plot, i) => {
              if (failedImages[plot.filename]) return null;
              
              return (
                <motion.div
                  key={plot.filename}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.015 }}
                  className="cursor-pointer group"
                  onClick={() => setSelectedIdx(i)}
                >
                  <Card className="rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white hover:border-teal-400 hover:shadow-md transition-all duration-200">
                    <div className="px-3 py-2 flex items-center justify-between bg-white border-b border-slate-50">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Badge variant="secondary" className="font-mono text-[9px] px-1.5 h-4 shrink-0 bg-slate-100 text-slate-500">
                          {String(i + 1).padStart(2, '0')}
                        </Badge>
                        <span className="text-sm font-semibold text-slate-700 truncate">
                          {plot.title}
                        </span>
                      </div>
                      <Maximize2 className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="w-full h-full bg-slate-50/50 flex items-center justify-center relative overflow-hidden">
                      <img
                        src={plot.src.startsWith('http') ? plot.src : `${API_BASE}${plot.src}`}
                        alt={plot.title}
                        className="w-full max-h-[260px] object-contain"
                        loading="lazy"
                        onError={() => handleImageError(plot.filename)}
                      />
                      <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/[0.02] transition-colors pointer-events-none" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="h-16 flex items-center justify-between px-10 border-t border-slate-100 bg-white/50 backdrop-blur-md relative z-10 mt-auto">
        <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Target className="h-3 w-3 text-teal-600" />
            <span>Diagnostic Accuracy Optimized</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-teal-600" />
            <span>Real-time Inference Logs Active</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
          <Cpu className="h-3 w-3" />
          <span>EFFNET-B0 HYPER-OPTIMIZED PIPELINE</span>
        </div>
      </footer>

      <ChartLightbox
        plots={plots}
        currentIndex={selectedIdx}
        onClose={() => setSelectedIdx(null)}
        onNavigate={setSelectedIdx}
      />

      <style>{`
        .grid-pattern {
          background-image: radial-gradient(circle, #0d9488 1.5px, transparent 1.5px);
          background-size: 30px 30px;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}


