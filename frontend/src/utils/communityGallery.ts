export interface GalleryImage {
  id: string;
  imageUrl: string;
  /** Describes the photo for screen readers. */
  alt: string;
  caption: string;
}

export const MAX_GALLERY_IMAGES = 12;
export const DEFAULT_GALLERY_INTERVAL_SECONDS = 5;

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

/** Only internal paths and http(s) links; anything else (javascript:, data:) is dropped. */
const safeHref = (value: string) => (/^\/(?!\/)/.test(value) || /^https?:\/\//i.test(value) ? value : '');

export function parseGalleryImages(raw?: string | null): GalleryImage[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  return data.slice(0, MAX_GALLERY_IMAGES).flatMap((item, index): GalleryImage[] => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const imageUrl = safeHref(text(record.imageUrl, 1000));
    if (!imageUrl) return [];
    return [{
      id: text(record.id, 64) || `gallery-${index}`,
      imageUrl,
      alt: text(record.alt, 120),
      caption: text(record.caption, 160),
    }];
  });
}

/** Seconds between photos. Zero pauses the carousel until the visitor uses the arrows. */
export function parseGalleryInterval(value?: string | null): number {
  if (value === undefined || value === null || value.trim() === '') return DEFAULT_GALLERY_INTERVAL_SECONDS;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return DEFAULT_GALLERY_INTERVAL_SECONDS;
  return Math.min(30, Math.floor(parsed));
}
