import { motion } from "framer-motion";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TrainingRow = {
  epoch: number;
  accuracy: number;
  val_accuracy: number;
  loss: number;
  val_loss: number;
  learning_rate: number;
};

type Props = {
  data: TrainingRow[];
  delay?: number;
  /** Remount to replay draw animation when data/context changes */
  chartKey?: string;
};

export function LossCurveChart({ data, delay = 0, chartKey = "loss" }: Props) {
  return (
    <motion.div
      className="h-[300px] w-full min-w-0 min-h-0"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0} debounce={50}>
        <LineChart key={chartKey} data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="epoch" tick={{ fontSize: 11 }} label={{ value: "Epoch", position: "insideBottom", offset: -4 }} />
          <YAxis tick={{ fontSize: 11 }} label={{ value: "Loss", angle: -90, position: "insideLeft" }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
          <Legend />
          <Line
            type="monotone"
            dataKey="loss"
            name="Train loss"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            isAnimationActive
            animationDuration={1600}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="val_loss"
            name="Val loss"
            stroke="#0f172a"
            strokeWidth={2}
            dot={false}
            isAnimationActive
            animationDuration={1600}
            animationEasing="ease-out"
            animationBegin={200}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function AccuracyCurveChart({ data, delay = 0, chartKey = "acc" }: Props) {
  return (
    <motion.div
      className="h-[300px] w-full min-w-0 min-h-0"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0} debounce={50}>
        <LineChart key={chartKey} data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="epoch" tick={{ fontSize: 11 }} label={{ value: "Epoch", position: "insideBottom", offset: -4 }} />
          <YAxis
            domain={[0, 1]}
            tick={{ fontSize: 11 }}
            label={{ value: "Accuracy", angle: -90, position: "insideLeft" }}
          />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
          <Legend />
          <Line
            type="monotone"
            dataKey="accuracy"
            name="Train acc"
            stroke="#84cc16"
            strokeWidth={2}
            dot={false}
            isAnimationActive
            animationDuration={1600}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="val_accuracy"
            name="Val acc"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            isAnimationActive
            animationDuration={1600}
            animationEasing="ease-out"
            animationBegin={200}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function LearningRateChart({ data, delay = 0, chartKey = "lr" }: Props) {
  return (
    <motion.div
      className="h-[300px] w-full min-w-0 min-h-0"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0} debounce={50}>
        <LineChart key={chartKey} data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="epoch" tick={{ fontSize: 11 }} label={{ value: "Epoch", position: "insideBottom", offset: -4 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            scale="log"
            domain={["auto", "auto"]}
            label={{ value: "Learning rate (log)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
          <Line
            type="monotone"
            dataKey="learning_rate"
            name="LR"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 2 }}
            isAnimationActive
            animationDuration={1600}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
