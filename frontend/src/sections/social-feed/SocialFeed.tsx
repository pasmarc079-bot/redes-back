import { useEffect, useState } from 'react';
import { FaFacebook, FaYoutube, FaTiktok } from 'react-icons/fa6';
import { socialApi } from '@/services/api';
import type { SocialConfig } from '@/types';

export default function SocialFeed() {
  const [configs, setConfigs] = useState<SocialConfig[]>([]);

  useEffect(() => {
    socialApi
      .getConfigs()
      .then((res) => setConfigs(res.data))
      .catch(() => setConfigs([]));
  }, []);

  const fbConfig = configs.find((c) => c.platform === 'facebook');
  const ytConfig = configs.find((c) => c.platform === 'youtube');
  const ttConfig = configs.find((c) => c.platform === 'tiktok');

  return (
    <section className="section-padding bg-dark">
      <div className="container-custom">
        <div className="text-center mb-12">
          <p className="font-heading text-gold uppercase tracking-[0.2em] text-sm mb-2">
            Síguenos
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-cream tracking-wider">
            Nuestras Redes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Facebook */}
          <div className="card-dark p-6 text-center">
            <FaFacebook className="text-blue-500 text-4xl mx-auto mb-4" />
            <h3 className="font-heading text-cream text-lg mb-2">Facebook</h3>
            <p className="text-silver text-sm mb-4">3.9K seguidores</p>
            {fbConfig?.accountUrl && (
              <a
                href={fbConfig.accountUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-sm border-gold text-gold hover:bg-gold hover:text-dark"
              >
                Seguir
              </a>
            )}
          </div>

          {/* YouTube */}
          <div className="card-dark p-6 text-center">
            <FaYoutube className="text-red-500 text-4xl mx-auto mb-4" />
            <h3 className="font-heading text-cream text-lg mb-2">YouTube</h3>
            <p className="text-silver text-sm mb-4">Prédicas y alabanza</p>
            {ytConfig?.accountUrl && (
              <a
                href={ytConfig.accountUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-sm border-gold text-gold hover:bg-gold hover:text-dark"
              >
                Suscríbete
              </a>
            )}
          </div>

          {/* TikTok */}
          <div className="card-dark p-6 text-center">
            <FaTiktok className="text-cream text-4xl mx-auto mb-4" />
            <h3 className="font-heading text-cream text-lg mb-2">TikTok</h3>
            <p className="text-silver text-sm mb-4">Lives y contenido corto</p>
            {ttConfig?.accountUrl && (
              <a
                href={ttConfig.accountUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-sm border-gold text-gold hover:bg-gold hover:text-dark"
              >
                Seguir
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
