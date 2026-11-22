import { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiPause, FiPlay } from 'react-icons/fi';
import { useSiteStore } from '@/stores/siteStore';
import { parseGalleryImages, parseGalleryInterval } from '@/utils/communityGallery';

interface CommunityGalleryProps {
  /** Slightly different heading per page, while the photos and behaviour stay the same. */
  variant?: 'home' | 'community';
}

/** How many photos fit in the strip, from the smallest screen up. */
const CARD_BREAKPOINTS = [
  { query: '(min-width: 1280px)', cards: 5 },
  { query: '(min-width: 1024px)', cards: 4 },
  { query: '(min-width: 768px)', cards: 3 },
  { query: '(min-width: 640px)', cards: 2 },
];

const cardWidthClasses = 'w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5';

function useCardsPerView() {
  const [cards, setCards] = useState(1);

  useEffect(() => {
    const lists = CARD_BREAKPOINTS.map((item) => ({ ...item, mql: window.matchMedia(item.query) }));
    const update = () => setCards(lists.find((item) => item.mql.matches)?.cards ?? 1);
    update();
    lists.forEach((item) => item.mql.addEventListener('change', update));
    return () => lists.forEach((item) => item.mql.removeEventListener('change', update));
  }, []);

  return cards;
}

/**
 * Photos of the community, shown before "Nuestras redes" as a strip of several photos at once.
 * It advances on its own but stops while the visitor hovers, focuses or pauses it, and never
 * animates when reduced motion is requested.
 */
export default function CommunityGallery({ variant = 'home' }: CommunityGalleryProps) {
  const settings = useSiteStore((state) => state.settings);
  const images = parseGalleryImages(settings.community_gallery);
  const intervalSeconds = parseGalleryInterval(settings.community_gallery_interval);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [step, setStep] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsPerView = useCardsPerView();

  const total = images.length;
  const lastIndex = Math.max(0, total - cardsPerView);
  const canAutoplay = intervalSeconds > 0 && lastIndex > 0;

  useEffect(() => {
    if (index > lastIndex) setIndex(lastIndex);
  }, [index, lastIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const first = track.firstElementChild as HTMLElement | null;
      setStep(first ? first.getBoundingClientRect().width : 0);
    };
    measure();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [total, cardsPerView]);

  useEffect(() => {
    if (!canAutoplay || paused || hovered) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current >= lastIndex ? 0 : current + 1));
    }, intervalSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [canAutoplay, intervalSeconds, paused, hovered, lastIndex]);

  if (total === 0) return null;

  const go = (direction: -1 | 1) => {
    setIndex((current) => {
      const next = current + direction;
      if (next < 0) return lastIndex;
      if (next > lastIndex) return 0;
      return next;
    });
  };

  return (
    <section
      data-nav-theme="light"
      className={
        variant === 'home'
          ? 'bg-cream pt-12 pb-14 md:pt-16 md:pb-16'
          // On Comunidad the testimonies above already end with a large bottom padding and share the
          // same cream background, so adding section-padding here doubled the gap between them.
          : 'bg-cream px-4 pb-16 md:px-8 md:pb-24 lg:px-16'
      }
      aria-labelledby={`gallery-title-${variant}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      <div className="container-custom">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 font-heading text-xs uppercase tracking-[0.2em] text-gold-ink">Comunidad</p>
            <h2 id={`gallery-title-${variant}`} className="font-display text-3xl tracking-wider text-dark md:text-4xl">
              Nuestra comunidad en fotos
            </h2>
          </div>
          {lastIndex > 0 && (
            <div className="flex items-center gap-2">
              {canAutoplay && (
                <button
                  type="button"
                  onClick={() => setPaused((current) => !current)}
                  className="press inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-dark/15 bg-white text-dark hover:border-gold hover:text-gold-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/40"
                  aria-label={paused ? 'Reanudar el cambio automático de fotos' : 'Pausar el cambio automático de fotos'}
                  aria-pressed={paused}
                >
                  {paused ? <FiPlay aria-hidden="true" /> : <FiPause aria-hidden="true" />}
                </button>
              )}
              <button
                type="button"
                onClick={() => go(-1)}
                className="press inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-dark/15 bg-white text-dark hover:border-gold hover:text-gold-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/40"
                aria-label="Fotos anteriores"
              >
                <FiChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="press inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-dark/15 bg-white text-dark hover:border-gold hover:text-gold-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/40"
                aria-label="Fotos siguientes"
              >
                <FiChevronRight aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <div
          className="relative overflow-hidden"
          role="group"
          aria-roledescription="carrusel"
          aria-label="Fotos de la comunidad"
        >
          <div
            ref={trackRef}
            className="flex transition-transform duration-700 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${index * step}px)` }}
          >
            {images.map((image, imageIndex) => (
              <div
                key={image.id}
                className={`${cardWidthClasses} shrink-0 px-1.5 md:px-2`}
                aria-roledescription="diapositiva"
                aria-label={`${imageIndex + 1} de ${total}`}
              >
                <figure className="relative overflow-hidden rounded-2xl bg-dark ring-1 ring-dark/10">
                  <div className="aspect-[4/5] w-full">
                    <img
                      src={image.imageUrl}
                      alt={image.alt || image.caption || 'Foto de la comunidad del Ministerio REDES'}
                      className="h-full w-full object-cover"
                      loading={imageIndex < cardsPerView ? 'eager' : 'lazy'}
                    />
                  </div>
                  {image.caption && (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark/90 to-transparent px-4 py-3 font-heading text-sm text-cream">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              </div>
            ))}
          </div>
        </div>

        {lastIndex > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {Array.from({ length: lastIndex + 1 }, (_, position) => (
              <button
                key={position}
                type="button"
                onClick={() => setIndex(position)}
                className={`h-2.5 rounded-full transition-all ${position === index ? 'w-6 bg-gold-dark' : 'w-2.5 bg-dark/20 hover:bg-dark/40'}`}
                aria-label={`Ver el grupo de fotos ${position + 1}`}
                aria-current={position === index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
