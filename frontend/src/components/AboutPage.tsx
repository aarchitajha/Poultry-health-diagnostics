import { motion } from "framer-motion";
import { BookOpen, Cpu, FlaskConical, Info, LineChart, Microscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const blocks = [
  {
    title: "Overview",
    Icon: Microscope,
    body: "PoultryDx is a research-oriented dashboard for image-based screening of common poultry health conditions. It combines exploratory analysis, model training telemetry, and a controlled upload interface for inference.",
  },
  {
    title: "Problem",
    Icon: BookOpen,
    body: "Early detection of diseases such as coccidiosis, Newcastle disease, and Salmonella-related presentation supports flock welfare and reduces economic loss. Manual inspection does not scale; consistent imaging and ML-assisted triage can prioritize veterinary follow-up.",
  },
  {
    title: "Industry relevance",
    Icon: LineChart,
    body: "Broiler and layer operations depend on rapid health signals. Decision support tools must remain transparent: clear metrics, calibrated uncertainty, and saliency-style views help staff trust model output without replacing expert diagnosis.",
  },
  {
    title: "ML approach",
    Icon: FlaskConical,
    body: "A ResNet50 backbone (ImageNet pre-trained) with a small trainable head performs multi-class classification on fixed-resolution RGB images. Training uses standard augmentation, learning-rate scheduling, and held-out evaluation with ROC/PR and confusion-matrix reporting.",
  },
];

const stack = [
  "Python · TensorFlow / Keras",
  "Flask API",
  "React · TypeScript · Vite",
  "Recharts · Plotly",
  "OpenCV (preprocessing & saliency overlay)",
  "Matplotlib · Seaborn (static study figures)",
];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
          <Info className="h-7 w-7 text-teal-700" strokeWidth={1.5} />
          About this project
        </h1>
      </motion.div>

      <div className="space-y-4">
        {blocks.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
          >
            <Card className="border-slate-200/90 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                  <b.Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <CardTitle className="text-base font-semibold">{b.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm leading-relaxed text-slate-600">{b.body}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
      >
        <Card className="border-slate-200/90 bg-slate-50/80 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
            <Cpu className="h-4 w-4 text-teal-700" strokeWidth={1.75} />
            <CardTitle className="text-base font-semibold">Technologies</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-600">
              {stack.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
