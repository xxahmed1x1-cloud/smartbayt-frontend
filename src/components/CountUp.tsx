import { useEffect, useRef, useState } from "react";

interface Props {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

const CountUp = ({ end, duration = 1800, prefix = "", suffix = "", decimals = 0, className }: Props) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(end * eased);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{val.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}
    </span>
  );
};

export default CountUp;
