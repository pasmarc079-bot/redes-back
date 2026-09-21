import { useState, FormEvent, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiAlertCircle, FiImage } from 'react-icons/fi';
import MediaUpload from '@/admin/components/upload/MediaUpload';
import MediaPicker from '@/admin/components/ui/MediaPicker';
import adminApi from '@/services/adminApi';

export default function EventForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const titleRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    address: '',
    capacity: '',
    registrationUrl: '',
    status: 'DRAFT',
    isFeatured: false,
  });
  const [flyerUrl, setFlyerUrl] = useState('');
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const loadEvent = () => {
    if (isEditing) {
      setLoading(true);
      setLoadError('');
         adminApi
        .get(`/admin/events/detail/${id}`)
        .then((res) => {
          const e = res.data;
          setFormData({
            title: e.title,
            shortDescription: e.shortDescription || '',
            description: e.description || '',
            startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 16) : '',
            endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 16) : '',
            location: e.location || '',
            address: e.address || '',
            capacity: e.capacity?.toString() || '',
            registrationUrl: e.registrationUrl || '',
            status: e.status,
            isFeatured: e.isFeatured,
          });
          setFlyerUrl(e.flyerUrl || '');
        })
        .catch((err) => setLoadError(err.response?.data?.error || 'No se pudo cargar el evento.'))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id, isEditing]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.startDate) {
      setTouched({ title: true, startDate: true });
      return;
    }

    setSaving(true);

    try {
      const data = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        flyerUrl: flyerUrl || undefined,
      };

      if (isEditing) {
         await adminApi.put(`/admin/events/${id}`, data);
      } else {
         await adminApi.post('/admin/events', data);
      }

      navigate('/admin/dashboard/events');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  if (loadError) return (
    <div className="card p-8 text-center" role="alert">
      <h1 className="font-heading text-xl font-semibold text-gray-800">No se pudo cargar el evento</h1>
      <p className="mt-2 text-red-700">{loadError}</p>
      <div className="mt-5 flex justify-center gap-3">
        <button type="button" onClick={loadEvent} className="btn btn-secondary">Reintentar</button>
        <button type="button" onClick={() => navigate('/admin/dashboard/events')} className="btn btn-ghost">Volver a eventos</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/dashboard/events')} className="text-gray-500 hover:text-gray-700">
          <FiArrowLeft size={20} />
        </button>
        <h1 className="font-heading text-2xl font-bold text-gray-800">
          {isEditing ? 'Editar Evento' : 'Nuevo Evento'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {error && (
          <div
            role="alert"
            className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2"
          >
            <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 space-y-4">
              <div>
                <label className="label">Título *</label>
                <input
                  ref={titleRef}
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
                  className={`input ${touched.title && !formData.title.trim() ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                  required
                />
                {touched.title && !formData.title.trim() && (
                  <p className="mt-1 text-xs text-red-500">El título es obligatorio</p>
                )}
              </div>

              <div>
                <label className="label">Descripción corta</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="input"
                  placeholder="Resumen breve del evento"
                />
              </div>

              <div>
                <label className="label">Descripción completa</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={6}
                  placeholder="Detalles del evento..."
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Flyer */}
            <div className="card p-6">
              <h3 className="font-heading font-semibold text-gray-800 mb-4">Flyer / Imagen</h3>
              {flyerUrl ? (
                <div className="relative">
                  <img src={flyerUrl} alt="Flyer" className="w-full rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setFlyerUrl('')}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <FiArrowLeft size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button type="button" onClick={() => setMediaPickerOpen(true)} className="btn btn-ghost text-sm w-full">
                    <FiImage /> Elegir de biblioteca
                  </button>
                   <MediaUpload onUpload={(url) => setFlyerUrl(url)} showLabelInput />
                </div>
              )}
              <MediaPicker
                open={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={(url) => setFlyerUrl(url)}
              />
            </div>

            {/* Status */}
            <div className="card p-6 space-y-4">
              <div>
                <label className="label">Estado</label>
                <div className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
                  Se calcula automáticamente según la fecha y hora del evento.
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-gray-300 text-gold focus:ring-gold"
                />
                <span className="text-sm text-gray-700">Evento destacado</span>
              </label>
            </div>
          </div>
        </div>

        {/* Details */}
           <div className="card p-6">
             <h3 className="font-heading font-semibold text-gray-800 mb-4">Detalles</h3>
             <p className="mb-4 rounded-lg bg-gold/10 px-3 py-2 text-sm text-dark-light">
               Zona horaria: <strong>América/Guayaquil (UTC-5 - Ecuador)</strong>
             </p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha de inicio *</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                onBlur={() => setTouched((prev) => ({ ...prev, startDate: true }))}
                className={`input ${touched.startDate && !formData.startDate ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                required
              />
              {touched.startDate && !formData.startDate && (
                <p className="mt-1 text-xs text-red-500">La fecha de inicio es obligatoria</p>
              )}
            </div>
            <div>
              <label className="label">Fecha de fin</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Ubicación</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
                placeholder="Ej: Copotaxi"
              />
            </div>
            <div>
              <label className="label">Dirección</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input"
                placeholder="20 de Junio y Cotopaxi, Lago Agrio"
              />
            </div>
            <div>
              <label className="label">Capacidad</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="input"
                placeholder="500"
              />
            </div>
            <div>
              <label className="label">URL de registro</label>
              <input
                type="url"
                value={formData.registrationUrl}
                onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                className="input"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/dashboard/events')} className="btn btn-ghost">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-50 inline-flex items-center gap-2">
            {saving ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <FiSave />
            )}
            {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear evento'}
          </button>
        </div>
      </form>
    </div>
  );
}
