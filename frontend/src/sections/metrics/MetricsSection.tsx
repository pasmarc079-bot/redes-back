import { useEffect, useRef, useState } from 'react';
import { useSiteStore } from '@/stores/siteStore';
import { formatMetricNumber, parseSiteMetrics, type SiteMetric } from '@/utils/siteMetrics';

const DURATION_MS = 1200;

/** Ease-out so the counter slows down near its value instead of stopping abruptly. */
const easeOut = (progress: number) => 1 - Math.pow(1 - progress, 3);

function Counter({ value, suffix, start }: { value: number; suffix: string; start: boolean }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!start) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setShown(value);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / DURATION_MS);
      setShown(Math.round(easeOut(progress) * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, value]);

  return (
    <>
      {/* The animated number is hidden from assistive tech; the final value is read once. */}
      <span aria-hidden="true">{formatMetricNumber(shown)}{suffix}</span>
      <span className="sr-only">{formatMetricNumber(value)}{suffix}</span>
    </>
  );
}

function MetricItem({ metric, start }: { metric: SiteMetric; start: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="font-display text-5xl tracking-wider text-gold-dark md:text-6xl">
        <Counter value={metric.value} suffix={metric.suffix} start={start} />
      </p>
      <p className="font-heading text-[11px] uppercase tracking-[0.18em] text-dark-light md:text-xs">{metric.label}</p>
    </div>
  );
}

/**
 * Numbers of the ministry, placed between "Nuestra Iglesia" and the testimonies.
 * They animate once, the first time the section enters the viewport, and respect reduced motion.
 */
export default function MetricsSection() {
  const raw = useSiteStore((state) => state.settings.metrics_items);
  const metrics = parseSiteMetrics(raw);
  const sectionRef = useRef<HTMLElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      setStart(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setStart(true);
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (metrics.length === 0) return null;

  return (
    <section ref={sectionRef} data-nav-theme="light" className="border-y border-gold/25 bg-white py-14 md:py-16" aria-labelledby="metrics-title">
      <div className="container-custom">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <p className="font-heading text-xs uppercase tracking-[0.2em] text-gold-ink">Nuestra trayectoria</p>
          <h2 id="metrics-title" className="mt-2 font-display text-3xl tracking-wider text-dark md:text-4xl">
            Lo que Dios ha hecho
          </h2>
        </div>
        <ul className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {metrics.map((metric) => (
            <li key={metric.id}>
              <MetricItem metric={metric} start={start} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
