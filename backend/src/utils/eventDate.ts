/**
 * Ecuador has a single offset all year (no daylight saving), so a fixed -05:00 is exact for
 * America/Guayaquil.
 */
const ECUADOR_UTC_OFFSET = '-05:00';

/** `datetime-local` inputs send `2026-12-06T17:30`, without any timezone information. */
const NAIVE_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

/**
 * Converts a date coming from the admin into a real instant. A value typed without timezone is
 * understood as Ecuador local time; otherwise it is stored as a naive string and read as UTC,
 * which is what made an event entered at 17:30 look like 12:30 in the public site.
 */
export const parseEventDate = (value: string): Date => {
  const trimmed = value.trim();
  const withZone = NAIVE_DATE_TIME.test(trimmed) ? `${trimmed}${ECUADOR_UTC_OFFSET}` : trimmed;
  return new Date(withZone);
};

export const isValidEventDate = (value: string): boolean => !Number.isNaN(parseEventDate(value).getTime());
