import { useEffect, useState } from 'react';
import { FiCalendar } from 'react-icons/fi';
import type { Event } from '@/types';

interface EventImageProps {
  event: Event;
  className: string;
}

/**
 * The flyer comes from the event itself: the admin uploads it to the media library and that is
 * what the site shows. If there is no flyer, or it fails to load, a calm placeholder is shown.
 */
export default function EventImage({ event, className }: EventImageProps) {
  const flyerUrl = event.flyerUrl?.trim();
  const [source, setSource] = useState<string | undefined>(flyerUrl || undefined);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSource(flyerUrl || undefined);
    setFailed(false);
  }, [flyerUrl]);

  if (!source || failed) {
    return <ImagePlaceholder className={className} />;
  }

  return (
    <img
      src={source}
      alt={event.title}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
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
