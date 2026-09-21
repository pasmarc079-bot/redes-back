import { useEffect, useState } from 'react';
import { FiCalendar } from 'react-icons/fi';
import type { Event } from '@/types';

const localEventImages: Record<string, string> = {
  'exaltando-al-padre-2026': '/assets/events/exaltando.png',
  'un-legado-de-amor-para-la-familia': '/assets/events/bautizos.png',
};

interface EventImageProps {
  event: Event;
  className: string;
}

export default function EventImage({ event, className }: EventImageProps) {
  const localFallback = localEventImages[event.slug];
  const initialSource = event.flyerUrl?.includes('dqz0z0z0z')
    ? localFallback
    : event.flyerUrl || localFallback;
  const [source, setSource] = useState<string | undefined>(initialSource);

  useEffect(() => {
    setSource(event.flyerUrl?.includes('dqz0z0z0z') ? localFallback : event.flyerUrl || localFallback);
  }, [event.flyerUrl, localFallback]);

  if (!source) {
    return <ImagePlaceholder className={className} />;
  }

  return (
    <img
      src={source}
      alt={event.title}
      className={className}
      onError={() => {
        if (localFallback && source !== localFallback) {
          setSource(localFallback);
        } else {
          setSource(undefined);
        }
      }}
    />
  );
}

function ImagePlaceholder({ className }: { className: string }) {
  return (
    <div className={`${className} flex items-center justify-center bg-gradient-to-br from-dark to-gold/20`}>
      <FiCalendar className="text-gold text-4xl" aria-hidden="true" />
    </div>
  );
}
