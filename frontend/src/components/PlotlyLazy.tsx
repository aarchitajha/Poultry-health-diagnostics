import Plot from "react-plotly.js";
import { type ComponentProps } from "react";
import { motion } from "framer-motion";

export type PlotlyFigureProps = ComponentProps<typeof Plot>;

export function PlotlyLazy(props: PlotlyFigureProps & { delay?: number; revision?: number }) {
  const { delay = 0, revision = 0, ...plotProps } = props;
  return (
    <motion.div
      className="min-h-[320px] w-full"
      style={{ minHeight: "320px" }}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <Plot
        key={revision}
        {...plotProps}
        style={{ width: "100%", height: "100%", minHeight: 320 }}
        useResizeHandler
        config={{ responsive: true, displayModeBar: true }}
      />
    </motion.div>
  );
}
