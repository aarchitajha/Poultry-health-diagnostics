import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

type VizImageProps = {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
};

export function VizImage({ src, alt, className, delay = 0 }: VizImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <motion.div
      className={cn("relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50", className)}
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-24px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {failed ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 p-8 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-700">Plot not generated yet</p>
          <p>Run the EDA or training script to create this asset at:</p>
          <code className="rounded bg-slate-200/80 px-2 py-1 text-xs">{src}</code>
        </div>
      ) : (
        <motion.img
          src={src}
          alt={alt}
          className="h-auto w-full object-contain"
          loading="lazy"
          onError={() => setFailed(true)}
          initial={{ filter: "blur(6px)" }}
          whileInView={{ filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: delay + 0.1 }}
        />
      )}
    </motion.div>
  );
}
