import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { useSiteStore } from '../../stores/siteStore';
import { useNavTheme } from '../../hooks/useNavTheme';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { headerMenu, settings } = useSiteStore();
  const theme = useNavTheme();

  const siteName = settings.site_name || 'REDES';
  const logoUrl = settings.logo_url || '/logo.svg';
  const isDark = theme === 'dark';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isDark
          ? scrolled ? 'bg-dark/98 backdrop-blur-md shadow-lg' : 'bg-dark/90 backdrop-blur-sm'
          : scrolled ? 'bg-white/98 backdrop-blur-md shadow-lg border-b border-gray-200/50' : 'bg-white/90 backdrop-blur-sm border-b border-gray-200/30'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt={siteName}
              className={`h-9 w-9 md:h-11 md:w-11 ${isDark ? 'logo-on-dark' : ''}`}
            />
            <span
              className={`font-display text-3xl md:text-4xl tracking-wider transition-colors duration-500 ${
                isDark ? 'text-gold' : 'text-dark'
              }`}
            >
              {siteName}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {headerMenu.map((link) => (
              <Link
                key={link.id}
                to={link.url}
                className={`font-heading text-sm font-medium tracking-wide uppercase transition-colors duration-300 ${
                  location.pathname === link.url
                    ? isDark ? 'text-gold' : 'text-gold-dark'
                    : isDark ? 'text-cream hover:text-gold-light' : 'text-gray-700 hover:text-gold-dark'
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
            className={`md:hidden min-h-11 min-w-11 p-2 rounded-lg transition-colors ${
              isDark ? 'text-cream hover:bg-dark-lighter' : 'text-gray-800 hover:bg-gray-100'
            }`}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
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
            id="mobile-navigation"
            aria-label="Navegación móvil"
            className={`md:hidden border-t ${
              isDark ? 'bg-dark border-gold/20' : 'bg-white border-gray-200'
            }`}
          >
            <div className="container-custom py-4 flex flex-col gap-2">
              {headerMenu.map((link) => (
                <Link
                  key={link.id}
                  to={link.url}
                  onClick={() => setIsOpen(false)}
                  className={`font-heading text-base font-medium py-3 px-4 rounded-lg transition-colors ${
                    location.pathname === link.url
                      ? isDark ? 'text-gold bg-gold/10' : 'text-gold-dark bg-gold/10'
                      : isDark ? 'text-cream hover:text-gold-light hover:bg-dark-lighter' : 'text-gray-700 hover:text-gold-dark hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/contacto" onClick={() => setIsOpen(false)} className="btn btn-primary mt-2">
                Visítanos
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
