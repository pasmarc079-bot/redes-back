import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail, FiSend } from 'react-icons/fi';
import { useSiteStore } from '../stores/siteStore';

export default function Contact() {
  const { settings } = useSiteStore();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div>
      <section className="relative bg-dark py-20 md:py-28">
        <div className="container-custom text-center">
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
                Conecta con nosotros
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

              <div className="h-64 bg-dark-light rounded-xl flex items-center justify-center">
                <p className="text-silver">Mapa interactivo</p>
              </div>
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
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-dark mb-1">Nombre</label>
                      <input id="name" type="text" required value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-dark/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                        placeholder="Tu nombre" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-dark mb-1">Email</label>
                      <input id="email" type="email" required value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-dark/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                        placeholder="tu@email.com" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-dark mb-1">Mensaje</label>
                      <textarea id="message" required rows={5} value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-dark/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all resize-none"
                        placeholder="¿En qué podemos ayudarte?" />
                    </div>
                    <button type="submit" className="btn btn-primary w-full justify-center">
                      Enviar mensaje <FiSend />
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
