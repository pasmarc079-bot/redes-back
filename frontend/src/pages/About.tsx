import { motion } from 'framer-motion';
import { useSiteStore } from '../stores/siteStore';

export default function About() {
  const { settings, services } = useSiteStore();

  return (
    <div>
      <section className="relative bg-dark py-20 md:py-28">
        <div className="container-custom text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-heading text-gold uppercase tracking-[0.2em] text-sm mb-4"
          >
            Quiénes Somos
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-7xl text-gold tracking-wider"
          >
            Nosotros
          </motion.h1>
        </div>
      </section>

      {settings.church_history && (
        <section className="section-padding bg-white">
          <div className="container-custom max-w-3xl text-center">
            <h2 className="font-display text-3xl md:text-4xl text-dark tracking-wider mb-6">
              Nuestra Historia
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
            Nuestra Misión
          </h2>
          <p className="text-lg md:text-xl text-dark-light leading-relaxed text-balance">
            {settings.mission || ''}
          </p>
        </div>
      </section>

      <section className="section-padding bg-dark">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl text-gold tracking-wider mb-6">
            Nuestra Visión
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
              Nuestro Propósito
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
                Nuestro Pastor
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
            {settings.pastor_bio && (
              <p className="text-lg text-cream/90 leading-relaxed text-center">
                {settings.pastor_bio}
              </p>
            )}
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section className="section-padding bg-cream">
          <div className="container-custom max-w-3xl">
            <h2 className="font-display text-3xl md:text-4xl text-dark tracking-wider mb-8 text-center">
              Nuestros Servicios
            </h2>
            <div className="grid gap-4">
              {services.map((s) => (
                <div key={s.id} className="bg-white rounded-xl p-6 flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="font-heading font-semibold text-dark text-lg">{s.name}</h3>
                    {s.description && <p className="text-dark-light text-sm mt-1">{s.description}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-semibold text-gold">{s.dayOfWeek}</p>
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
                Visítanos
              </h2>
              <div className="space-y-4 text-dark-light">
                <p className="text-lg">
                  <strong className="text-dark">Dirección:</strong><br />
                  {settings.address || ''}
                </p>
                <p className="text-lg">
                  <strong className="text-dark">Teléfono:</strong><br />
                  {settings.phone || ''}
                </p>
                <p className="text-lg">
                  <strong className="text-dark">Email:</strong><br />
                  {settings.email || ''}
                </p>
              </div>
            </div>
            <div className="h-80 bg-dark-light rounded-xl flex items-center justify-center">
              <p className="text-silver">Mapa interactivo</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
