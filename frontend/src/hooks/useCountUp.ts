import { useEffect, useState } from "react";

export function useCountUp(target: number, durationMs = 1600, decimals = 0, enabled = true) {
  const [v, setV] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setV(target);
      return;
    }
    setV(0);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 2;
      setV(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, enabled]);

  const factor = 10 ** decimals;
  return Math.round(v * factor) / factor;
}
