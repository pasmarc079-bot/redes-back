/** Days as the site writes them; the order starts on Sunday because that is the first service. */
export const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const;

/**
 * Turns the stored label ("9:00 AM", "7:00 pm", "19:00") into the "HH:MM" an `<input type="time">`
 * understands. Anything else returns an empty string, so the picker starts clean.
 */
export function toTimeInputValue(raw?: string | null): string {
  const value = (raw ?? '').trim();
  if (!value) return '';

  const match = value.match(/^(\d{1,2})(?:[:.h](\d{1,2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?)?$/i);
  if (!match) return '';

  let hours = Number(match[1]);
  const minutes = match[2] ? Number(match[2]) : 0;
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes > 59) return '';

  const meridiem = match[3]?.toLowerCase().replace(/[.\s]/g, '');
  if (meridiem === 'am' || meridiem === 'pm') {
    if (hours < 1 || hours > 12) return '';
    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
  } else if (hours > 23) {
    return '';
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Turns the picker value ("09:00", "19:30") into the label the public site shows ("9:00 AM",
 * "7:30 PM"). The site keeps showing the same format as before.
 */
export function fromTimeInputValue(value: string): string {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '';

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return '';

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${String(minutes).padStart(2, '0')} ${suffix}`;
}
