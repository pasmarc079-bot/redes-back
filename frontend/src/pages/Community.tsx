import { useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { useSiteStore } from '@/stores/siteStore';
import Seo from '@/components/Seo';
import SocialChannelsSection from '@/components/social/SocialChannelsSection';
import ResponsiveCover from '@/components/layout/ResponsiveCover';

export default function Community() {
  const { settings, fetchSocialConfigs } = useSiteStore();
  const communityContent = useSiteStore((state) => state.content.community || []);
  const getText = (key: string, fallback: string) => communityContent.find(item => item.key === key)?.body || fallback;

  useEffect(() => {
    fetchSocialConfigs();
  }, []);

  return (
    <div>
      <Seo title="Comunidad | Ministerio REDES" description="Conéctate con la comunidad del Ministerio Cristiano REDES." />
       <section data-nav-theme="dark" className="relative overflow-hidden bg-dark py-20 md:py-28">
         <ResponsiveCover desktopImage={settings.community_cover_image_url} mobileImage={settings.community_cover_image_mobile_url} alt="" />
         {(settings.community_cover_image_url || settings.community_cover_image_mobile_url) && <div className="absolute inset-0 bg-dark/70" aria-hidden="true" />}
         <div className="container-custom relative z-10 text-center">
          <p className="font-heading text-gold uppercase tracking-[0.2em] text-sm mb-4">
            Comunidad
          </p>
          <h1 className="font-display text-5xl md:text-7xl text-gold tracking-wider">
            {getText('community_page_title', 'Únete a Nosotros')}
          </h1>
          <p className="text-silver mt-4 max-w-2xl mx-auto">
            {getText('community_page_description', 'Conéctate con nosotros en nuestras redes sociales y sé parte del avivamiento.')}
          </p>
        </div>
      </section>

       <SocialChannelsSection eyebrow="Comunidad" title="Síguenos en Redes Sociales" variant="light" />

      <section className="section-padding bg-dark">
        <div className="container-custom text-center">
          <h2 className="font-display text-3xl md:text-4xl text-gold tracking-wider mb-4">
            Únete a Nuestra Comunidad
          </h2>
          <p className="text-silver mb-8 max-w-xl mx-auto">
            Contáctanos por WhatsApp y sé parte de esta gran familia de fe.
          </p>
          <a
            href={`https://wa.me/${settings.whatsapp_number || '593994538859'}?text=${encodeURIComponent(settings.whatsapp_message || '¡Hola! Quisiera información sobre el Ministerio REDES.')}`}
            target="_blank"
            rel="noopener noreferrer"
             className="inline-flex items-center gap-3 bg-green-700 text-white px-8 py-4 rounded-full text-lg font-heading font-semibold hover:bg-green-800 hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <FaWhatsapp size={24} />
            Contactar por WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
