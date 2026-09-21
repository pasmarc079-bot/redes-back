import { useCallback, useEffect, useState } from 'react';
import { FiCopy, FiImage, FiRefreshCw, FiTrash2, FiCheckCircle, FiAlertCircle, FiInfo, FiSearch, FiX } from 'react-icons/fi';
import axios from 'axios';
import MediaUpload from '@/admin/components/upload/MediaUpload';
import { showConfirm } from '@/admin/components/ui/ConfirmModal';
import { showToast } from '@/admin/components/ui/Toast';

interface MediaItem {
  id: string;
  originalUrl: string;
  thumbnailUrl: string | null;
  mediumUrl: string | null;
  fileName: string;
  mimeType: string;
  fileSize: string;
  createdAt: string;
  width?: number | null;
  height?: number | null;
  label?: string | null;
}

interface HealthStatus {
  status: 'ok' | 'error';
  config: boolean;
  cloud_name?: string;
  message?: string;
}

interface UsageInfo {
  url: string;
  usage: string[];
  count: number;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || '/api/v1',
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function formatFileSize(bytes: string | number): string {
  const b = Number(bytes);
  if (b === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export default function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [usageCache, setUsageCache] = useState<Map<string, UsageInfo>>(new Map());
  const [checkingUsage, setCheckingUsage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelValue, setLabelValue] = useState('');

  const load = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = search ? { search } : {};
      const [mediaRes, healthRes] = await Promise.allSettled([
        api.get('/admin/media', { params }),
        api.get('/admin/media/health'),
      ]);
      if (mediaRes.status === 'fulfilled') setItems(mediaRes.value.data);
      if (healthRes.status === 'fulfilled') setHealth(healthRes.value.data);
    } catch {
      setError('Error al cargar la biblioteca de media.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = useCallback(() => { load(searchQuery || undefined); }, [load, searchQuery]);

  const handleSearch = useCallback(() => {
    load(searchQuery || undefined);
  }, [load, searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    load();
  }, [load]);

  const checkUsage = async (item: MediaItem) => {
    setCheckingUsage(item.id);
    try {
      const res = await api.get(`/admin/media/usage/${encodeURIComponent(item.originalUrl)}`);
      setUsageCache((prev) => new Map(prev).set(item.id, res.data));
    } catch {
      setUsageCache((prev) => new Map(prev).set(item.id, { url: item.originalUrl, usage: [], count: 0 }));
    } finally {
      setCheckingUsage(null);
    }
  };

  const copyUrl = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.originalUrl);
      setCopiedId(item.id);
      showToast('success', 'URL copiada al portapapeles.');
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      showToast('error', 'No se pudo copiar la URL.');
    }
  };

  const saveLabel = async (item: MediaItem) => {
    try {
      await api.patch(`/admin/media/${item.id}/label`, { label: labelValue.trim() || null });
      setItems((prev) => prev.map((m) => m.id === item.id ? { ...m, label: labelValue.trim() || null } : m));
      setEditingLabel(null);
      showToast('success', 'Etiqueta guardada.');
    } catch {
      showToast('error', 'Error al guardar la etiqueta.');
    }
  };

  const handleDelete = async (item: MediaItem) => {
    const usage = usageCache.get(item.id);
    const warning = usage && usage.count > 0
      ? `\n\nEste archivo se usa en: ${usage.usage.join(', ')}`
      : '';
    const ok = await showConfirm({
      title: 'Eliminar archivo',
      message: `¿Eliminar "${item.fileName}"? Esta acción no se puede deshacer.${warning}`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/admin/media/${item.id}`);
      setItems((prev) => prev.filter((m) => m.id !== item.id));
      showToast('success', 'Archivo eliminado correctamente.');
    } catch {
      showToast('error', 'Error al eliminar el archivo.');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl text-gray-800">Biblioteca de Media</h1>
        <p className="text-sm text-gray-500 mt-1">
          Administra todas las imágenes del sitio. Sube, organiza y reutiliza fotos para eventos, blog y páginas.
        </p>
      </div>

      {health && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm mb-6 ${
          health.status === 'ok'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {health.status === 'ok' ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
          <span className="font-medium">Cloudinary:</span>
          {health.status === 'ok'
            ? `Conectado (${health.cloud_name}) — Imágenes almacenadas en la nube`
            : `Error: ${health.message || 'No conectado'}`
          }
        </div>
      )}

      <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm mb-6">
        <FiInfo size={16} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">¿Cómo funciona?</p>
          <p className="text-blue-600 mt-0.5">
            Las imágenes se almacenan en Cloudinary (nube). Puedes subirlas aquí y luego usarlas en eventos, artículos del blog o configuración del sitio. Asigna etiquetas para organizar y encuentra imágenes rápidamente.
          </p>
        </div>
      </div>

      <MediaUpload onUpload={handleUpload} showLabelInput />

      {/* Search bar */}
      <div className="flex gap-2 mt-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar por nombre o etiqueta..."
            className="input pl-10 pr-10"
          />
          {searchQuery && (
            <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX size={16} />
            </button>
          )}
        </div>
        <button onClick={handleSearch} className="btn btn-primary">
          <FiSearch /> Buscar
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Cargando media...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400 flex flex-col items-center gap-3">
            <FiImage className="text-5xl text-gray-300" />
            <p className="text-lg font-medium text-gray-500">
              {searchQuery ? 'No se encontraron resultados' : 'No hay archivos aún'}
            </p>
            <p className="text-sm">
              {searchQuery ? 'Intenta con otra búsqueda' : 'Sube tu primera imagen usando el botón de arriba.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{items.length} archivos</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => {
                const usage = usageCache.get(item.id);
                return (
                  <div key={item.id} className="group card overflow-hidden">
                    <div className="relative h-44 bg-gray-100 overflow-hidden">
                      <img
                        src={item.mediumUrl || item.thumbnailUrl || item.originalUrl}
                        alt={item.label || item.fileName}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 p-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => copyUrl(item)} className="p-2 rounded-lg bg-white/90 text-gray-700 hover:text-gold transition-colors" title="Copiar URL">
                          <FiCopy size={14} />
                        </button>
                        <button onClick={() => checkUsage(item)} className="p-2 rounded-lg bg-white/90 text-gray-700 hover:text-blue-600 transition-colors" title="Ver usos">
                          <FiInfo size={14} />
                        </button>
                        <button onClick={() => handleDelete(item)} className="p-2 rounded-lg bg-white/90 text-red-500 hover:text-red-700 transition-colors" title="Eliminar">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                      {copiedId === item.id && (
                        <span className="absolute top-2 right-2 px-2.5 py-1 text-xs font-medium bg-green-600 text-white rounded-lg shadow">
                          Copiada
                        </span>
                      )}
                    </div>

                    <div className="p-3 space-y-2">
                      {/* Label */}
                      {editingLabel === item.id ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={labelValue}
                            onChange={(e) => setLabelValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveLabel(item)}
                            className="input text-xs py-1 px-2 flex-1"
                            placeholder="Etiqueta"
                            autoFocus
                          />
                          <button onClick={() => saveLabel(item)} className="text-green-600 hover:text-green-700 p-1">
                            <FiCheckCircle size={14} />
                          </button>
                          <button onClick={() => setEditingLabel(null)} className="text-gray-400 hover:text-gray-600 p-1">
                            <FiX size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingLabel(item.id); setLabelValue(item.label || ''); }}
                          className="text-left w-full"
                        >
                          {item.label ? (
                            <span className="badge badge-success text-[10px]">{item.label}</span>
                          ) : (
                            <span className="text-xs text-gray-400 italic hover:text-gold">+ Agregar etiqueta</span>
                          )}
                        </button>
                      )}

                      <p className="text-xs font-medium text-gray-800 truncate" title={item.fileName}>
                        {item.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatFileSize(item.fileSize)}</span>
                        {item.width && item.height && (
                          <>
                            <span>·</span>
                            <span>{item.width}×{item.height}</span>
                          </>
                        )}
                      </div>

                      {checkingUsage === item.id && (
                        <p className="text-xs text-blue-500 animate-pulse">Verificando usos...</p>
                      )}
                      {usage && usage.count > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {usage.usage.map((u, i) => (
                            <span key={i} className="badge badge-success text-[10px]">{u}</span>
                          ))}
                        </div>
                      )}
                      {usage && usage.count === 0 && (
                        <p className="text-xs text-gray-400 italic">Sin uso detectado</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
