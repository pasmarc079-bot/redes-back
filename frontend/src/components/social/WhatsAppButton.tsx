import { FaWhatsapp } from 'react-icons/fa6';
import { useSiteStore } from '../../stores/siteStore';

export default function WhatsAppButton() {
  const { settings } = useSiteStore();
  const number = settings.whatsapp_number || '593994538859';
  const message = encodeURIComponent(settings.whatsapp_message || '¡Hola! Quisiera información sobre el Ministerio REDES.');

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-200"
      aria-label="Contactar por WhatsApp"
    >
      <FaWhatsapp size={28} />
    </a>
  );
}
