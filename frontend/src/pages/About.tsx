import { motion } from 'framer-motion';
import { FiMapPin } from 'react-icons/fi';
import Seo from '@/components/Seo';
import { useSiteStore } from '../stores/siteStore';
import ResponsiveCover from '@/components/layout/ResponsiveCover';

export default function About() {
  const { settings, services, content } = useSiteStore();
  const aboutContent = content.about || [];
  const getContent = (key: string) => aboutContent.find((item) => item.key === key);
  const getText = (key: string, fallback: string) => getContent(key)?.body || fallback;
  const intro = getContent('about_intro');
  const pastorSection = getContent('pastor_section');
  const mapUrl = settings.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address || 'Lago Agrio, Ecuador')}`;

  return (
    <div>
      <Seo title="Nosotros | Ministerio REDES" description="Conoce la historia, misión y visión del Ministerio Cristiano REDES." />
       <section
         data-nav-theme="dark"
         className="relative overflow-hidden bg-dark py-20 md:py-28"
       >
         <ResponsiveCover desktopImage={settings.about_cover_image_url} mobileImage={settings.about_cover_image_mobile_url} alt="" />
         {(settings.about_cover_image_url || settings.about_cover_image_mobile_url) && <div className="absolute inset-0 bg-dark/70" aria-hidden="true" />}
         <div className="container-custom relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-heading text-gold uppercase tracking-[0.2em] text-sm mb-4"
          >
            {getText('about_eyebrow', 'Quiénes Somos')}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-7xl text-gold tracking-wider"
          >
            {getText('about_page_title', 'Nosotros')}
          </motion.h1>
        </div>
      </section>

      {intro?.body && (
        <section className="section-padding bg-white">
          <div className="container-custom max-w-3xl text-center">
            <h2 className="font-display text-3xl md:text-4xl text-dark tracking-wider mb-6">
              {intro.title || 'Quiénes Somos'}
            </h2>
            <p className="text-lg md:text-xl text-dark-light leading-relaxed text-balance">
              {intro.body}
            </p>
          </div>
        </section>
      )}

      {settings.church_history && (
        <section className="section-padding bg-white">
          <div className="container-custom max-w-3xl text-center">
            <h2 className="font-display text-3xl md:text-4xl text-dark tracking-wider mb-6">
              {getText('about_history_heading', 'Nuestra Historia')}
            </h2>
            <p className="text-lg md:text-xl text-dark-light leading-relaxed text-balance">
              {settings.church_history}
            </p>
          </div>
        </section>
      )}

      <section className="section-padding bg-cream">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl text-dark tracking-wider mb-6">
              {getText('about_mission_heading', 'Nuestra Misión')}
          </h2>
          <p className="text-lg md:text-xl text-dark-light leading-relaxed text-balance">
            {settings.mission || ''}
          </p>
        </div>
      </section>

      <section className="section-padding bg-dark">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl text-gold tracking-wider mb-6">
              {getText('about_vision_heading', 'Nuestra Visión')}
          </h2>
          <p className="text-lg md:text-xl text-cream/90 leading-relaxed">
            {settings.vision || ''}
          </p>
        </div>
      </section>

      {settings.purpose && (
        <section className="section-padding bg-cream">
          <div className="container-custom max-w-3xl text-center">
            <h2 className="font-display text-3xl md:text-4xl text-dark tracking-wider mb-6">
              {getText('about_purpose_heading', 'Nuestro Propósito')}
            </h2>
            <p className="text-lg md:text-xl text-dark-light leading-relaxed">
              {settings.purpose}
            </p>
          </div>
        </section>
      )}

      {settings.pastor_name && (
        <section className="section-padding bg-dark">
          <div className="container-custom max-w-3xl">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl md:text-4xl text-gold tracking-wider mb-2">
                {pastorSection?.title || getText('about_pastor_heading', 'Nuestro Pastor')}
              </h2>
              <p className="font-heading text-xl text-cream/80">
                {settings.pastor_name}
              </p>
            </div>
            {settings.pastor_photo_url && (
              <div className="flex justify-center mb-6">
                <img
                  src={settings.pastor_photo_url}
                  alt={settings.pastor_name}
                  className="w-48 h-48 rounded-full object-cover border-4 border-gold/30"
                />
              </div>
            )}
            {(pastorSection?.body || settings.pastor_bio) && (
              <p className="text-lg text-cream/90 leading-relaxed text-center">
                {pastorSection?.body || settings.pastor_bio}
              </p>
            )}
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section className="section-padding bg-cream">
          <div className="container-custom max-w-3xl">
            <h2 className="font-display text-3xl md:text-4xl text-dark tracking-wider mb-8 text-center">
              {getText('about_services_heading', 'Nuestros Servicios')}
            </h2>
            <div className="grid gap-4">
              {services.map((s) => (
                <div key={s.id} className="bg-white rounded-xl p-6 flex items-center justify-between shadow-sm">
             <div>
                    <h3 className="font-heading font-semibold text-dark text-lg">{s.name}</h3>
                    {s.description && <p className="text-dark-light text-sm mt-1">{s.description}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-semibold text-gold-ink">{s.dayOfWeek}</p>
                    <p className="text-dark-light text-sm">{s.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl text-dark tracking-wider mb-6">
                {getText('about_visit_heading', 'Visítanos')}
              </h2>
              <div className="space-y-4 text-dark-light">
                <p className="text-lg">
                  <strong className="text-dark">{getText('about_address_label', 'Dirección:')}</strong><br />
                  {settings.address || ''}
                </p>
                <p className="text-lg">
                  <strong className="text-dark">{getText('about_phone_label', 'Teléfono:')}</strong><br />
                  {settings.phone || ''}
                </p>
                <p className="text-lg">
                  <strong className="text-dark">{getText('about_email_label', 'Email:')}</strong><br />
                  {settings.email || ''}
                </p>
              </div>
            </div>
              <div className="mb-4">
                <h3 className="mb-2 font-heading font-semibold text-dark">{getText('about_map_placeholder', 'Nuestra ubicación')}</h3>
                <p className="flex items-start gap-3 text-lg text-dark-light">
                  <FiMapPin className="mt-1 flex-shrink-0 text-gold" aria-hidden="true" />
                  <span>{settings.address || 'Lago Agrio, Ecuador'}</span>
                </p>
              </div>
              <div className="overflow-hidden rounded-xl border border-dark/10 bg-dark-light shadow-sm">
                <iframe
                  title="Ubicación del Ministerio REDES"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(settings.address || 'Lago Agrio, Ecuador')}&output=embed`}
                  className="h-80 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 font-heading text-sm text-gold-dark hover:text-gold-ink">
                <FiMapPin aria-hidden="true" /> Abrir ubicación en Google Maps
              </a>
          </div>
        </div>
      </section>
    </div>
  );
}
