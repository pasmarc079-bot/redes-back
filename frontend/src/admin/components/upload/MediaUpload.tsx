import { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiImage, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import { showToast } from '@/admin/components/ui/Toast';

interface MediaUploadProps {
  onUpload: (url: string, media?: { id: string; label: string | null }) => void;
  accept?: Record<string, string[]>;
  label?: string;
  showLabelInput?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || '/api/v1',
});

export default function MediaUpload({ onUpload, accept, label, showLabelInput = false }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [mediaLabel, setMediaLabel] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (fileOverride?: File) => {
    const file = fileOverride || selectedFile;
    if (!file) return;
    if (showLabelInput && !mediaLabel.trim()) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      if (showLabelInput) {
        formData.append('label', mediaLabel.trim());
      }
      const res = await api.post('/admin/media/upload', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpload(res.data.originalUrl, { id: res.data.id, label: res.data.label });
      resetState();
    } catch {
      showToast('error', 'Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Simple consumers keep the original one-step upload behavior.
    if (!showLabelInput) void handleUpload(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileSelect,
    accept: accept || {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/gif': [],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    noClick: !!selectedFile,
    noKeyboard: !!selectedFile,
  });

  const resetState = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setMediaLabel('');
  };

  const handleRemoveFile = () => {
    resetState();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canUpload = showLabelInput ? !!selectedFile && !!mediaLabel.trim() : !!selectedFile;
  if (!showLabelInput) {
    return (
      <div>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-gold bg-gold/5'
              : 'border-gray-300 hover:border-gold hover:bg-gold/5'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600">Subiendo a Cloudinary...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <FiUpload className="text-gray-400 text-3xl" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {isDragActive ? 'Suelta la imagen aquí' : label || 'Arrastra una imagen o haz clic para subir'}
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP o GIF (máx. 10MB)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          data-testid="dropzone-step1"
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-gold bg-gold/5'
              : 'border-gray-300 hover:border-gold hover:bg-gold/5'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <FiUpload className="text-gray-400 text-3xl" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                {isDragActive ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz clic para seleccionar'}
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP o GIF (máx. 10MB)</p>
            </div>
          </div>
        </div>
      ) : (
        <div data-testid="step2-metadata" className="space-y-3">
          <div className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200" style={{ aspectRatio: '16/9' }}>
            <img
              src={previewUrl!}
              alt="Vista previa"
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={handleRemoveFile}
              data-testid="remove-file"
              className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Eliminar imagen seleccionada"
            >
              <FiX size={14} />
            </button>
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1.5">
              <FiImage size={12} />
              <span className="truncate max-w-[200px]">{selectedFile.name}</span>
              <span className="text-gray-300">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
            </div>
          </div>

          <div>
            <label htmlFor="media-label-input" className="label">
              Etiqueta <span className="text-red-500">*</span>
            </label>
            <input
              id="media-label-input"
              type="text"
              value={mediaLabel}
              onChange={(e) => setMediaLabel(e.target.value)}
              placeholder="Ej: Logo Ministerio, Retrato Pastor"
              className="input w-full"
              data-testid="label-input"
              autoFocus
            />
          </div>

          <button
            type="button"
            onClick={() => void handleUpload()}
            disabled={!canUpload || uploading}
            data-testid="upload-button"
            className="btn btn-primary w-full"
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Subiendo...
              </>
            ) : (
              <>
                <FiCheck size={16} />
                Subir imagen
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
