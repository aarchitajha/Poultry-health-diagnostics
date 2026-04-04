import { motion } from "framer-motion";
import { ArrowRight, BarChart3, BrainCircuit, ImageIcon, ScanLine, SlidersHorizontal } from "lucide-react";

const steps = [
  {
    key: "input",
    title: "Input",
    subtitle: "Clinical image",
    Icon: ImageIcon,
  },
  {
    key: "pre",
    title: "Preprocessing",
    subtitle: "Resize · ResNet norm",
    Icon: SlidersHorizontal,
  },
  {
    key: "model",
    title: "Model",
    subtitle: "ResNet50 + head",
    Icon: BrainCircuit,
  },
  {
    key: "pred",
    title: "Prediction",
    subtitle: "Softmax · 4 classes",
    Icon: ScanLine,
  },
  {
    key: "viz",
    title: "Visualization",
    subtitle: "CAM · metrics",
    Icon: BarChart3,
  },
];

export function SystemPipelineDiagram() {
  return (
    <div className="w-full rounded-xl bg-slate-50/90 p-6">
      <p className="mb-6 text-sm text-slate-600">
        End-to-end inference path from raw image to interpretable outputs.
      </p>
      <div className="flex flex-wrap items-stretch justify-center gap-2 md:gap-0">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <motion.div
              className="flex w-[140px] flex-col items-center rounded-lg border border-slate-200 bg-white px-3 py-4 text-center shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ delay: i * 0.07, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
                <s.Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <p className="text-xs font-semibold text-slate-900">{s.title}</p>
              <p className="mt-1 text-[10px] leading-snug text-slate-500">{s.subtitle}</p>
            </motion.div>
            {i < steps.length - 1 ? (
              <motion.div
                className="hidden px-1 text-slate-300 md:flex"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.05 }}
                aria-hidden
              >
                <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
              </motion.div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
