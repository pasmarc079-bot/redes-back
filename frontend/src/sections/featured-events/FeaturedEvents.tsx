import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { eventsApi } from '@/services/api';
import type { Event } from '@/types';

export default function FeaturedEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi
      .getAll(1, 3, true)
      .then((res) => setEvents(res.data.events))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (events.length === 0) return null;

  return (
    <section className="section-padding bg-cream">
      <div className="container-custom">
        <div className="text-center mb-12">
          <p className="font-heading text-gold uppercase tracking-[0.2em] text-sm mb-2">
            No te lo pierdas
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-dark tracking-wider">
            Próximos Eventos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/eventos/${event.slug}`} className="card group block h-full">
                {/* Image */}
                <div className="relative h-48 bg-dark-light overflow-hidden">
                  {event.flyerUrl ? (
                    <img
                      src={event.flyerUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark to-gold/20">
                      <FiCalendar className="text-gold text-4xl" />
                    </div>
                  )}
                  {event.isFeatured && (
                    <span className="absolute top-3 right-3 bg-gold text-dark text-xs font-heading font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Destacado
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-heading text-lg font-bold text-dark mb-2 group-hover:text-gold-dark transition-colors line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="space-y-2 text-sm text-dark-light">
                    {event.startDate && (
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-gold flex-shrink-0" />
                        <span>
                          {new Date(event.startDate).toLocaleDateString('es-EC', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <FiMapPin className="text-gold flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>

                  {event.shortDescription && (
                    <p className="mt-3 text-sm text-dark-light line-clamp-2">
                      {event.shortDescription}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/eventos" className="btn btn-primary">
            Ver todos los eventos
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <section className="section-padding bg-cream">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-dark-lighter" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-dark-lighter rounded w-3/4" />
                <div className="h-4 bg-dark-lighter rounded w-1/2" />
                <div className="h-4 bg-dark-lighter rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
