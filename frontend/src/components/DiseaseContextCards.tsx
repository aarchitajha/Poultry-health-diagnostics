import { motion } from "framer-motion";
import { AlertTriangle, Biohazard, Heart, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  {
    name: "Coccidiosis",
    hint: "Protozoal enteric disease — watch stool & growth.",
    Icon: Biohazard,
  },
  {
    name: "Healthy",
    hint: "Baseline flock appearance for model contrast.",
    Icon: Heart,
  },
  {
    name: "Newcastle disease",
    hint: "Viral — respiratory & nervous signs in severe cases.",
    Icon: Zap,
  },
  {
    name: "Salmonella",
    hint: "Bacterial — food safety & biosecurity relevance.",
    Icon: AlertTriangle,
  },
];

export function DiseaseContextCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((d, i) => (
        <motion.div
          key={d.name}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-24px" }}
          transition={{ delay: i * 0.05, duration: 0.35 }}
        >
          <Card className="h-full border-slate-200/90 bg-white shadow-none">
            <CardContent className="flex gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-900">
                <d.Icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{d.name}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{d.hint}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
