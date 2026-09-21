import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin } from 'react-icons/fi';
import { eventsApi } from '@/services/api';
import type { Event } from '@/types';
import EventImage from '@/components/events/EventImage';
import Seo from '@/components/Seo';
import { useSiteStore } from '@/stores/siteStore';
import ResponsiveCover from '@/components/layout/ResponsiveCover';

const statusLabels: Record<string, string> = {
  UPCOMING: 'Próximo',
  ONGOING: 'En curso',
  COMPLETED: 'Finalizado',
};

const statusStyles: Record<string, string> = {
  UPCOMING: 'bg-blue-600 text-white',
  ONGOING: 'bg-green-600 text-white',
  COMPLETED: 'bg-gray-700 text-white',
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const pageSettings = useSiteStore((state) => state.settings);
  const eventsContent = useSiteStore((state) => state.content.events || []);
  const getText = (key: string, fallback: string) => eventsContent.find(item => item.key === key)?.body || fallback;

  useEffect(() => {
    eventsApi
      .getAll(1, 20, false, true)
      .then((res) => setEvents(res.data.events))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Seo title="Eventos | Ministerio REDES" description="Conoce los próximos eventos y actividades del Ministerio REDES en Lago Agrio." />
      <section data-nav-theme="dark" className="relative overflow-hidden bg-dark py-20 md:py-28">
        <ResponsiveCover desktopImage={pageSettings.events_cover_image_url} mobileImage={pageSettings.events_cover_image_mobile_url} alt="" />
        {(pageSettings.events_cover_image_url || pageSettings.events_cover_image_mobile_url) && <div className="absolute inset-0 bg-dark/70" aria-hidden="true" />}
        <div className="container-custom relative z-10 text-center">
          <p className="font-heading text-gold uppercase tracking-[0.2em] text-sm mb-4">
            {getText('events_page_description', 'Únete a nosotros')}
          </p>
          <h1 className="font-display text-5xl md:text-7xl text-gold tracking-wider">
            {getText('events_page_title', 'Eventos')}
          </h1>
        </div>
      </section>

      <section className="section-padding bg-cream">
        <div className="container-custom">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-dark-lighter" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-dark-lighter rounded w-3/4" />
                    <div className="h-4 bg-dark-lighter rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/eventos/${event.slug}`} className="card group block h-full">
                    <div className="relative h-48 bg-dark-light overflow-hidden">
                      <EventImage
                        event={event}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {event.isFeatured && (
                        <span className="absolute top-3 right-3 bg-gold text-dark text-xs font-heading font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          Destacado
                        </span>
                      )}
                      <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider ${statusStyles[event.status] || 'bg-gray-700 text-white'}`}>
                        {statusLabels[event.status] || event.status}
                      </span>
                    </div>
                    <div className="p-5">
                        <h2 className="font-heading text-lg font-bold text-dark mb-2 group-hover:text-gold-dark transition-colors line-clamp-2">
                          {event.title}
                        </h2>
                      <div className="space-y-2 text-sm text-dark-light">
                        {event.startDate && (
                          <div className="flex items-center gap-2">
                            <FiCalendar className="text-gold flex-shrink-0" />
                            <span>
                              {new Date(event.startDate).toLocaleDateString('es-EC', {
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
          ) : (
            <div className="text-center py-16">
              <p className="text-dark-light text-lg">No hay eventos próximos por el momento.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
