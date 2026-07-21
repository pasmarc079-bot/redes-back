import { motion } from 'framer-motion';

export default function About() {
  return (
    <div>
      {/* Hero */}
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

      {/* Mission */}
      <section className="section-padding bg-cream">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl text-dark tracking-wider mb-6">
            Nuestra Misión
          </h2>
          <p className="text-lg md:text-xl text-dark-light leading-relaxed text-balance">
            Ver una gran red de avivamiento en las familias de nuestro país.
            Con un gran deseo de evangelizar.
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="section-padding bg-dark">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl text-gold tracking-wider mb-6">
            Nuestra Visión
          </h2>
          <p className="text-lg md:text-xl text-cream/90 leading-relaxed">
            Ser una comunidad de fe que transforma vidas, fortalece familias
            y lleva esperanza a cada rincón de Lago Agrio y más allá.
          </p>
        </div>
      </section>

      {/* Location */}
      <section className="section-padding bg-cream">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl text-dark tracking-wider mb-6">
                Visítanos
              </h2>
              <div className="space-y-4 text-dark-light">
                <p className="text-lg">
                  <strong className="text-dark">Dirección:</strong><br />
                  20 de Junio y Cotopaxi, Lago Agrio, Ecuador
                </p>
                <p className="text-lg">
                  <strong className="text-dark">Teléfono:</strong><br />
                  099 453 8859
                </p>
                <p className="text-lg">
                  <strong className="text-dark">Email:</strong><br />
                  ministeriocristianoredes@gmail.com
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
