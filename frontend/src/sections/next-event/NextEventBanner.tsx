import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMapPin } from 'react-icons/fi';
import { eventsApi } from '@/services/api';
import type { Event } from '@/types';

const MONTHS_SHORT = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

const formatDayMonth = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return { day: String(date.getDate()), month: MONTHS_SHORT[date.getMonth()] };
};

const formatFullDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es-EC', { hour: 'numeric', minute: '2-digit' });
};

/**
 * Announcement strip under the hero: when something is coming up, the visitor sees it right away
 * instead of having to scroll to the events section.
 *
 * It is deliberately not a modal: it never interrupts, and the visitor can keep reading.
 * On phones the date chip is dropped so the title stays visible without scrolling.
 */
export default function NextEventBanner() {
  const [event, setEvent] = useState<Event | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    eventsApi
      .getAll(1, 1, false)
      .then((res) => {
        if (active) setEvent(res.data.events?.[0] ?? null);
      })
      .catch(() => {
        if (active) setEvent(null);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => { active = false; };
  }, []);

  if (!loaded || !event) return null;

  const day = formatDayMonth(event.startDate);
  const time = formatTime(event.startDate);
  const fullDate = formatFullDate(event.startDate);
  const isOngoing = event.status === 'ONGOING';

  return (
    <section aria-label={`${isOngoing ? 'En curso' : 'Próximo evento'}: ${event.title}`} className="border-t border-gold/20 bg-dark-light">
      <div className="container-custom flex flex-col items-center gap-3 py-4 text-center md:flex-row md:items-center md:justify-between md:gap-4 md:text-left">
        <div className="flex min-w-0 flex-col items-center gap-3 md:flex-row md:items-start md:gap-4">
          {day && (
            <span className="hidden h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-gold/40 bg-gold/10 leading-none sm:flex">
              <span className="font-display text-2xl text-gold">{day.day}</span>
              <span className="mt-0.5 text-[10px] font-semibold tracking-wider text-gold/80">{day.month}</span>
            </span>
          )}

          <div className="min-w-0">
            <p className="font-heading text-[11px] uppercase tracking-[0.2em] text-gold">
              {isOngoing ? 'En curso ahora' : 'Próximo evento'}
            </p>
            <p className="mt-1 line-clamp-2 font-heading text-base font-semibold leading-snug text-cream md:text-lg">
              <Link to={`/eventos/${event.slug}`} className="text-cream transition-colors duration-200 ease-out hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60">
                {event.title}
              </Link>
            </p>
            <p className="mt-1 flex flex-col items-center gap-0.5 text-sm text-silver md:flex-row md:items-center md:gap-2">
              {/* On phones the date and the place sit on their own lines: in a single line the
                  separator would break away from the word it belongs to. */}
              <span className="flex items-center gap-2 md:contents">
                {fullDate && <time dateTime={event.startDate} className="md:hidden">{fullDate}</time>}
                {fullDate && time && <span aria-hidden="true" className="md:hidden">·</span>}
                {time && <span>{time}</span>}
              </span>
              {event.location && (
                <span className="inline-flex items-center gap-1">
                  {time && <span aria-hidden="true" className="hidden md:inline">·</span>}
                  <FiMapPin size={13} aria-hidden="true" />
                  {event.location}
                </span>
              )}
            </p>
          </div>
        </div>

        <Link
          to={`/eventos/${event.slug}`}
          className="press btn btn-secondary min-h-10 shrink-0 px-5 text-sm md:min-h-11 md:px-6"
        >
          Ver el evento <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
