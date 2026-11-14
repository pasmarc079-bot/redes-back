import { useSiteStore } from '@/stores/siteStore';
import Carousel from '@/components/ui/Carousel';
import HeroSlideView from '@/sections/hero/HeroSlideView';
import { parseIntervalSeconds, resolveHeroSlides, type HeroSlide } from '@/utils/heroSlides';

export default function HeroSection() {
  const { content, settings } = useSiteStore();
  const slides = resolveHeroSlides(settings, content.hero || []);
  const logoUrl = settings.logo_url || '/logo.svg';
  const intervalSeconds = parseIntervalSeconds(settings.hero_slides_interval);

  return (
    <Carousel
      label="Portada"
      navTheme="dark"
      autoplay={intervalSeconds > 0}
      intervalMs={intervalSeconds * 1000}
      className="h-[calc(100svh-4rem-7rem)] min-h-[560px] bg-dark md:h-[calc(100svh-5rem-7rem)] md:min-h-[660px]"
      slides={slides.map((slide, i) => ({
        id: slide.id,
        render: (active: boolean) => (
          <HeroSlideView slide={slide} active={active} primary={i === 0} logoUrl={logoUrl} />
        ),
      }))}
    />
  );
}

export type { HeroSlide };
