import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { FaFacebook, FaYoutube, FaTiktok, FaWhatsapp } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-dark text-cream">
      <div className="container-custom section-padding pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.svg" alt="Ministerio REDES" className="h-10 w-10" />
              <h3 className="font-display text-4xl text-gold tracking-wider">
                REDES
              </h3>
            </div>
            <p className="text-silver text-sm leading-relaxed mb-4">
              Ver una gran red de avivamiento en las familias de nuestro país.
              Con un gran deseo de evangelizar.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/MinisterioREDESlive"
                target="_blank"
                rel="noopener noreferrer"
                className="text-silver hover:text-gold transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="https://youtube.com/channel/UClpoz4Olk2soO3Cg2gUKWKA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-silver hover:text-gold transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@ministerioredes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-silver hover:text-gold transition-colors"
                aria-label="TikTok"
              >
                <FaTiktok size={20} />
              </a>
              <a
                href="https://wa.me/593994538859"
                target="_blank"
                rel="noopener noreferrer"
                className="text-silver hover:text-gold transition-colors"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-gold font-semibold uppercase tracking-wider text-sm mb-4">
              Navegación
            </h4>
            <ul className="space-y-2">
              {['Inicio', 'Nosotros', 'Eventos', 'Blog', 'Comunidad', 'Contacto'].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to={`/${item.toLowerCase() === 'inicio' ? '' : item.toLowerCase()}`}
                      className="text-silver hover:text-gold transition-colors text-sm"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-gold font-semibold uppercase tracking-wider text-sm mb-4">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-silver text-sm">
                <FiMapPin className="mt-0.5 text-gold flex-shrink-0" />
                <span>20 de Junio y Cotopaxi, Lago Agrio, Ecuador</span>
              </li>
              <li className="flex items-center gap-3 text-silver text-sm">
                <FiPhone className="text-gold flex-shrink-0" />
                <a href="tel:+593994538859" className="hover:text-gold">
                  099 453 8859
                </a>
              </li>
              <li className="flex items-center gap-3 text-silver text-sm">
                <FiMail className="text-gold flex-shrink-0" />
                <a href="mailto:ministeriocristianoredes@gmail.com" className="hover:text-gold">
                  ministeriocristianoredes@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Schedule */}
          <div>
            <h4 className="font-heading text-gold font-semibold uppercase tracking-wider text-sm mb-4">
              Reuniones
            </h4>
            <ul className="space-y-2 text-silver text-sm">
              <li className="flex justify-between">
                <span>Domingos</span>
                <span className="text-cream">9:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span>Viernes</span>
                <span className="text-cream">7:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gold/20 text-center text-silver text-xs">
          <p>
            &copy; {new Date().getFullYear()} Ministerio REDES. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
