import { FaFacebook, FaInstagram, FaTelegram, FaTiktok, FaWhatsapp, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import { useSiteStore } from '@/stores/siteStore';

const platformIcons: Record<string, IconType> = {
  facebook: FaFacebook,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  instagram: FaInstagram,
  whatsapp: FaWhatsapp,
  twitter: FaXTwitter,
  telegram: FaTelegram,
};

const platformLabels: Record<string, string> = {
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  twitter: 'X',
  telegram: 'Telegram',
};

/**
 * Home version of the social channels: a quiet row of links after the testimonies,
 * not a full section. The full channel cards live on Comunidad.
 */
export default function SocialFeed() {
  const socialConfigs = useSiteStore((state) => state.socialConfigs);
  const channels = socialConfigs
    .filter((config) => config.isActive && config.accountUrl)
    .sort((a, b) => a.order - b.order);

  if (channels.length === 0) return null;

  return (
    <section data-nav-theme="light" className="bg-cream py-14 md:py-16" aria-labelledby="social-title">
      <div className="container-custom flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="mb-1 font-heading text-xs uppercase tracking-[0.2em] text-gold-ink">Síguenos</p>
          <h2 id="social-title" className="font-display text-3xl tracking-wider text-dark md:text-4xl">Nuestras redes</h2>
        </div>
        <ul className="flex flex-wrap justify-center gap-3" aria-label="Redes sociales">
          {channels.map((channel) => {
            const Icon = platformIcons[channel.platform.toLowerCase()];
            const label = platformLabels[channel.platform.toLowerCase()] || channel.platform;
            return (
              <li key={channel.platform}>
                <a
                  href={channel.accountUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press inline-flex min-h-11 items-center gap-2.5 rounded-full border border-dark/15 bg-white px-5 font-heading text-sm font-semibold text-dark hover:border-gold hover:text-gold-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/40"
                  aria-label={`${label} (se abre en una pestaña nueva)`}
                >
                  {Icon && <Icon size={16} aria-hidden="true" />}
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
