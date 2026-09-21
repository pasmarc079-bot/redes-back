import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail, FiSend } from 'react-icons/fi';
import { useSiteStore } from '../stores/siteStore';
import { contactApi } from '../services/api';
import Seo from '@/components/Seo';
import ResponsiveCover from '@/components/layout/ResponsiveCover';

export default function Contact() {
  const { settings, content } = useSiteStore();
  const contactWelcome = content.contact?.find(item => item.key === 'contact_welcome')?.body || 'Conecta con nosotros';
  const mapUrl = settings.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address || 'Lago Agrio, Ecuador')}`;
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);

    try {
      await contactApi.submit(formData);
      setFormData({ name: '', email: '', message: '' });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <Seo title="Contacto | Ministerio REDES" description="Comunícate con el Ministerio Cristiano REDES en Lago Agrio, Ecuador." />
       <section data-nav-theme="dark" className="relative overflow-hidden bg-dark py-20 md:py-28">
         <ResponsiveCover desktopImage={settings.contact_cover_image_url} mobileImage={settings.contact_cover_image_mobile_url} alt="" />
         {(settings.contact_cover_image_url || settings.contact_cover_image_mobile_url) && <div className="absolute inset-0 bg-dark/70" aria-hidden="true" />}
         <div className="container-custom relative z-10 text-center">
          <p className="font-heading text-gold uppercase tracking-[0.2em] text-sm mb-4">
            Estamos aquí para ti
          </p>
          <h1 className="font-display text-5xl md:text-7xl text-gold tracking-wider">
            Contacto
          </h1>
        </div>
      </section>

      <section className="section-padding bg-cream">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-3xl text-dark tracking-wider mb-6">
                 {contactWelcome}
              </h2>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <FiMapPin className="text-gold text-xl" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-dark mb-1">Dirección</h3>
                    <p className="text-dark-light">{settings.address || ''}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <FiPhone className="text-gold text-xl" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-dark mb-1">Teléfono</h3>
                    <a href={`tel:${settings.phone_international || ''}`} className="text-dark-light hover:text-gold">
                      {settings.phone || ''}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <FiMail className="text-gold text-xl" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-dark mb-1">Email</h3>
                    <a href={`mailto:${settings.email || ''}`} className="text-dark-light hover:text-gold">
                      {settings.email || ''}
                    </a>
                  </div>
                </div>
              </div>

                <div className="mb-4">
                  <p className="flex items-start gap-3 text-lg text-dark-light">
                    <FiMapPin className="mt-1 flex-shrink-0 text-gold" aria-hidden="true" />
                    <span>{settings.address || 'Lago Agrio, Ecuador'}</span>
                  </p>
                </div>
                <div className="overflow-hidden rounded-xl border border-dark/10 bg-dark-light shadow-sm">
                  <iframe
                    title="Ubicación del Ministerio REDES"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(settings.address || 'Lago Agrio, Ecuador')}&output=embed`}
                    className="h-64 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center gap-2 font-heading text-sm text-gold-dark hover:text-gold-ink"
                >
                  <FiMapPin aria-hidden="true" />
                  Abrir ubicación en Google Maps
                </a>
               {(settings.external_form_url || settings.donation_url) && (
                 <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                   {settings.external_form_url && <a href={settings.external_form_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary flex-1 justify-center">Formulario externo</a>}
                   {settings.donation_url && <a href={settings.donation_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary flex-1 justify-center">Donar</a>}
                 </div>
               )}
             </div>

            <div>
              <div className="card p-6 md:p-8">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 mx-auto rounded-full bg-hope/10 flex items-center justify-center mb-4">
                      <FiSend className="text-hope text-2xl" />
                    </div>
                    <h3 className="font-heading text-xl text-dark mb-2">¡Mensaje enviado!</h3>
                    <p className="text-dark-light">
                      Gracias por contactarnos. Te responderemos pronto.
                    </p>
                    <button onClick={() => setSubmitted(false)} className="btn btn-primary mt-6">
                      Enviar otro mensaje
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h2 className="font-heading text-xl text-dark mb-4">Envíanos un mensaje</h2>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-dark mb-1">Nombre</label>
                      <input id="name" type="text" required value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={sending}
                        className="w-full px-4 py-3 rounded-lg border border-dark/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all disabled:opacity-50"
                        placeholder="Tu nombre" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-dark mb-1">Email</label>
                      <input id="email" type="email" required value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={sending}
                        className="w-full px-4 py-3 rounded-lg border border-dark/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all disabled:opacity-50"
                        placeholder="tu@email.com" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-dark mb-1">Mensaje</label>
                      <textarea id="message" required rows={5} value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        disabled={sending}
                        className="w-full px-4 py-3 rounded-lg border border-dark/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all resize-none disabled:opacity-50"
                        placeholder="¿En qué podemos ayudarte?" />
                    </div>
                    <button type="submit" disabled={sending}
                      className="btn btn-primary w-full justify-center disabled:opacity-50">
                      {sending ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        <>Enviar mensaje <FiSend /></>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
