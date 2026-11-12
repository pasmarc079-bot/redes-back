import { useState } from 'react';
import { FiPlay } from 'react-icons/fi';
import type { TestimonialVideo } from '@/types';
import { extractYouTubeId } from '@/utils/youtube';

interface TestimonyVideoCardProps {
  video: TestimonialVideo;
}

/**
 * The poster is shown first. The player loads only after a click, so the page stays light
 * and audio never starts without a deliberate action from the visitor.
 */
export default function TestimonyVideoCard({ video }: TestimonyVideoCardProps) {
  const [playing, setPlaying] = useState(false);
  const youtubeId = video.sourceType === 'youtube' ? extractYouTubeId(video.videoUrl) : null;
  const poster = video.posterUrl || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : null);

  return (
    <article data-rail-item className="w-[56vw] max-w-[240px] shrink-0 snap-start sm:w-[220px]">
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-dark-light shadow-[0_12px_30px_-12px_rgb(0_0_0/0.6)] ring-1 ring-cream/10">
        {playing ? (
          youtubeId ? (
            <iframe
              className="absolute inset-0 h-full w-full border-0"
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`}
              title={video.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              className="absolute inset-0 h-full w-full bg-black object-cover"
              src={video.videoUrl}
              poster={poster || undefined}
              controls
              autoPlay
              playsInline
              preload="none"
              aria-label={video.title}
            />
          )
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="testimony-tile group absolute inset-0 flex h-full w-full flex-col justify-end text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-gold"
            aria-label={`Reproducir testimonio con sonido: ${video.title}`}
          >
            {poster ? (
              <img src={poster} alt="" loading="lazy" className="testimony-poster absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="absolute inset-0 bg-gradient-to-br from-dark-light via-dark to-gold/25" aria-hidden="true" />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-dark via-dark/30 to-transparent" aria-hidden="true" />
            <span className="testimony-play absolute left-1/2 top-[42%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-dark shadow-xl" aria-hidden="true">
              <FiPlay size={22} className="ml-0.5" />
            </span>
            <span className="relative z-10 block px-4 pb-5">
              <span className="block font-heading text-sm font-semibold leading-snug text-cream">{video.title}</span>
              <span className="mt-1 block text-xs text-cream/70">Toca para escuchar</span>
            </span>
          </button>
        )}
      </div>
    </article>
  );
}
