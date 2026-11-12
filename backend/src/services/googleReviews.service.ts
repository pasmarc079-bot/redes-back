/**
 * Reads the reviews of the church's Google place.
 *
 * Source: Places API (New), Place Details: https://places.googleapis.com/v1/places/{PLACE_ID}
 * Google returns at most 5 reviews per place (sorted by relevance). Requires an API key
 * with the Places API enabled and billing on the project.
 *
 * The key is sent in the X-Goog-Api-Key header and never reaches the browser.
 *
 * Failure policy: if configuration is missing or Google fails, the public site receives an
 * empty list and the testimonials block is hidden. It never breaks the page.
 */

const PLACES_BASE = 'https://places.googleapis.com/v1/places';
const CACHE_TTL_MS = 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
const FIELD_MASK = 'reviews,rating,userRatingCount,displayName,formattedAddress,googleMapsUri';

interface PlacesPlaceRaw {
  reviews?: PlacesReviewRaw[];
  formattedAddress?: string;
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
}

export interface GoogleSummary {
  rating: number | null;
  totalRatings: number;
  profileUrl: string | null;
  /** Address exactly as Google's business profile shows it (used to place the map pin). */
  address: string | null;
  name: string | null;
}

interface PlacesReviewRaw {
  name?: string;
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string };
  publishTime?: string;
}

export interface PublicGoogleReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  reviewDate: string | null;
  order: number;
  isActive: true;
}

export interface GoogleReviewsStatus {
  configured: boolean;
  missing: string[];
  lastSyncAt: string | null;
  lastError: string | null;
  cachedCount: number;
}

const env = () => ({
  apiKey: process.env.GOOGLE_API_KEY?.trim(),
  placeId: process.env.GOOGLE_PLACE_ID?.trim(),
  minRating: Math.min(5, Math.max(1, Number(process.env.GOOGLE_REVIEWS_MIN_RATING) || 4)),
  limit: Math.min(5, Math.max(1, Number(process.env.GOOGLE_REVIEWS_LIMIT) || 5)),
});

const REQUIRED_ENV = ['GOOGLE_API_KEY', 'GOOGLE_PLACE_ID'] as const;

export const getMissingGoogleEnv = (): string[] =>
  REQUIRED_ENV.filter((key) => !process.env[key]?.trim());

let cache: { reviews: PublicGoogleReview[]; summary: GoogleSummary; fetchedAt: number } | null = null;
let lastError: string | null = null;
let inFlight: Promise<PublicGoogleReview[]> | null = null;

async function fetchPlace(): Promise<PlacesPlaceRaw> {
  const { apiKey, placeId } = env();
  const url = `${PLACES_BASE}/${encodeURIComponent(placeId!)}?languageCode=es`;

  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': apiKey!,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Places API request failed (${res.status})`);

  return (await res.json()) as PlacesPlaceRaw;
}

/** Keeps reviews that meet the minimum rating, newest first, and maps them to the public shape. */
export function toPublicReviews(raw: PlacesReviewRaw[], minRating: number, limit: number): PublicGoogleReview[] {
  return raw
    .map((review, index) => ({
      id: review.name || `google-review-${index}`,
      authorName: review.authorAttribution?.displayName?.trim() || 'Usuario de Google',
      rating: Math.round(review.rating ?? 0),
      text: (review.text?.text || review.originalText?.text || '').trim(),
      reviewDate: review.publishTime ?? null,
      order: 0,
      isActive: true as const,
      time: review.publishTime ? Date.parse(review.publishTime) : 0,
    }))
    // Many Google reviews are rating-only (no comment); they still count as social proof.
    .filter((review) => review.rating >= minRating)
    .sort((a, b) => b.time - a.time)
    .slice(0, limit)
    .map(({ time: _ignored, ...review }, index) => ({ ...review, order: index + 1 }));
}

const EMPTY_SUMMARY: GoogleSummary = { rating: null, totalRatings: 0, profileUrl: null, address: null, name: null };

async function refresh(): Promise<PublicGoogleReview[]> {
  const { minRating, limit } = env();
  const place = await fetchPlace();
  const reviews = toPublicReviews(place.reviews ?? [], minRating, limit);
  const summary: GoogleSummary = {
    rating: typeof place.rating === 'number' ? Math.round(place.rating * 10) / 10 : null,
    totalRatings: place.userRatingCount ?? 0,
    profileUrl: place.googleMapsUri ?? null,
    address: place.formattedAddress ?? null,
    name: place.displayName?.text ?? null,
  };
  cache = { reviews, summary, fetchedAt: Date.now() };
  lastError = null;
  return reviews;
}

/** Public summary (average rating, count, profile link). Shares the same cache as the reviews. */
export async function getGoogleSummary(): Promise<GoogleSummary> {
  if (getMissingGoogleEnv().length > 0) return EMPTY_SUMMARY;
  if (!cache) await getGoogleReviews();
  return cache?.summary ?? EMPTY_SUMMARY;
}

/** Returns cached reviews, refreshing when the cache is older than the TTL. Never throws. */
export async function getGoogleReviews(): Promise<PublicGoogleReview[]> {
  if (getMissingGoogleEnv().length > 0) return [];
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.reviews;

  inFlight ??= refresh()
    .catch((error: Error) => {
      lastError = error.message;
      console.warn('[google-reviews]', error.message);
      return cache?.reviews ?? [];
    })
    .finally(() => { inFlight = null; });
  return inFlight;
}

export function getGoogleReviewsStatus(): GoogleReviewsStatus {
  const missing = getMissingGoogleEnv();
  return {
    configured: missing.length === 0,
    missing,
    lastSyncAt: cache ? new Date(cache.fetchedAt).toISOString() : null,
    lastError,
    cachedCount: cache?.reviews.length ?? 0,
  };
}
