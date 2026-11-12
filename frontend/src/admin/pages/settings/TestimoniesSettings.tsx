import { useEffect, useState } from 'react';
import { FiCheckCircle, FiChevronDown, FiChevronUp, FiEdit3, FiExternalLink, FiPlus, FiSave, FiTrash2, FiUpload, FiX, FiAlertTriangle } from 'react-icons/fi';
import { FaYoutube } from 'react-icons/fa6';
import { showConfirm } from '@/admin/components/ui/ConfirmModal';
import { showToast } from '@/admin/components/ui/Toast';
import adminApi from '@/services/adminApi';
import { extractYouTubeId } from '@/utils/youtube';

interface TestimonialVideo {
  id: string;
  title: string;
  sourceType: 'youtube' | 'upload';
  videoUrl: string;
  posterUrl: string | null;
  order: number;
  isActive: boolean;
}

interface GoogleStatus {
  configured: boolean;
  missing: string[];
  lastSyncAt: string | null;
  lastError: string | null;
  cachedCount: number;
}

const MAX_VIDEO_MB = 50;
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ACCEPTED_VIDEO = VIDEO_TYPES.join(',');

const apiError = (error: any, fallback: string) => error?.response?.data?.error || fallback;

const youtubeThumb = (url: string) => {
  const id = extractYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/default.jpg` : null;
};

export default function TestimoniesSettings() {
  const [videos, setVideos] = useState<TestimonialVideo[]>([]);
  const [googleStatus, setGoogleStatus] = useState<GoogleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<(Partial<TestimonialVideo> & { title: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      adminApi.get('/testimonials/admin/videos'),
      adminApi.get('/testimonials/admin/reviews/status'),
    ])
      .then(([videoRes, statusRes]) => {
        setVideos(videoRes.data);
        setGoogleStatus(statusRes.data);
      })
      .catch(() => showToast('error', 'No se pudieron cargar los testimonios.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const closeEditor = () => {
    setEditor(null);
    setFormError('');
    setFieldErrors({});
    setUploadProgress(null);
  };

  const persistOrder = async (items: TestimonialVideo[]) => {
    try {
      await adminApi.put('/testimonials/admin/videos/batch', { items: items.map(item => ({ id: item.id, order: item.order, isActive: item.isActive })) });
    } catch (error) {
      showToast('error', apiError(error, 'No se pudo guardar el orden.'));
      loadAll();
    }
  };

  const moveVideo = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= videos.length) return;
    const next = [...videos];
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((item, i) => ({ ...item, order: i + 1 }));
    setVideos(reordered);
    persistOrder(reordered);
  };

  const toggleVideo = (index: number) => {
    const updated = videos.map((item, i) => (i === index ? { ...item, isActive: !item.isActive } : item));
    setVideos(updated);
    persistOrder(updated);
  };

  const removeVideo = async (video: TestimonialVideo) => {
    const confirmed = await showConfirm({
      title: 'Eliminar testimonio',
      message: `Se quitará "${video.title}" del sitio público.${video.sourceType === 'upload' ? ' El archivo también se borrará del almacenamiento.' : ''}`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!confirmed) return;
    try {
      await adminApi.delete(`/testimonials/admin/videos/${video.id}`);
      showToast('success', 'Testimonio eliminado.');
      setVideos(current => current.filter(item => item.id !== video.id));
    } catch (error) {
      showToast('error', apiError(error, 'No se pudo eliminar el testimonio.'));
    }
  };

  const handleVideoFile = async (file: File) => {
    if (!VIDEO_TYPES.includes(file.type)) {
      setFormError('Formato no permitido. Usa MP4, WebM o MOV.');
      return;
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setFormError(`El video supera ${MAX_VIDEO_MB} MB. Comprímelo o usa un enlace de YouTube.`);
      return;
    }
    setFormError('');
    setUploadProgress(0);
    try {
      const data = new FormData();
      data.append('file', file);
      const { data: uploaded } = await adminApi.post('/testimonials/admin/videos/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) setUploadProgress(Math.round((event.loaded / event.total) * 100));
        },
      });
      setEditor(current => current && { ...current, sourceType: 'upload', videoUrl: uploaded.videoUrl, posterUrl: uploaded.posterUrl });
    } catch (error) {
      setFormError(apiError(error, 'No se pudo subir el video.'));
    } finally {
      setUploadProgress(null);
    }
  };

  const saveEditor = async () => {
    if (!editor) return;
    setFormError('');
    const missing = { title: !editor.title?.trim(), videoUrl: !editor.videoUrl?.trim() };
    setFieldErrors(missing);
    if (missing.title || missing.videoUrl) {
      setFormError('Completa los campos marcados para continuar.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: editor.title,
        sourceType: editor.sourceType || 'youtube',
        videoUrl: editor.videoUrl || '',
        posterUrl: editor.posterUrl || null,
      };
      if (editor.id) await adminApi.put(`/testimonials/admin/videos/${editor.id}`, payload);
      else await adminApi.post('/testimonials/admin/videos', payload);
      showToast('success', 'Cambios guardados.');
      closeEditor();
      loadAll();
    } catch (error) {
      setFormError(apiError(error, 'No se pudo guardar. Revisa los campos.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-sm text-gray-500">Cargando testimonios...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-heading text-2xl font-semibold text-gray-800">Testimonios</h3>
        <p className="mt-1 max-w-3xl text-sm text-gray-500">
          Los videos y las reseñas que verás en el inicio y en la página de Comunidad. Lo que desactives deja de verse en el sitio, pero no se borra: puedes volver a activarlo cuando quieras.
        </p>
      </div>

      <GoogleConnectionCard status={googleStatus} />

      <section className="card card-body" aria-labelledby="videos-heading">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 id="videos-heading" className="font-heading text-lg font-semibold text-gray-800">Videos de testimonios</h4>
            <p className="mt-1 text-sm text-gray-500">Pega el enlace de un video de YouTube o sube el archivo desde tu equipo.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => { setFormError(''); setFieldErrors({}); setEditor({ title: '', sourceType: 'youtube', videoUrl: '', isActive: true }); }}>
            <FiPlus /> Agregar video
          </button>
        </div>

        {videos.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">Aún no hay videos. Agrega el primero para mostrarlo en el sitio.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {videos.map((video, index) => (
              <li key={video.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:flex-row md:items-center">
                <div className="flex flex-col md:w-10">
                  <button type="button" onClick={() => moveVideo(index, -1)} disabled={index === 0} className="min-h-9 min-w-9 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30" aria-label={`Subir ${video.title}`}><FiChevronUp /></button>
                  <button type="button" onClick={() => moveVideo(index, 1)} disabled={index === videos.length - 1} className="min-h-9 min-w-9 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30" aria-label={`Bajar ${video.title}`}><FiChevronDown /></button>
                </div>
                <div className="h-16 w-10 shrink-0 overflow-hidden rounded-md bg-gray-200">
                  {(video.posterUrl || (video.sourceType === 'youtube' && youtubeThumb(video.videoUrl))) && (
                    <img src={video.posterUrl || youtubeThumb(video.videoUrl)!} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading font-semibold text-gray-800">{video.title}</p>
                  <p className="truncate text-sm text-gray-500">{video.sourceType === 'youtube' ? `YouTube · ${extractYouTubeId(video.videoUrl) || 'enlace no válido'}` : 'Video subido'}</p>
                </div>
                <div className="flex items-center justify-between gap-2 md:justify-end">
                  <label className="flex min-h-11 items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={video.isActive} onChange={() => toggleVideo(index)} className="rounded border-gray-300 text-gold focus:ring-gold/20" />
                    Visible
                  </label>
                  <button type="button" onClick={() => { setFormError(''); setFieldErrors({}); setEditor({ ...video }); }} className="btn btn-secondary whitespace-nowrap"><FiEdit3 /> Editar</button>
                  <button type="button" onClick={() => removeVideo(video)} className="min-h-11 min-w-11 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600" aria-label={`Eliminar ${video.title}`}><FiTrash2 /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editor && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="testimony-editor-title">
          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-dark">Testimonio en video</p>
                <h4 id="testimony-editor-title" className="mt-1 font-heading text-xl font-semibold text-gray-800">
                  {editor.id ? 'Editar video' : 'Agregar video'}
                </h4>
              </div>
              <button type="button" onClick={closeEditor} className="min-h-11 min-w-11 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Cerrar editor"><FiX size={21} /></button>
            </div>

            <form className="space-y-5 px-5 py-6 sm:px-7" onSubmit={(event) => { event.preventDefault(); saveEditor(); }} noValidate>
              {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
              <VideoFields editor={editor} errors={fieldErrors} onChange={(patch) => setEditor(current => current && { ...current, ...patch })} onFile={handleVideoFile} uploadProgress={uploadProgress} />
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeEditor} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={saving || uploadProgress !== null} className="btn btn-primary"><FiSave /> {saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleConnectionCard({ status }: { status: GoogleStatus | null }) {
  if (!status) return null;

  const formatted = status.lastSyncAt
    ? new Date(status.lastSyncAt).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Guayaquil' })
    : null;

  if (!status.configured) {
    const faltaClave = status.missing?.includes('GOOGLE_API_KEY');
    const faltaNegocio = status.missing?.includes('GOOGLE_PLACE_ID');

    return (
      <section className="card card-body border-amber-200 bg-amber-50/60" aria-labelledby="google-status-heading">
        <h4 id="google-status-heading" className="flex items-center gap-2 font-heading text-lg font-semibold text-gray-800">
          <FiAlertTriangle className="text-amber-600" aria-hidden="true" /> Las reseñas de Google aún no están conectadas
        </h4>
        <p className="mt-2 text-sm text-gray-700">
          Las reseñas se leen de la ficha de Google de la iglesia. Hasta conectarlas, los visitantes no verán este bloque.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-gray-700">
          {faltaClave && (
            <li className="flex gap-2">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              <span>
                Falta la <code className="rounded bg-white px-1 py-0.5 text-xs">GOOGLE_API_KEY</code>: la clave que autoriza a leer la
                ficha de Google. Se agrega una sola vez en el panel de Seenode, en <em>Environment variables</em> del backend.
              </span>
            </li>
          )}
          {faltaNegocio && (
            <li className="flex gap-2">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              <span>
                Falta el <code className="rounded bg-white px-1 py-0.5 text-xs">GOOGLE_PLACE_ID</code>: el identificador del negocio
                en Google.
              </span>
            </li>
          )}
        </ul>
        <p className="mt-3 text-xs text-gray-500">
          En cuanto se agreguen, la conexión se activa sola y las reseñas aparecen en el sitio sin necesidad de tocar nada más.
        </p>
      </section>
    );
  }

  return (
    <section className="card card-body" aria-labelledby="google-status-heading">
      <h4 id="google-status-heading" className="flex items-center gap-2 font-heading text-lg font-semibold text-gray-800">
        <FiCheckCircle className="text-green-600" aria-hidden="true" /> Reseñas de Google conectadas
      </h4>
      <p className="mt-2 text-sm text-gray-600">
        {status.cachedCount} {status.cachedCount === 1 ? 'reseña visible' : 'reseñas visibles'} en el sitio
        {formatted && <> · última actualización {formatted}</>}
      </p>
      <p className="mt-1 text-xs text-gray-500">Las reseñas se actualizan solas cada hora. Si quieres que aparezcan otras, publícalas en Google y se verán solas.</p>
      {status.lastError && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Última sincronización con error: {status.lastError}. Se muestran las reseñas guardadas hasta que vuelva a funcionar.
        </p>
      )}
    </section>
  );
}

function VideoFields({ editor, errors, onChange, onFile, uploadProgress }: {
  editor: Partial<TestimonialVideo> & { title: string };
  errors: Record<string, boolean>;
  onChange: (patch: Partial<TestimonialVideo>) => void;
  onFile: (file: File) => void;
  uploadProgress: number | null;
}) {
  const isYouTube = (editor.sourceType || 'youtube') === 'youtube';
  const youtubeValid = !isYouTube || !editor.videoUrl || !!extractYouTubeId(editor.videoUrl);

  return (
    <>
      <div className="field-group">
        <label className="label" htmlFor="testimony-title">Nombre del testimonio</label>
        <p className="mb-2 text-xs text-gray-500">Se muestra sobre el video. Ej: "Testimonio de Ana, Lago Agrio".</p>
        <input id="testimony-title" className={`input w-full ${errors.title ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`} maxLength={150} value={editor.title} onChange={(e) => onChange({ title: e.target.value })} aria-invalid={!!errors.title} required />
        {errors.title && <p className="mt-1 text-xs text-red-600">El nombre del testimonio es obligatorio.</p>}
      </div>

      <fieldset className="field-group">
        <legend className="label mb-2">Origen del video</legend>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex min-h-11 flex-1 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm has-[:checked]:border-gold has-[:checked]:bg-gold/10">
            <input type="radio" name="source" checked={isYouTube} onChange={() => onChange({ sourceType: 'youtube', videoUrl: '', posterUrl: null })} className="text-gold focus:ring-gold/20" />
            Enlace de YouTube
          </label>
          <label className="flex min-h-11 flex-1 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm has-[:checked]:border-gold has-[:checked]:bg-gold/10">
            <input type="radio" name="source" checked={!isYouTube} onChange={() => onChange({ sourceType: 'upload', videoUrl: '', posterUrl: null })} className="text-gold focus:ring-gold/20" />
            Subir archivo
          </label>
        </div>
      </fieldset>

      {isYouTube ? (
        <div className="field-group">
          <label className="label" htmlFor="testimony-youtube">Enlace del video</label>
          <p className="mb-2 text-xs text-gray-500">Acepta enlaces de YouTube normales, Shorts o youtu.be.</p>
          <input
            id="testimony-youtube"
            type="url"
            className={`input w-full ${youtubeValid && !errors.videoUrl ? '' : 'border-red-400 focus:border-red-500 focus:ring-red-200'}`}
            placeholder="https://www.youtube.com/shorts/..."
            value={editor.videoUrl || ''}
            onChange={(e) => onChange({ videoUrl: e.target.value })}
            aria-invalid={!youtubeValid || !!errors.videoUrl}
            aria-describedby="testimony-youtube-help"
          />
          <p id="testimony-youtube-help" className={`mt-2 text-xs ${youtubeValid && !errors.videoUrl ? 'text-gray-500' : 'text-red-600'}`}>
            {errors.videoUrl ? 'Pega el enlace del video.' : youtubeValid ? 'El enlace se guardará en formato estándar.' : 'Este enlace no parece un video de YouTube válido.'}
          </p>
        </div>
      ) : (
        <div className="field-group">
          <div className="mb-4 flex gap-3 rounded-xl border border-gold/40 bg-gold/10 p-4">
            <FaYoutube className="mt-0.5 shrink-0 text-red-600" size={20} aria-hidden="true" />
            <div className="text-sm text-dark-light">
              <p className="font-semibold text-dark">Recomendado: sube el video a YouTube</p>
              <p className="mt-1">Es la forma más fácil y rápida de publicar un video, y no tiene límite de tamaño. Cuando termines, pega aquí el enlace.</p>
              <a href="https://studio.youtube.com/" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-1.5 font-semibold text-gold-ink underline-offset-4 hover:underline">
                Ir a YouTube Studio para subir el video
                <FiExternalLink aria-hidden="true" />
              </a>
            </div>
          </div>
          <label className="label" htmlFor="testimony-file">Archivo de video <span className="font-normal text-gray-400">(solo si no puedes usar YouTube)</span></label>
          <p className="mb-2 text-xs text-gray-500">MP4, WebM o MOV. Máximo {MAX_VIDEO_MB} MB.</p>
          {editor.videoUrl ? (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">Video cargado correctamente.</p>
          ) : (
            <label htmlFor="testimony-file" className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600 hover:border-gold">
              <FiUpload size={22} aria-hidden="true" />
              <span>{uploadProgress !== null ? `Subiendo… ${uploadProgress}%` : 'Elige un video desde tu equipo'}</span>
              <input
                id="testimony-file"
                type="file"
                accept={ACCEPTED_VIDEO}
                className="sr-only"
                disabled={uploadProgress !== null}
                onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile(file); e.target.value = ''; }}
              />
            </label>
          )}
        </div>
      )}
    </>
  );
}
