import { useState, FormEvent, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi';
import MediaUpload from '@/components/upload/MediaUpload';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || '/api/v1',
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

const BADGE_TYPES = [
  { value: 'VOLUNTEER', label: 'Voluntario' },
  { value: 'LEADER', label: 'Líder' },
  { value: 'ATTENDANCE', label: 'Asistencia' },
  { value: 'SERVICE', label: 'Servicio' },
  { value: 'SPECIAL', label: 'Especial' },
  { value: 'MILESTONE', label: 'Hito' },
];

export default function BadgeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const nameRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'VOLUNTEER',
    color: '#C9A84C',
    criteria: '',
    isActive: true,
  });
  const [iconUrl, setIconUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      api
        .get(`/admin/badges/${id}`)
        .then((res) => {
          const b = res.data;
          setFormData({
            name: b.name,
            description: b.description || '',
            type: b.type,
            color: b.color || '#C9A84C',
            criteria: b.criteria || '',
            isActive: b.isActive,
          });
          setIconUrl(b.iconUrl || '');
        })
        .catch(() => navigate('/dashboard/badges'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setTouched({ name: true });
      return;
    }

    setSaving(true);

    try {
      const data = { ...formData, iconUrl: iconUrl || undefined };
      if (isEditing) {
        await api.put(`/admin/badges/${id}`, data);
      } else {
        await api.post('/admin/badges', data);
      }
      navigate('/dashboard/badges');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/badges')} className="text-gray-500 hover:text-gray-700">
          <FiArrowLeft size={20} />
        </button>
        <h1 className="font-heading text-2xl font-bold text-gray-800">
          {isEditing ? 'Editar Insignia' : 'Nueva Insignia'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="max-w-2xl space-y-6">
        {error && (
          <div
            role="alert"
            className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2"
          >
            <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="card p-6 space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input
              ref={nameRef}
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              className={`input ${touched.name && !formData.name.trim() ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
              required
            />
            {touched.name && !formData.name.trim() && (
              <p className="mt-1 text-xs text-red-500">El nombre es obligatorio</p>
            )}
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
            />
          </div>

          <div>
            <label className="label">Criterio</label>
            <input
              type="text"
              value={formData.criteria}
              onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
              className="input"
              placeholder="¿Cómo se obtiene esta insignia?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input"
              >
                {BADGE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="input flex-1"
                  placeholder="#C9A84C"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Icono (opcional)</label>
            {iconUrl ? (
              <div className="relative inline-block">
                <img src={iconUrl} alt="Icon" className="w-16 h-16 rounded-lg" />
                <button
                  type="button"
                  onClick={() => setIconUrl('')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <MediaUpload onUpload={(url) => setIconUrl(url)} />
            )}
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-gold focus:ring-gold"
            />
            <span className="text-sm text-gray-700">Insignia activa</span>
          </label>
        </div>

        {/* Preview */}
        <div className="card p-6">
          <h3 className="font-heading font-semibold text-gray-800 mb-4">Vista previa</h3>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              {iconUrl ? (
                <img src={iconUrl} alt="" className="w-10 h-10 rounded" />
              ) : (
                <span className="text-2xl font-bold" style={{ color: formData.color }}>
                  {formData.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <p className="font-heading font-semibold text-gray-800">{formData.name || 'Nombre de la insignia'}</p>
              <p className="text-sm text-gray-500">{formData.description || 'Descripción...'}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/dashboard/badges')} className="btn btn-ghost">
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
            {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear insignia'}
          </button>
        </div>
      </form>
    </div>
  );
}
