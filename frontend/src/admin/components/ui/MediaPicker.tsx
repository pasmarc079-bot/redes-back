import { useCallback, useEffect, useState } from 'react';
import { FiSearch, FiX, FiImage, FiUpload } from 'react-icons/fi';
import axios from 'axios';

interface MediaItem {
  id: string;
  originalUrl: string;
  thumbnailUrl: string | null;
  mediumUrl: string | null;
  fileName: string;
  label?: string | null;
  fileSize: string;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || '/api/v1',
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function MediaPicker({ open, onClose, onSelect }: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadItems = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const res = await api.get('/admin/media', { params });
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadItems();
      setSelectedId(null);
      setSearchQuery('');
    }
  }, [open, loadItems]);

  const handleSearch = () => {
    loadItems(searchQuery || undefined);
  };

  const handleSelect = () => {
    const item = items.find((i) => i.id === selectedId);
    if (item) {
      onSelect(item.originalUrl);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FiImage className="text-gold" size={20} />
            <h2 className="font-heading text-lg font-semibold text-gray-800">Seleccionar imagen de la biblioteca</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar biblioteca" className="text-gray-400 hover:text-gray-600 p-2 min-h-11 min-w-11">
            <FiX size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar por nombre o etiqueta..."
                className="input pl-10 text-sm"
                autoFocus
              />
            </div>
            <button onClick={handleSearch} className="btn btn-primary text-sm px-4">
              Buscar
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Cargando imágenes...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FiImage className="mx-auto text-4xl mb-3 text-gray-300" />
              <p>No hay imágenes en la biblioteca.</p>
              <p className="text-sm mt-1">Sube imágenes primero en la Biblioteca de Media.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedId === item.id
                      ? 'border-gold ring-2 ring-gold/30'
                      : 'border-gray-200 hover:border-gold/50'
                  }`}
                >
                  <img
                    src={item.thumbnailUrl || item.mediumUrl || item.originalUrl}
                    alt={item.label || item.fileName}
                    className="w-full h-full object-cover"
                  />
                  {item.label && (
                    <span className="absolute bottom-0 left-0 right-0 px-1.5 py-0.5 text-[10px] font-medium bg-black/60 text-white truncate">
                      {item.label}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p className="text-sm text-gray-500">
            {items.length} imágenes disponibles
            {selectedId && ' — 1 seleccionada'}
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn btn-ghost text-sm">
              Cancelar
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedId}
              className="btn btn-primary text-sm disabled:opacity-50"
            >
              <FiUpload size={14} />
              Seleccionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
