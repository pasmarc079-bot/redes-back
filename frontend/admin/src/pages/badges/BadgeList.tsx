import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiAward } from 'react-icons/fi';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || '/api/v1',
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

interface Badge {
  id: string;
  name: string;
  slug: string;
  type: string;
  color: string | null;
  isActive: boolean;
}

const typeLabels: Record<string, string> = {
  VOLUNTEER: 'Voluntario',
  LEADER: 'Líder',
  ATTENDANCE: 'Asistencia',
  SERVICE: 'Servicio',
  SPECIAL: 'Especial',
  MILESTONE: 'Hito',
};

export default function BadgeList() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/badges/all')
      .then((res) => setBadges(res.data.badges))
      .catch(() => setBadges([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta insignia?')) return;
    try {
      await api.delete(`/admin/badges/${id}`);
      setBadges((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert('Error al eliminar');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-800">Insignias</h1>
        <Link to="/dashboard/badges/new" className="btn btn-primary">
          <FiPlus /> Nueva insignia
        </Link>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse" aria-hidden="true">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="w-16 h-8 bg-gray-200 rounded" />
                </div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : badges.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay insignias. <Link to="/dashboard/badges/new" className="text-gold hover:underline">Crea la primera</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {badges.map((badge) => (
              <div key={badge.id} className="card p-4 group">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: badge.color ? `${badge.color}20` : '#C9A84C20' }}
                  >
                    <FiAward size={20} style={{ color: badge.color || '#C9A84C' }} />
                  </div>
                  <div className="flex gap-1">
                    <Link
                      to={`/dashboard/badges/${badge.id}`}
                      className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                      aria-label={`Editar ${badge.name}`}
                    >
                      <FiEdit2 size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(badge.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Eliminar ${badge.name}`}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="font-heading font-semibold text-gray-800 text-sm">{badge.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{typeLabels[badge.type] || badge.type}</p>
                {!badge.isActive && (
                  <span className="inline-block mt-2 text-xs text-red-500 font-medium">Inactiva</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
