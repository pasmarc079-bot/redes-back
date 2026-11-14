import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || '/api/v1',
});

export interface UploadedMedia {
  url: string;
  id?: string;
  label?: string | null;
}

/**
 * Sends a file to the media library and returns its public URL.
 * The API asks for a label, so the file name is used as the default one and can be renamed later.
 */
export async function uploadMediaFile(file: File, label?: string): Promise<UploadedMedia> {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('label', (label ?? file.name.replace(/\.[^.]+$/, '')).trim() || 'Imagen');

  const res = await api.post('/admin/media/upload', formData, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return { url: res.data.originalUrl, id: res.data.id, label: res.data.label };
}
