import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX } from 'react-icons/fi';
import axios from 'axios';

interface MediaUploadProps {
  onUpload: (url: string) => void;
  accept?: Record<string, string[]>;
  label?: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || '/api/v1',
});

export default function MediaUpload({ onUpload, accept, label }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setUploading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', acceptedFiles[0]);
        const res = await api.post('/admin/media/upload', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        onUpload(res.data.originalUrl);
      } catch {
        setError('Error al subir la imagen. Intenta de nuevo.');
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/gif': [],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

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
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <FiX /> {error}
        </p>
      )}
    </div>
  );
}
