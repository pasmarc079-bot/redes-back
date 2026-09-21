import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiAlertCircle, FiImage, FiX } from 'react-icons/fi';
import {
  useCreateBlockNote,
  SuggestionMenuController,
} from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import '@blocknote/core/fonts/inter.css';
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  HTMLToBlocks,
  createInternalHTMLSerializer,
} from '@blocknote/core';
import { createMediaWithTextBlockSpec } from '@/admin/components/editor/blocks/mediaWithText';
import { filterSuggestionItems } from '@blocknote/core/extensions';
import { getCustomSlashMenuItems } from '@/admin/components/editor/MediaWithTextSlashMenu';
import DOMPurify from 'dompurify';
import MediaUpload from '@/admin/components/upload/MediaUpload';
import MediaPicker from '@/admin/components/ui/MediaPicker';
import adminApi from '@/services/adminApi';

const schema = BlockNoteSchema.create({
  blockSpecs: {
    mediaWithText: createMediaWithTextBlockSpec(),
    ...defaultBlockSpecs,
  },
});

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const titleRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    seoTitle: '',
    seoDescription: '',
    status: 'DRAFT',
    tagIds: [] as string[],
  });
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const editor = useCreateBlockNote({
    schema,
    initialContent: undefined,
    uploadFile: async (file: File) => {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
       const res = await adminApi.post('/admin/media/upload', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.originalUrl;
    },
  });

  useEffect(() => {
    titleRef.current?.focus();
    adminApi.get('/posts/tags').then((res) => setTags(res.data));
  }, []);

  const loadPost = () => {
    if (isEditing && editor) {
      setLoading(true);
      setLoadError('');
      adminApi
         .get(`/admin/posts/detail/${id}`)
        .then(async (res) => {
          const p = res.data;
          const source = p.editingVersion || p;
          setFormData({
            title: source.title,
            excerpt: source.excerpt || '',
            seoTitle: source.seoTitle || '',
            seoDescription: source.seoDescription || '',
            status: source.status || p.status,
            tagIds: source.tagIds || p.tags?.map((t: any) => t.tag.id) || [],
          });
          setSelectedTags(source.tagIds || p.tags?.map((t: any) => t.tag.id) || []);
          setCoverImageUrl(source.coverImageUrl || '');
          if (source.content) {
            const blocks = await HTMLToBlocks(source.content, editor.pmSchema);
            editor.replaceBlocks(editor.topLevelBlocks, blocks as any);
          }
        })
        .catch((err) => setLoadError(err.response?.data?.error || 'No se pudo cargar el artículo.'))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadPost();
  }, [id, isEditing, editor]);

  const serializeContent = () => {
    if (!editor) return '';
    const serializer = createInternalHTMLSerializer(editor._tiptapEditor.schema, editor);
    const html = serializer.serializeBlocks(editor.topLevelBlocks, { document });
    return DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] });
  };

  const savePost = async (nextStatus: 'DRAFT' | 'PUBLISHED', navigateAfter = true) => {
    if (!editor) return;
    setError('');

    if (!formData.title.trim()) {
      setTouched({ title: true });
      return;
    }

    setSaving(true);

    try {
       const html = serializeContent();
      const data = {
        ...formData,
        status: nextStatus,
        content: html,
        coverImageUrl: coverImageUrl || undefined,
        tagIds: selectedTags,
      };

       if (isEditing) {
          await adminApi.put(`/admin/posts/${id}`, data);
       } else {
          await adminApi.post('/admin/posts', { ...data, status: 'DRAFT' });
       }

       if (navigateAfter) navigate('/admin/dashboard/blog');
       return true;
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err?.response?.data?.error || err?.message || 'Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePost('DRAFT');
  };

  const handlePublish = async () => {
    if (!isEditing) return;
    const saved = await savePost('DRAFT', false);
    if (!saved) return;
    try {
      setSaving(true);
      await adminApi.post(`/admin/posts/${id}/publish`);
      navigate('/admin/dashboard/blog');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'No se pudo publicar el artículo.');
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const openPreview = () => {
    setPreviewHtml(serializeContent());
    setPreviewOpen(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  if (loadError) return (
    <div className="card p-8 text-center" role="alert">
      <h1 className="font-heading text-xl font-semibold text-gray-800">No se pudo cargar el artículo</h1>
      <p className="mt-2 text-red-700">{loadError}</p>
      <div className="mt-5 flex justify-center gap-3">
        <button type="button" onClick={loadPost} className="btn btn-secondary">Reintentar</button>
        <button type="button" onClick={() => navigate('/admin/dashboard/blog')} className="btn btn-ghost">Volver al blog</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/dashboard/blog')} className="text-gray-500 hover:text-gray-700">
          <FiArrowLeft size={20} />
        </button>
        <h1 className="font-heading text-2xl font-bold text-gray-800">
          {isEditing ? 'Editar Artículo' : 'Nuevo Artículo'}
        </h1>
        </div>
        <button type="button" onClick={openPreview} className="btn btn-secondary">Vista previa</button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {error && (
          <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
            <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <label className="label">Título *</label>
              <input
                ref={titleRef}
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
                className={`input text-lg font-semibold ${touched.title && !formData.title.trim() ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                required
              />
              {touched.title && !formData.title.trim() && (
                <p className="mt-1 text-xs text-red-500">El título es obligatorio</p>
              )}
            </div>

            <div className="card overflow-hidden">
              <div className="px-6 pt-4 pb-2 border-b border-gray-100">
                <label className="label mb-0">Contenido</label>
              </div>
              {editor && (
                <BlockNoteView editor={editor} theme="light" slashMenu={false}>
                  <SuggestionMenuController
                    triggerCharacter="/"
                    getItems={async (query) => filterSuggestionItems(getCustomSlashMenuItems(editor), query)}
                  />
                </BlockNoteView>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-heading font-semibold text-gray-800 mb-3">Imagen de portada</h3>
              {coverImageUrl ? (
                <div className="relative group">
                  <div className="rounded-lg overflow-hidden bg-gray-100 border border-gray-200" style={{ aspectRatio: '16/9' }}>
                    <img src={coverImageUrl} alt="Portada" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMediaPickerOpen(true)}
                        className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        Cambiar
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverImageUrl('')}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg hover:bg-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    aria-label="Elegir imagen de la biblioteca"
                    className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gold hover:bg-gold/5 transition-all cursor-pointer flex flex-col items-center justify-center py-8 text-center"
                  >
                    <FiImage className="text-gray-400 text-2xl mb-2" />
                    <p className="text-sm font-medium text-gray-600">Elegir de biblioteca</p>
                    <p className="text-xs text-gray-400 mt-1">o arrastra una imagen</p>
                  </button>
                  <MediaUpload
                    onUpload={(url) => setCoverImageUrl(url)}
                    showLabelInput={true}
                  />
                </div>
              )}
              <MediaPicker
                open={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={(url) => setCoverImageUrl(url)}
              />
            </div>

            <div className="card p-6">
              <h3 className="font-heading font-semibold text-gray-800 mb-4">Extracto</h3>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="input"
                rows={3}
                placeholder="Resumen breve del artículo..."
              />
            </div>

            <div className="card p-6">
              <h3 className="font-heading font-semibold text-gray-800 mb-4">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      selectedTags.includes(tag.id)
                        ? 'bg-gold text-dark'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-heading font-semibold text-gray-800 mb-4">Publicación</h3>
              <p className="text-sm text-gray-600">Guardar cambios siempre conserva el artículo como borrador.</p>
              <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                Estado actual: <strong>{formData.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}</strong>
              </div>
              <button type="button" onClick={handlePublish} disabled={saving || !isEditing || formData.status === 'PUBLISHED'} className="btn btn-secondary mt-3 w-full justify-center disabled:opacity-50">
                {!isEditing ? 'Guarda el borrador primero' : formData.status === 'PUBLISHED' ? 'Ya está publicado' : 'Publicar artículo'}
              </button>
            </div>

            <div className="card p-6">
              <h3 className="font-heading font-semibold text-gray-800 mb-4">SEO</h3>
              <div className="space-y-5">
                <div>
                  <label className="label">Título SEO</label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    className="input"
                    placeholder="Título para buscadores (50-60 caracteres)"
                    maxLength={60}
                  />
                  <p className={`text-xs mt-1.5 ${formData.seoTitle.length > 55 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {formData.seoTitle.length}/60 caracteres
                  </p>
                </div>
                <div>
                  <label className="label">Descripción SEO</label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    className="textarea w-full"
                    rows={3}
                    placeholder="Descripción para buscadores (120-160 caracteres)"
                    maxLength={160}
                  />
                  <p className={`text-xs mt-1.5 ${formData.seoDescription.length > 150 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {formData.seoDescription.length}/160 caracteres
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/dashboard/blog')} className="btn btn-ghost">
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
            {saving ? 'Guardando...' : 'Guardar borrador'}
          </button>
        </div>
      </form>

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="preview-title">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 id="preview-title" className="font-heading text-xl font-semibold text-gray-800">Vista previa del artículo</h2>
              <button type="button" onClick={() => setPreviewOpen(false)} className="min-h-11 min-w-11 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Cerrar vista previa"><FiX /></button>
            </div>
            <article className="px-6 py-8 md:px-12">
              <p className="mb-3 text-sm font-medium uppercase tracking-wider text-gold-dark">{formData.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}</p>
              <h1 className="font-display text-4xl text-dark">{formData.title || 'Sin título'}</h1>
              {coverImageUrl && <img src={coverImageUrl} alt="" className="mt-6 aspect-[21/9] w-full rounded-xl object-cover" />}
              {formData.excerpt && <p className="mt-6 text-lg text-dark-light">{formData.excerpt}</p>}
              <div className="blog-content prose prose-lg mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </article>
          </div>
        </div>
      )}
    </div>
  );
}
