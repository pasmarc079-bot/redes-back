import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { FaFacebook, FaYoutube, FaTiktok, FaWhatsapp, FaInstagram } from 'react-icons/fa6';
import { useSiteStore } from '../../stores/siteStore';
import { useEffect } from 'react';
import { socialApi } from '../../services/api';
import { useState } from 'react';
import type { SocialConfig } from '../../types';

const iconMap: Record<string, React.ReactNode> = {
  facebook: <FaFacebook size={20} />,
  youtube: <FaYoutube size={20} />,
  tiktok: <FaTiktok size={20} />,
  instagram: <FaInstagram size={20} />,
  whatsapp: <FaWhatsapp size={20} />,
};

export default function Footer() {
  const { settings, footerMenu, services } = useSiteStore();
  const [socials, setSocials] = useState<SocialConfig[]>([]);

  useEffect(() => {
    socialApi.getConfigs().then(({ data }) => setSocials(data));
  }, []);

  return (
    <footer className="bg-dark text-cream">
      <div className="container-custom section-padding pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={settings.logo_url || '/logo.svg'} alt={settings.site_name || 'REDES'} className="h-10 w-10" />
              <h3 className="font-display text-4xl text-gold tracking-wider">
                {settings.site_name || 'REDES'}
              </h3>
            </div>
            <p className="text-silver text-sm leading-relaxed mb-4">
              {settings.site_description || ''}
            </p>
            <div className="flex gap-4">
              {socials.filter(s => s.isActive && s.accountUrl).map((s) => (
                <a
                  key={s.platform}
                  href={s.accountUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-silver hover:text-gold transition-colors"
                  aria-label={s.platform}
                >
                  {iconMap[s.platform] || null}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-gold font-semibold uppercase tracking-wider text-sm mb-4">
              Navegación
            </h4>
            <ul className="space-y-2">
              {footerMenu.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.url}
                    className="text-silver hover:text-gold transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-gold font-semibold uppercase tracking-wider text-sm mb-4">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-silver text-sm">
                <FiMapPin className="mt-0.5 text-gold flex-shrink-0" />
                <span>{settings.address || ''}</span>
              </li>
              <li className="flex items-center gap-3 text-silver text-sm">
                <FiPhone className="text-gold flex-shrink-0" />
                <a href={`tel:${settings.phone_international || ''}`} className="hover:text-gold">
                  {settings.phone || ''}
                </a>
              </li>
              <li className="flex items-center gap-3 text-silver text-sm">
                <FiMail className="text-gold flex-shrink-0" />
                <a href={`mailto:${settings.email || ''}`} className="hover:text-gold">
                  {settings.email || ''}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-gold font-semibold uppercase tracking-wider text-sm mb-4">
              Reuniones
            </h4>
            <ul className="space-y-2 text-silver text-sm">
              {services.map((s) => (
                <li key={s.id} className="flex justify-between">
                  <span>{s.dayOfWeek}</span>
                  <span className="text-cream">{s.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gold/20 text-center text-silver text-xs">
          <p>
            &copy; {new Date().getFullYear()} {settings.copyright || 'Ministerio REDES. Todos los derechos reservados.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
