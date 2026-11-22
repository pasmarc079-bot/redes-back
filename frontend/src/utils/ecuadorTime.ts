const TIME_ZONE = 'America/Guayaquil';
/** Ecuador has no daylight saving, so the offset is always -05:00. */
const OFFSET_MINUTES = -300;

const partsOf = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
};

/**
 * Value a `datetime-local` input needs to show the same moment the site stores. Using
 * `toISOString()` here showed the UTC hour, so an event at 17:30 appeared as 22:30 in the form.
 */
export function toEcuadorDateTimeInput(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const parts = partsOf(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/**
 * Turns what the admin typed (`2026-12-06T17:30`, meaning 17:30 in Ecuador) into a real instant,
 * so visitors in another timezone see their own equivalent hour instead of a shifted one.
 */
export function fromEcuadorDateTimeInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const local = new Date(`${trimmed}Z`);
    if (Number.isNaN(local.getTime())) return '';
    return new Date(local.getTime() - OFFSET_MINUTES * 60_000).toISOString();
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}
