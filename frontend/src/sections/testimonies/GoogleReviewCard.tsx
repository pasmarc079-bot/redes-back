import { FiStar } from 'react-icons/fi';
import type { GoogleReview } from '@/types';

interface GoogleReviewCardProps {
  review: GoogleReview;
}

const formatDate = (iso: string | null) => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString('es-EC', { month: 'long', year: 'numeric', timeZone: 'America/Guayaquil' });
};

export default function GoogleReviewCard({ review }: GoogleReviewCardProps) {
  const date = formatDate(review.reviewDate);

  return (
    <article data-rail-item className="flex h-full w-[80vw] max-w-[320px] shrink-0 snap-start flex-col rounded-2xl bg-white p-6 shadow-[0_12px_30px_-16px_rgb(0_0_0/0.35)] sm:w-[300px]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-0.5" role="img" aria-label={`Calificación: ${review.rating} de 5 estrellas`}>
          {Array.from({ length: 5 }, (_, index) => (
            <FiStar key={index} aria-hidden="true" size={16} className={index < review.rating ? 'fill-gold text-gold' : 'text-dark/15'} />
          ))}
        </div>
        {date && <time dateTime={review.reviewDate!} className="text-xs text-dark-light">{date}</time>}
      </div>

      {review.text ? (
        <p className="mt-4 line-clamp-5 flex-1 text-[15px] leading-relaxed text-dark">{review.text}</p>
      ) : (
        <p className="mt-4 flex-1 text-[15px] italic leading-relaxed text-dark-light">Sin comentario escrito.</p>
      )}

      <footer className="mt-5 flex items-center gap-3 border-t border-dark/10 pt-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/20 font-heading text-sm font-bold text-gold-ink" aria-hidden="true">
          {review.authorName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-semibold text-dark">{review.authorName}</p>
          <p className="text-xs text-dark-light">Publicada en Google</p>
        </div>
      </footer>
    </article>
  );
}
