import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiMapPin } from 'react-icons/fi';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || '/api/v1',
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

interface Event {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  location: string | null;
  status: string;
  isFeatured: boolean;
  flyerUrl: string | null;
}

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/events/all')
      .then((res) => setEvents(res.data.events))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;
    try {
      await api.delete(`/admin/events/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert('Error al eliminar el evento');
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    UPCOMING: 'bg-green-100 text-green-700',
    ONGOING: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-gray-100 text-gray-500',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-800">Eventos</h1>
        <Link to="/dashboard/events/new" className="btn btn-primary">
          <FiPlus /> Nuevo evento
        </Link>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay eventos. <Link to="/dashboard/events/new" className="text-gold hover:underline">Crea el primero</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Evento</th>
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Ubicación</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        {event.flyerUrl ? (
                          <img src={event.flyerUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                            <FiCalendar className="text-gold" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{event.title}</p>
                          {event.isFeatured && (
                            <span className="text-xs text-gold font-medium">Destacado</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {new Date(event.startDate).toLocaleDateString('es-EC')}
                    </td>
                    <td className="table-cell">
                      {event.location ? (
                        <span className="flex items-center gap-1">
                          <FiMapPin size={14} className="text-gray-400" />
                          {event.location}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[event.status] || 'bg-gray-100 text-gray-700'}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/dashboard/events/${event.id}`}
                          className="p-2.5 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                          aria-label={`Editar ${event.title}`}
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label={`Eliminar ${event.title}`}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
