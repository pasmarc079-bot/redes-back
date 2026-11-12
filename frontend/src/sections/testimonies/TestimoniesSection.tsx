import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMapPin, FiStar } from 'react-icons/fi';
import { testimonialsApi } from '@/services/api';
import { useSiteStore } from '@/stores/siteStore';
import { useGoogleSummary } from '@/hooks/useGoogleSummary';
import type { GoogleReview, TestimonialVideo } from '@/types';
import Rail from './Rail';
import TestimonyVideoCard from './TestimonyVideoCard';
import GoogleReviewCard from './GoogleReviewCard';

interface TestimoniesSectionProps {
  /** `home` shows a short preview and links to Comunidad. `community` shows everything. */
  variant?: 'home' | 'community';
}

const HOME_VIDEO_LIMIT = 4;
const HOME_REVIEW_LIMIT = 4;

export default function TestimoniesSection({ variant = 'community' }: TestimoniesSectionProps) {
  const settings = useSiteStore((state) => state.settings);
  const summary = useGoogleSummary();
  const [videos, setVideos] = useState<TestimonialVideo[]>([]);
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([testimonialsApi.getVideos(), testimonialsApi.getReviews()])
      .then(([videoRes, reviewRes]) => {
        if (videoRes.status === 'fulfilled') setVideos(videoRes.value.data);
        if (reviewRes.status === 'fulfilled') setReviews(reviewRes.value.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const isHome = variant === 'home';
  const shownVideos = isHome ? videos.slice(0, HOME_VIDEO_LIMIT) : videos;
  const shownReviews = isHome ? reviews.slice(0, HOME_REVIEW_LIMIT) : reviews;
  const reviewUrl = settings.google_review_url?.trim();
  const profileUrl = summary?.profileUrl || settings.google_maps_url?.trim() || '';
  const hasRating = summary?.rating != null && summary.totalRatings > 0;

  // Reserve the space while loading so the page does not jump when content arrives.
  if (loading) {
    return (
      <section className={`section-padding ${isHome ? 'bg-dark' : 'bg-cream'}`} aria-busy="true" aria-label="Cargando testimonios">
        <div className="container-custom">
          <div className="mx-auto mb-12 h-20 max-w-md animate-pulse rounded-xl bg-current/10" />
          <div className="flex gap-5 overflow-hidden">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-[9/16] w-[64vw] max-w-[240px] shrink-0 animate-pulse rounded-2xl bg-current/10 sm:w-[220px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // The invitation is worth showing even before there is a single review: that is exactly how
  // the first ones are collected. The rails below hide themselves when they have no content.
  if (videos.length === 0 && reviews.length === 0 && !reviewUrl) return null;

  const onDark = isHome;

  return (
    <section
      data-nav-theme={onDark ? 'dark' : 'light'}
      className={`section-padding ${onDark ? 'bg-dark text-cream' : 'bg-cream text-dark'}`}
      aria-labelledby="testimonies-title"
    >
      <div className="container-custom">
        <header className="mx-auto mb-12 max-w-3xl text-center">
          <p className={`mb-3 font-heading text-sm uppercase tracking-[0.2em] ${onDark ? 'text-gold' : 'text-gold-ink'}`}>Testimonios</p>
          <h2 id="testimonies-title" className={`font-display text-4xl tracking-wider md:text-5xl ${onDark ? 'text-cream' : 'text-dark'}`}>
            Lo que dice nuestra comunidad
          </h2>

          {hasRating && (
            <p className={`mt-5 flex items-center justify-center gap-2 text-sm ${onDark ? 'text-cream/80' : 'text-dark-light'}`}>
              <FiStar className="fill-gold text-gold" size={16} aria-hidden="true" />
              <span className={`font-heading text-base font-semibold ${onDark ? 'text-cream' : 'text-dark'}`}>{summary!.rating!.toFixed(1)}</span>
              <span>de 5 · {summary!.totalRatings} {summary!.totalRatings === 1 ? 'valoración' : 'valoraciones'} en Google</span>
            </p>
          )}

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {reviewUrl && (
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="press btn btn-primary min-h-11 min-w-[200px]"
                aria-label="Dejar una reseña en Google (se abre en una pestaña nueva)"
              >
                Déjanos tu reseña
              </a>
            )}
            {!isHome && profileUrl && (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`press btn min-h-11 min-w-[200px] ${onDark ? 'border-gold text-gold hover:bg-gold hover:text-dark btn-secondary' : 'btn-secondary'}`}
                aria-label="Ver el perfil de la iglesia en Google (se abre en una pestaña nueva)"
              >
                <FiMapPin aria-hidden="true" /> Ver perfil en Google
              </a>
            )}
            {isHome && (
              <Link to="/comunidad" className={`press inline-flex min-h-11 items-center gap-2 px-4 font-heading text-sm font-semibold ${onDark ? 'text-gold hover:text-gold-light' : 'text-gold-ink'}`}>
                Ver todos los testimonios <FiArrowRight aria-hidden="true" />
              </Link>
            )}
          </div>
        </header>

        {shownVideos.length > 0 && (
          <div className={shownReviews.length > 0 ? 'mb-14' : ''}>
            <Rail title="Videos de la comunidad" tone={onDark ? 'dark' : 'light'}>
              {shownVideos.map((video) => (
                <li key={video.id} className="contents">
                  <TestimonyVideoCard video={video} />
                </li>
              ))}
            </Rail>
          </div>
        )}

        {shownReviews.length > 0 && (
          <Rail title="Reseñas en Google" tone={onDark ? 'dark' : 'light'}>
            {shownReviews.map((review) => (
              <li key={review.id} className="contents">
                <GoogleReviewCard review={review} />
              </li>
            ))}
          </Rail>
        )}
      </div>
    </section>
  );
}
