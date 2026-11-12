import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { useSiteStore } from '@/stores/siteStore';

interface Pillar {
  label: string;
  text: string;
}

/**
 * Short "who we are" block for the home page. It reuses the texts the admin already edits in
 * "Configuración de Páginas → Nosotros", so nothing new has to be written to publish it.
 */
export default function ChurchSection() {
  const { content, settings } = useSiteStore();
  const about = content.about || [];
  const getText = (key: string, fallback = '') => about.find((item) => item.key === key)?.body?.trim() || fallback;

  const intro = getText('about_intro') || settings.church_history || '';

  const pillars: Pillar[] = [
    { label: getText('about_mission_heading', 'Nuestra Misión'), text: settings.mission || '' },
    { label: getText('about_vision_heading', 'Nuestra Visión'), text: settings.vision || '' },
    { label: getText('about_purpose_heading', 'Nuestro Propósito'), text: settings.purpose || '' },
  ].filter((pillar) => pillar.text.trim().length > 0);

  if (!intro && pillars.length === 0) return null;

  return (
    <section data-nav-theme="light" className="section-padding bg-cream" aria-labelledby="church-title">
      <div className="container-custom">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="church-title" className="font-display text-4xl tracking-wider text-dark md:text-5xl">
            Nuestra Iglesia
          </h2>
          {intro && (
            <p className="mt-6 text-base leading-relaxed text-dark-light md:text-lg">{intro}</p>
          )}
        </div>

        {pillars.length > 0 && (
          <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3 md:gap-10">
            {pillars.map((pillar) => (
              <div key={pillar.label} className="border-t border-gold/50 pt-5">
                <p className="font-heading text-xs uppercase tracking-[0.2em] text-gold-ink">{pillar.label}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-dark-light">{pillar.text}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            to="/nosotros"
            className="press inline-flex min-h-12 items-center gap-3 border-2 border-dark px-8 font-heading text-sm font-semibold uppercase tracking-[0.12em] text-dark hover:bg-dark hover:text-cream focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/50"
          >
            Conoce nuestra historia <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
