/**
 * Darkness of the veil drawn over a photograph, as a percentage.
 * 0 leaves the photo untouched and 100 is the darkest veil. The same value is used by the hero
 * carousel messages and by the cover of every page.
 */
export const MIN_OVERLAY_OPACITY = 0;
export const MAX_OVERLAY_OPACITY = 100;

/** Covers over 70% used to be the fixed look of the site, so unchanged pages stay identical. */
export const DEFAULT_COVER_OVERLAY_OPACITY = 70;
/** Slides saved before the control existed keep the original hero look. */
export const DEFAULT_HERO_OVERLAY_OPACITY = 100;

/** Keeps any stored or typed value between 0 and 100, falling back to `fallback`. */
export function clampOverlayOpacity(value: unknown, fallback = DEFAULT_COVER_OVERLAY_OPACITY): number {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(MAX_OVERLAY_OPACITY, Math.max(MIN_OVERLAY_OPACITY, Math.round(parsed)));
}

/** Inline style for the veil element placed over a cover photo. */
export const overlayVeilStyle = (opacity: unknown, fallback = DEFAULT_COVER_OVERLAY_OPACITY) => ({
  opacity: clampOverlayOpacity(opacity, fallback) / 100,
});
