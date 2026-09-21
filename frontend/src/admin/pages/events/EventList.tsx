import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiMapPin, FiRefreshCw, FiSearch } from 'react-icons/fi';
import adminApi from '@/services/adminApi';
import { showConfirm } from '@/admin/components/ui/ConfirmModal';
import { showToast } from '@/admin/components/ui/Toast';

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
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadEvents = () => {
    setLoading(true);
    setError('');
    adminApi
      .get('/admin/events/all')
      .then((res) => setEvents(res.data.events))
      .catch(() => setError('No se pudieron cargar los eventos. Verifica tu conexión e inténtalo de nuevo.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = `${event.title} ${event.location || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (statusFilter === 'ALL' || event.status === statusFilter);
  });

  const handleDelete = async (id: string) => {
    const ok = await showConfirm({
      title: 'Eliminar evento',
      message: '¿Estás seguro de eliminar este evento? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await adminApi.delete(`/admin/events/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      showToast('success', 'Evento eliminado correctamente.');
    } catch {
      showToast('error', 'Error al eliminar el evento.');
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    UPCOMING: 'bg-green-100 text-green-700',
    ONGOING: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-gray-100 text-gray-500',
    CANCELLED: 'bg-red-100 text-red-700',
  };
  const statusLabels: Record<string, string> = {
    DRAFT: 'Borrador',
    UPCOMING: 'Próximo',
    ONGOING: 'En curso',
    COMPLETED: 'Finalizado',
    CANCELLED: 'Cancelado',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-800">Eventos</h1>
        <Link to="/admin/dashboard/events/new" className="btn btn-primary">
          <FiPlus /> Nuevo evento
        </Link>
      </div>

      <div className="card p-4 mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative flex-1" htmlFor="event-search">
          <FiSearch className="absolute left-3 top-3.5 text-gray-400" aria-hidden="true" />
          <input id="event-search" value={search} onChange={(e) => setSearch(e.target.value)} className="input w-full pl-10" placeholder="Buscar por título o ubicación" />
        </label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select md:w-48" aria-label="Filtrar eventos por estado">
          <option value="ALL">Todos los estados</option>
          <option value="DRAFT">Borradores</option>
          <option value="UPCOMING">Próximos</option>
          <option value="ONGOING">En curso</option>
          <option value="COMPLETED">Completados</option>
          <option value="CANCELLED">Cancelados</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : error ? (
          <div className="p-8 text-center" role="alert">
            <p className="text-red-700">{error}</p>
            <button type="button" onClick={loadEvents} className="btn btn-secondary mt-4"><FiRefreshCw /> Reintentar</button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {events.length === 0 ? <>No hay eventos. <Link to="/admin/dashboard/events/new" className="text-gold hover:underline">Crea el primero</Link></> : 'No hay eventos que coincidan con los filtros.'}
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
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                       <div className="flex items-center gap-3 p-1">
                        {event.flyerUrl ? (
                          <img src={event.flyerUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                           <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center p-1">
                            <FiCalendar className="text-gold" />
                          </div>
                        )}
                         <div className="p-1">
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
                       <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[event.status] || 'bg-gray-100 text-gray-700'}`} title="Estado calculado automáticamente por fecha">
                         {statusLabels[event.status] || event.status}
                       </span>
                    </td>
                    <td className="table-cell text-right">
                       <div className="flex items-center justify-end gap-1 p-1">
                        <Link
                          to={`/admin/dashboard/events/${event.id}`}
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
