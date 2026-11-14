import { useEffect, useState } from 'react';
import { useSiteStore } from '@/stores/siteStore';
import HeroSlideView from '@/sections/hero/HeroSlideView';
import type { HeroSlide } from '@/utils/heroSlides';

export const HERO_PREVIEW_MESSAGE = 'redes:hero-preview';
export const HERO_PREVIEW_READY = 'redes:hero-preview-ready';

/**
 * Standalone page used by the admin preview. It shows one slide with the real cover component,
 * inside a viewport of its own, so what the editor shows is what the visitor will see.
 */
export default function HeroPreview() {
  const { settings } = useSiteStore();
  const [slide, setSlide] = useState<HeroSlide | null>(null);
  const logoUrl = settings.logo_url || '/logo.svg';

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { meta.remove(); };
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      if (!event.data || event.data.type !== HERO_PREVIEW_MESSAGE) return;
      setSlide(event.data.slide ?? null);
    };

    window.addEventListener('message', onMessage);
    // The editor waits for this signal before sending the first draft.
    window.parent?.postMessage({ type: HERO_PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  if (!slide) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark text-sm text-cream/70">
        Esperando el mensaje del editor…
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-dark">
      <HeroSlideView slide={slide} active primary logoUrl={logoUrl} staticButtons />
    </div>
  );
}
