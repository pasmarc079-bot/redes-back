export interface HeroSlide {
  id: string;
  /** Small gold line above the title, e.g. "Ministerio Cristiano". */
  eyebrow: string;
  /** Text between asterisks is drawn in gold, e.g. "nos une *en familia*". */
  title: string;
  subtitle: string;
  location: string;
  ctaLabel: string;
  ctaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  imageUrl: string;
  mobileImageUrl: string;
}

export const MAX_HERO_SLIDES = 5;

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

/** Only internal paths and http(s) links. Anything else (javascript:, data:) is dropped. */
export function safeHref(value: string): string {
  if (/^\/(?!\/)/.test(value) || /^https?:\/\//i.test(value)) return value;
  return '';
}

export function parseHeroSlides(raw?: string | null): HeroSlide[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  return data.slice(0, MAX_HERO_SLIDES).flatMap((item, index): HeroSlide[] => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const title = text(record.title, 160);
    if (!title) return [];
    return [{
      id: text(record.id, 64) || `slide-${index}`,
      eyebrow: text(record.eyebrow, 60),
      title,
      subtitle: text(record.subtitle, 300),
      location: text(record.location, 80),
      ctaLabel: text(record.ctaLabel, 40),
      ctaUrl: safeHref(text(record.ctaUrl, 500)),
      secondaryCtaLabel: text(record.secondaryCtaLabel, 40),
      secondaryCtaUrl: safeHref(text(record.secondaryCtaUrl, 500)),
      imageUrl: safeHref(text(record.imageUrl, 1000)),
      mobileImageUrl: safeHref(text(record.mobileImageUrl, 1000)),
    }];
  });
}

/** Splits "nos une *en familia*" into plain and accented parts, keeping order. */
export function splitAccent(title: string): { text: string; accent: boolean }[] {
  return title
    .split('*')
    .map((part, i) => ({ text: part, accent: i % 2 === 1 }))
    .filter((part) => part.text.length > 0);
}

/**
 * Slides configured in the admin. With none configured, the hero shows the same content it
 * always did (logo, gold title, tagline, location and the two calls to action), so nothing
 * changes on the live site until someone opts in.
 */
export function resolveHeroSlides(
  settings: Record<string, string>,
  legacyContent: { key: string; body: string | null }[],
): HeroSlide[] {
  const configured = parseHeroSlides(settings.hero_slides);
  if (configured.length > 0) return configured;

  const legacy = (key: string) => legacyContent.find((item) => item.key === key)?.body?.trim() || '';
  const title = legacy('hero_title') || 'REDES';
  return [{
    id: 'legacy',
    eyebrow: legacy('hero_subtitle'),
    // Wrapped in asterisks so the brand title keeps its gold colour.
    title: `*${title.replace(/\*/g, '')}*`,
    subtitle: legacy('hero_tagline') || settings.site_tagline || '',
    location: legacy('hero_location'),
    ctaLabel: 'Próximos Eventos',
    ctaUrl: '/eventos',
    secondaryCtaLabel: 'Conócenos',
    secondaryCtaUrl: '/nosotros',
    imageUrl: safeHref(settings.hero_image_url || ''),
    mobileImageUrl: safeHref(settings.hero_image_mobile_url || ''),
  }];
}

export const DEFAULT_HERO_INTERVAL_SECONDS = 6;
export const MIN_HERO_INTERVAL_SECONDS = 0;
export const MAX_HERO_INTERVAL_SECONDS = 60;

/**
 * Seconds between slides, as configured in the admin.
 * Zero means the carousel never changes on its own; out-of-range values fall back to the default.
 */
export function parseIntervalSeconds(value?: string | null): number {
  if (value === undefined || value === null || value.trim() === '') return DEFAULT_HERO_INTERVAL_SECONDS;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_HERO_INTERVAL_SECONDS;
  if (parsed < MIN_HERO_INTERVAL_SECONDS) return MIN_HERO_INTERVAL_SECONDS;
  if (parsed > MAX_HERO_INTERVAL_SECONDS) return MAX_HERO_INTERVAL_SECONDS;
  return Math.floor(parsed);
}
