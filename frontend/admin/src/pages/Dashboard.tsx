import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiFileText, FiAward, FiUsers, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || '/api/v1',
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

function SkeletonCard() {
  return (
    <div className="card p-6 animate-pulse" aria-hidden="true">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<Record<string, number>>({
    events: 0,
    posts: 0,
    badges: 0,
    members: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      api.get('/events?page=1&limit=1'),
      api.get('/posts?page=1&limit=1'),
      api.get('/badges'),
      api.get('/members'),
    ]).then(([events, posts, badges, members]) => {
      setStats({
        events: events.status === 'fulfilled' ? events.value.data.pagination?.total ?? 0 : 0,
        posts: posts.status === 'fulfilled' ? posts.value.data.pagination?.total ?? 0 : 0,
        badges: badges.status === 'fulfilled' ? badges.value.data.length ?? 0 : 0,
        members: members.status === 'fulfilled' ? members.value.data.length ?? 0 : 0,
      });

      const hasFailures = [events, posts, badges, members].some((r) => r.status === 'rejected');
      if (hasFailures) setError(true);

      setLoading(false);
    });
  }, []);

  const cards = [
    { icon: FiCalendar, label: 'Eventos', value: stats.events, color: 'bg-blue-500', link: '/dashboard/events' },
    { icon: FiFileText, label: 'Artículos', value: stats.posts, color: 'bg-green-500', link: '/dashboard/blog' },
    { icon: FiAward, label: 'Insignias', value: stats.badges, color: 'bg-gold', link: '/dashboard/badges' },
    { icon: FiUsers, label: 'Miembros', value: stats.members, color: 'bg-purple-500', link: '/dashboard/members' },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {error && (
        <div
          role="alert"
          className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-start gap-2"
        >
          <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
          <span>Algunos datos no pudieron cargarse. Intenta recargar la página.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((card) => (
              <Link
                key={card.label}
                to={card.link}
                className="card p-6 hover:shadow-md hover:border-gold/30 transition-all focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center text-white`}>
                    <card.icon size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                    <p className="text-sm text-gray-500">{card.label}</p>
                  </div>
                </div>
              </Link>
            ))}
      </div>

      <div className="card p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-800 mb-4">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/dashboard/events/new"
            className="btn btn-primary focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            Nuevo evento
          </Link>
          <Link
            to="/dashboard/blog/new"
            className="btn btn-primary focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            Nuevo artículo
          </Link>
          <Link
            to="/dashboard/badges/new"
            className="btn btn-primary focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            Nueva insignia
          </Link>
        </div>
      </div>
    </div>
  );
}
