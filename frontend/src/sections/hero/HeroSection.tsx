import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-dark overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/50 to-dark/80 z-10" />

      {/* Background image placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-light to-gold/20 z-0" />

      {/* Content */}
      <div className="relative z-20 container-custom text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6 flex justify-center">
            <img src="/logo.svg" alt="Ministerio REDES" className="h-20 w-20 md:h-28 md:w-28 lg:h-32 lg:w-32" />
          </div>

          <p className="font-heading text-gold uppercase tracking-[0.3em] text-sm md:text-base mb-4">
            Ministerio Cristiano
          </p>

          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-gold tracking-wider mb-6 text-shadow">
            REDES
          </h1>

          <p className="font-body text-cream/90 text-lg md:text-xl max-w-2xl mx-auto mb-4 text-balance">
            Una gran red de avivamiento en las familias de nuestro país
          </p>

          <p className="font-body text-silver text-base md:text-lg mb-10">
            Lago Agrio, Ecuador
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/eventos" className="btn btn-primary text-base">
              Próximos Eventos
              <FiArrowRight />
            </Link>
            <Link to="/nosotros" className="btn btn-secondary text-base border-cream text-cream hover:bg-cream hover:text-dark">
              Conócenos
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-gold/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gold rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  );
}
