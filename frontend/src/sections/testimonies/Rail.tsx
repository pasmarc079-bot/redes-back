import { useEffect, useRef, useState, type ReactNode } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface RailProps {
  /** Visible heading for the strip. Also used as its accessible name. */
  title: string;
  tone: 'dark' | 'light';
  children: ReactNode;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Horizontal, keyboard-scrollable strip with previous/next controls on pointer devices.
 * Touch users swipe; keyboard users focus the strip and use the arrow keys.
 */
export default function Rail({ title, tone, children }: RailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setOverflows(max > 4);
      setAtStart(el.scrollLeft <= 4);
      setAtEnd(el.scrollLeft >= max - 4);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, []);

  const step = (direction: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>('[data-rail-item]');
    const gap = 20;
    const distance = item ? item.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * distance, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  const isDark = tone === 'dark';
  const button = `inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-35 ${
    isDark
      ? 'border-cream/25 text-cream hover:border-gold hover:text-gold focus-visible:ring-gold/50'
      : 'border-dark/20 text-dark hover:border-gold-ink hover:text-gold-ink focus-visible:ring-gold/40'
  } press`;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className={`font-heading text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-cream/80' : 'text-dark-light'}`}>{title}</h3>
        {overflows && (
          <div className="hidden items-center gap-2 md:flex">
            <button type="button" className={button} onClick={() => step(-1)} disabled={atStart} aria-label={`Ver anteriores en ${title.toLowerCase()}`}>
              <FiChevronLeft size={20} aria-hidden="true" />
            </button>
            <button type="button" className={button} onClick={() => step(1)} disabled={atEnd} aria-label={`Ver siguientes en ${title.toLowerCase()}`}>
              <FiChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <div
        ref={ref}
        role="region"
        tabIndex={0}
        aria-label={title}
        className={`rail -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-5 pt-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold md:mx-0 md:scroll-px-0 md:px-0 ${isDark ? 'rail-dark' : 'rail-light'}`}
      >
        <ul className="flex w-max gap-5">{children}</ul>
      </div>
    </div>
  );
}
