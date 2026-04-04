import { motion } from "framer-motion";
import { 
  Monitor, 
  Cpu, 
  Database, 
  FileCode, 
  FileJson, 
  ImageIcon, 
  Layers, 
  Layout, 
  Network, 
  Server, 
  ShieldCheck, 
  Zap 
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.4, 
      ease: [0.25, 0.1, 0.25, 1.0] as any 
    } 
  }
};

type NodeProps = {
  icon: any;
  title: string;
  desc: string;
  color: string;
};

function ArchNode({ icon: Icon, title, desc, color }: NodeProps) {
  return (
    <motion.div variants={item} className="group relative">
      <div className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-${color}-200 hover:shadow-md`}>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-${color}-50 text-${color}-700 ring-1 ring-${color}-100`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-900">{title}</p>
          <p className="truncate text-[10px] text-slate-500">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function ArchitectureDiagram() {
  return (
    <div className="space-y-12 py-4 max-w-full overflow-hidden">
      {/* Layer 1: Client */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800">1. Client Layer (Web Browser)</h3>
        </div>
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <ArchNode icon={Layout} title="React SPA" desc="Vite + Tailwind CSS" color="blue" />
          <ArchNode icon={ImageIcon} title="Upload UI" desc="Standardized image ingestion" color="blue" />
          <ArchNode icon={Zap} title="Result Display" desc="Prediction + Grad-CAM visualization" color="blue" />
          <ArchNode icon={ShieldCheck} title="Disease Ref" desc="Interactive guidance & checklist" color="blue" />
        </motion.div>
      </section>

      <div className="flex justify-center">
        <motion.div 
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          className="h-8 w-px bg-slate-200"
        />
      </div>

      {/* Layer 2: Flask Server */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-emerald-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">2. Backend Layer (Flask REST API)</h3>
        </div>
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <ArchNode icon={FileCode} title="Main Application" desc="app.py Routing & Logic" color="emerald" />
          <ArchNode icon={Network} title="Inference Endpoints" desc="POST /predict handler" color="emerald" />
          <ArchNode icon={FileJson} title="Analytics API" desc="GET /api/training-log" color="emerald" />
        </motion.div>
      </section>

      <div className="flex justify-center">
        <motion.div 
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          className="h-8 w-px bg-slate-200"
        />
      </div>

      {/* Layer 3: Inference Pipeline */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-amber-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">3. Inference Pipeline (AI Core)</h3>
        </div>
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <ArchNode icon={Layers} title="Preprocessing" desc="OpenCV Decode/Resize" color="amber" />
          <ArchNode icon={Cpu} title="EfficientNet Core" desc="Feature extraction & classification" color="amber" />
          <ArchNode icon={Zap} title="Saliency Mapping" desc="Grad-CAM visualization" color="amber" />
          <ArchNode icon={FileJson} title="Response Builder" desc="Serialized JSON output" color="amber" />
        </motion.div>
      </section>

      <div className="flex justify-center">
        <motion.div 
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          className="h-8 w-px bg-slate-200"
        />
      </div>

      {/* Layer 4: Storage */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-purple-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-800">4. Data & Model Storage</h3>
        </div>
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <ArchNode icon={Database} title="Model Registry" desc=".keras Weight files" color="purple" />
          <ArchNode icon={FileCode} title="Log Storage" desc="training_log.csv" color="purple" />
          <ArchNode icon={ImageIcon} title="Asset Store" desc="EDA & Training plot exports" color="purple" />
        </motion.div>
      </section>

      <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <p className="text-center font-mono text-[11px] font-medium text-blue-900">
          Output Classes: Coccidiosis | Healthy | Newcastle | Salmonella
        </p>
      </div>
    </div>
  );
}
