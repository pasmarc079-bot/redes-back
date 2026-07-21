import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiMapPin, FiExternalLink } from 'react-icons/fi';
import { eventsApi } from '@/services/api';
import type { Event } from '@/types';

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    eventsApi
      .getBySlug(slug)
      .then((res) => setEvent(res.data))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-pulse text-gold font-display text-2xl">Cargando...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-3xl text-dark mb-4">Evento no encontrado</h2>
          <Link to="/eventos" className="btn btn-primary">
            <FiArrowLeft /> Volver a eventos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-dark py-20 md:py-28">
        <div className="container-custom">
          <Link
            to="/eventos"
            className="inline-flex items-center gap-2 text-silver hover:text-gold mb-6 transition-colors"
          >
            <FiArrowLeft /> Volver a eventos
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl md:text-5xl text-gold tracking-wider mb-6 text-balance">
              {event.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-silver text-sm">
              {event.startDate && (
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-gold" />
                  <span>
                    {new Date(event.startDate).toLocaleDateString('es-EC', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-gold" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-cream">
        <div className="container-custom max-w-3xl">
          {/* Flyer */}
          {event.flyerUrl && (
            <div className="mb-8">
              <img
                src={event.flyerUrl}
                alt={event.title}
                className="w-full aspect-video object-cover rounded-xl shadow-lg"
              />
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-dark-light leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
            {event.capacity && (
              <div className="flex justify-between">
                <span className="text-dark font-heading font-semibold">Capacidad</span>
                <span className="text-dark-light">{event.capacity} personas</span>
              </div>
            )}
            {event.address && (
              <div className="flex justify-between">
                <span className="text-dark font-heading font-semibold">Dirección</span>
                <span className="text-dark-light text-right">{event.address}</span>
              </div>
            )}
            {event.registrationUrl && (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full justify-center"
              >
                Registrarse
                <FiExternalLink />
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
