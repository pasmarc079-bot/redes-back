import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import { FiPause, FiPlay } from 'react-icons/fi';

export interface CarouselSlide {
  id: string;
  /** Receives whether this slide is the visible one, so content can run its own entrance. */
  render: (active: boolean) => ReactNode;
}

interface CarouselProps {
  /** Accessible name for the whole carousel. */
  label: string;
  slides: CarouselSlide[];
  /** Advance automatically. Reduced-motion visitors start paused; they can still navigate. */
  autoplay?: boolean;
  /** Milliseconds between slides. Zero or less means the carousel never advances on its own. */
  intervalMs?: number;
  className?: string;
  /** Value for data-nav-theme so the navbar matches the slide surface. */
  navTheme?: 'dark' | 'light';
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Crossfading carousel with dots, a pause control and keyboard support.
 * Autoplay holds while the visitor hovers or focuses inside it, so it never moves under their hand.
 * Inactive slides are hidden from assistive tech and from the tab order.
 */
export default function Carousel({ label, slides, autoplay = true, intervalMs = 6000, className = '', navTheme }: CarouselProps) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  // null = the visitor has not decided yet, so the carousel follows the configured autoplay.
  // A boolean = the visitor pressed the control and their choice wins.
  const [choice, setChoice] = useState<boolean | null>(null);
  const playing = choice ?? (autoplay && !prefersReducedMotion());
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const current = count === 0 ? 0 : Math.min(index, count - 1);
  const canAdvance = count > 1 && playing && !hovered && !focused && intervalMs > 0;

  // Restarting the timer on every change gives each slide its full interval, including after a manual pick.
  useEffect(() => {
    if (!canAdvance) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => window.clearInterval(id);
  }, [canAdvance, count, intervalMs, current]);

  const go = (target: number) => setIndex(((target % count) + count) % count);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (count < 2) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(current + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(current - 1);
    }
  };

  return (
    <section
      aria-roledescription="carrusel"
      aria-label={label}
      data-nav-theme={navTheme}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <div className="absolute inset-0" aria-live={playing ? 'off' : 'polite'}>
        {slides.map((slide, i) => {
          const active = i === current;
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${count}`}
              aria-hidden={!active}
              className={`absolute inset-0 transition-[opacity,visibility] duration-700 ease-out motion-reduce:transition-none ${
                active ? 'visible z-10 opacity-100' : 'invisible z-0 opacity-0'
              }`}
            >
              {slide.render(active)}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <div
            role="group"
            aria-label="Elegir diapositiva"
            onKeyDown={onKeyDown}
            className="absolute inset-x-0 bottom-3 z-20 flex justify-center md:bottom-6"
          >
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Ver diapositiva ${i + 1}`}
                aria-current={i === current ? 'true' : undefined}
                className="group flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/60"
              >
                <span
                  aria-hidden="true"
                  className={`block h-2.5 rounded-full transition-[width,background-color] duration-300 ease-out motion-reduce:transition-none ${
                    i === current ? 'w-7 bg-gold' : 'w-2.5 bg-cream/50 group-hover:bg-cream/80'
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setChoice(!playing)}
            aria-label={playing ? 'Pausar carrusel' : choice === false ? 'Reanudar carrusel' : 'Iniciar carrusel'}
            className="absolute bottom-2 left-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 bg-dark/40 text-cream transition-colors duration-200 ease-out hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 md:bottom-5 md:left-8"
          >
            {playing ? <FiPause size={16} aria-hidden="true" /> : <FiPlay size={16} aria-hidden="true" />}
          </button>
        </>
      )}
    </section>
  );
}
