import { FaWhatsapp } from 'react-icons/fa6';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '593994538859';
const WHATSAPP_MESSAGE = encodeURIComponent('¡Hola! Quisiera información sobre el Ministerio REDES.');

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-200"
      aria-label="Contactar por WhatsApp"
    >
      <FaWhatsapp size={28} />
    </a>
  );
}
