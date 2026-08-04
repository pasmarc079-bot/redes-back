import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { useSiteStore } from '../../stores/siteStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { headerMenu, settings } = useSiteStore();

  const siteName = settings.site_name || 'REDES';
  const logoUrl = settings.logo_url || '/logo.svg';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-sm border-b border-gold/20">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoUrl} alt={siteName} className="h-9 w-9 md:h-11 md:w-11" />
            <span className="font-display text-3xl md:text-4xl text-gold tracking-wider">
              {siteName}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {headerMenu.map((link) => (
              <Link
                key={link.id}
                to={link.url}
                className={`font-heading text-sm font-medium tracking-wide uppercase transition-colors ${
                  location.pathname === link.url
                    ? 'text-gold'
                    : 'text-cream hover:text-gold-light'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/contacto" className="btn btn-primary text-sm">
              Visítanos
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-cream p-2"
            aria-label="Toggle menu"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark border-t border-gold/20"
          >
            <div className="container-custom py-4 flex flex-col gap-2">
              {headerMenu.map((link) => (
                <Link
                  key={link.id}
                  to={link.url}
                  onClick={() => setIsOpen(false)}
                  className={`font-heading text-base font-medium py-3 px-4 rounded-lg transition-colors ${
                    location.pathname === link.url
                      ? 'text-gold bg-gold/10'
                      : 'text-cream hover:text-gold-light hover:bg-dark-lighter'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/contacto"
                onClick={() => setIsOpen(false)}
                className="btn btn-primary mt-2"
              >
                Visítanos
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
