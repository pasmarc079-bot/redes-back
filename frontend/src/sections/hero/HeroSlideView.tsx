import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { splitAccent, type HeroSlide } from '@/utils/heroSlides';

const isExternal = (href: string) => /^https?:\/\//i.test(href);

function HeroBackdrop({ desktop, mobile, active, eager }: { desktop: string; mobile: string; active: boolean; eager: boolean }) {
  if (!desktop && !mobile) {
    return <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-light to-gold/25" aria-hidden="true" />;
  }
  return (
    <picture className="absolute inset-0 block" aria-hidden="true">
      {mobile && <source media="(max-width: 767px)" srcSet={mobile} />}
      <img
        src={desktop || mobile}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        className={`hero-image h-full w-full object-cover object-center ${active ? 'is-active' : ''}`}
      />
    </picture>
  );
}

interface HeroSlideViewProps {
  slide: HeroSlide;
  active: boolean;
  /** Only the first slide is the page heading. */
  primary: boolean;
  logoUrl: string;
  /** In the admin preview the buttons are drawn, not clickable. */
  staticButtons?: boolean;
}

/**
 * One slide of the cover, exactly as the visitor sees it. Shared with the admin preview so the
 * preview shows the real thing instead of an approximation that can drift.
 */
export default function HeroSlideView({ slide, active, primary, logoUrl, staticButtons = false }: HeroSlideViewProps) {
  const Heading = primary ? 'h1' : 'h2';

  const renderLink = (label: string, href: string, className: string) => {
    const content = (
      <>
        {label}
        <FiArrowRight aria-hidden="true" />
      </>
    );
    if (staticButtons) {
      return (
        <span className={className} aria-hidden="true">
          {content}
        </span>
      );
    }
    if (isExternal(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className} tabIndex={active ? undefined : -1}>
          {content}
        </a>
      );
    }
    return (
      <Link to={href} className={className} tabIndex={active ? undefined : -1}>
        {content}
      </Link>
    );
  };

  return (
    <div className="relative h-full w-full bg-dark">
      <HeroBackdrop desktop={slide.imageUrl} mobile={slide.mobileImageUrl} active={active} eager={primary} />
      {/* Even veil, because the text is centred: a side gradient would leave one edge unreadable. */}
      <div className="absolute inset-0 bg-dark/45" aria-hidden="true" />
      <div className="hero-veil absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-dark/30" aria-hidden="true" />

      <div className="container-custom relative flex h-full flex-col items-center justify-center gap-6 pb-[clamp(5.5rem,12vh,6rem)] pt-[clamp(4rem,9vh,8rem)] text-center">
        <div className={`hero-copy hero-text-shadow flex max-w-3xl flex-col items-center ${active ? 'is-active' : ''}`}>
          {logoUrl && (
            <img src={logoUrl} alt="" className="logo-on-dark mb-4 h-16 w-16 object-contain md:mb-5 md:h-20 md:w-20" />
          )}

          {slide.eyebrow && (
            <p className="mb-3 font-heading text-xs uppercase tracking-[0.3em] text-gold md:mb-4 md:text-sm">{slide.eyebrow}</p>
          )}

          <Heading className="font-display line-clamp-2 uppercase leading-[0.9] tracking-wider text-[clamp(2rem,min(9vw,9.5vh),6rem)]">
            {splitAccent(slide.title).map((part, i) => (
              <span key={i} className={part.accent ? 'text-gold' : 'text-cream'}>{part.text}</span>
            ))}
          </Heading>

          {slide.subtitle && (
            <p className="mt-4 line-clamp-2 max-w-xl text-sm leading-relaxed text-cream/85 md:mt-6 md:line-clamp-3 md:text-lg">{slide.subtitle}</p>
          )}

          {slide.location && (
            <p className="mt-2 text-xs text-silver md:mt-3 md:text-base">{slide.location}</p>
          )}

          {(slide.ctaLabel && slide.ctaUrl) || (slide.secondaryCtaLabel && slide.secondaryCtaUrl) ? (
            <div className="mt-6 flex flex-col items-center gap-2.5 sm:mt-9 sm:flex-row sm:gap-3">
              {slide.ctaLabel && slide.ctaUrl && renderLink(slide.ctaLabel, slide.ctaUrl, 'press btn btn-primary min-h-11 px-6 text-xs uppercase tracking-[0.12em] sm:min-h-12 sm:px-8 sm:text-sm')}
              {slide.secondaryCtaLabel && slide.secondaryCtaUrl && renderLink(
                slide.secondaryCtaLabel,
                slide.secondaryCtaUrl,
                'press btn btn-secondary min-h-11 px-6 text-xs uppercase tracking-[0.12em] sm:min-h-12 sm:px-8 sm:text-sm',
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
