import { FiFacebook, FiInstagram, FiLink, FiPhone, FiYoutube } from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa6';
import { useSiteStore } from '@/stores/siteStore';

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>> = {
  FiFacebook,
  FiYoutube,
  FiTiktok: FaTiktok as React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>,
  FiInstagram,
  FiPhone,
};

const platformLabels: Record<string, string> = {
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  twitter: 'X / Twitter',
  'x / twitter': 'X / Twitter',
  telegram: 'Telegram',
};

interface SocialChannelsSectionProps {
  eyebrow: string;
  title: string;
  variant?: 'dark' | 'light';
}

export default function SocialChannelsSection({ eyebrow, title, variant = 'dark' }: SocialChannelsSectionProps) {
  const socialConfigs = useSiteStore((state) => state.socialConfigs);
  const activeConfigs = socialConfigs
    .filter(config => config.isActive && config.accountUrl)
    .sort((a, b) => a.order - b.order);

  if (activeConfigs.length === 0) return null;

  const isDark = variant === 'dark';
  const gridCols = activeConfigs.length === 1
    ? 'grid-cols-1 max-w-sm mx-auto'
    : activeConfigs.length === 2
      ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <section data-nav-theme={isDark ? 'dark' : undefined} className={`section-padding ${isDark ? 'bg-dark' : 'bg-cream'}`}>
      <div className="container-custom">
        <div className="mb-12 text-center">
          <p className={`font-heading uppercase tracking-[0.2em] text-sm mb-2 ${isDark ? 'text-gold' : 'text-gold-dark'}`}>{eyebrow}</p>
          <h2 className={`font-display text-4xl md:text-5xl tracking-wider ${isDark ? 'text-cream' : 'text-dark'}`}>{title}</h2>
        </div>

        <div className={`grid gap-6 ${gridCols}`}>
          {activeConfigs.map(config => {
            const Icon = iconMap[config.iconName || ''] || FiLink;
            const label = platformLabels[config.platform.toLowerCase()] || config.platform;
            const iconColor = isDark && isDarkIconColor(config.color) ? '#E8D48B' : config.color || (isDark ? '#C9A84C' : '#5B4300');

            return (
              <a
                key={config.platform}
                href={config.accountUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className={isDark ? 'card-dark p-6 text-center group hover:border-gold/40 transition-colors' : 'card p-6 text-center group hover:border-gold transition-all duration-300 hover:shadow-lg'}
              >
                <Icon className="mx-auto mb-4 transition-transform group-hover:scale-110" size={48} style={{ color: iconColor }} />
                <h3 className={`font-heading text-lg mb-2 ${isDark ? 'text-cream' : 'font-bold text-dark'}`}>{label}</h3>
                <span className={isDark ? 'btn btn-secondary text-sm border-gold text-gold hover:bg-gold hover:text-dark mt-2 inline-block' : 'text-sm text-dark-light'}>
                  {isDark ? 'Seguir' : config.accountUrl!.replace('https://', '').split('/')[0]}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function isDarkIconColor(color: string | null) {
  if (!color) return false;
  const normalized = color.toLowerCase().replace(/\s/g, '');
  return normalized === '#000' || normalized === '#000000' || normalized === 'black';
}
