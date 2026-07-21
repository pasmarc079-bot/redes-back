import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi';
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
import { createMediaWithTextBlockSpec } from '@/components/editor/blocks/mediaWithText';
import { filterSuggestionItems } from '@blocknote/core/extensions';
import { getCustomSlashMenuItems } from '@/components/editor/MediaWithTextSlashMenu';
import MediaUpload from '@/components/upload/MediaUpload';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || '/api/v1',
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    mediaWithText: createMediaWithTextBlockSpec(),
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
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const editor = useCreateBlockNote({
    schema,
    initialContent: undefined,
    uploadFile: async (file: File) => {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/admin/media/upload', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.originalUrl;
    },
  });

  useEffect(() => {
    titleRef.current?.focus();
    api.get('/posts/tags').then((res) => setTags(res.data));
  }, []);

  useEffect(() => {
    if (isEditing && editor) {
      setLoading(true);
      api
        .get(`/admin/posts/detail/${id}`)
        .then(async (res) => {
          const p = res.data;
          setFormData({
            title: p.title,
            excerpt: p.excerpt || '',
            seoTitle: p.seoTitle || '',
            seoDescription: p.seoDescription || '',
            status: p.status,
            tagIds: p.tags?.map((t: any) => t.tag.id) || [],
          });
          setSelectedTags(p.tags?.map((t: any) => t.tag.id) || []);
          setCoverImageUrl(p.coverImageUrl || '');
          if (p.content) {
            const blocks = await HTMLToBlocks(p.content, editor.pmSchema);
            editor.replaceBlocks(editor.topLevelBlocks, blocks);
          }
        })
        .catch(() => navigate('/dashboard/blog'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, navigate, editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;
    setError('');

    if (!formData.title.trim()) {
      setTouched({ title: true });
      return;
    }

    setSaving(true);

    try {
      const serializer = createInternalHTMLSerializer(
        editor._tiptapEditor.schema,
        editor,
      );
      let html = serializer.serializeBlocks(editor.topLevelBlocks, {
        document,
      });
      // Strip admin-only UI elements before saving for public frontend
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      tempDiv.querySelectorAll('.bn-media-with-text').forEach((el) => {
        const mediaCol = el.querySelector('.bn-media-with-text-media');
        if (mediaCol) {
          // Keep only the img/video, remove all buttons and other UI
          const media = mediaCol.querySelector('img, video');
          mediaCol.innerHTML = '';
          if (media) mediaCol.appendChild(media);
        }
      });
      html = tempDiv.innerHTML;
      const data = {
        ...formData,
        content: html,
        coverImageUrl: coverImageUrl || undefined,
        tagIds: selectedTags,
      };

      if (isEditing) {
        await api.put(`/admin/posts/${id}`, data);
      } else {
        await api.post('/admin/posts', data);
      }

      navigate('/dashboard/blog');
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err?.response?.data?.error || err?.message || 'Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/blog')} className="text-gray-500 hover:text-gray-700">
          <FiArrowLeft size={20} />
        </button>
        <h1 className="font-heading text-2xl font-bold text-gray-800">
          {isEditing ? 'Editar Artículo' : 'Nuevo Artículo'}
        </h1>
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
                <BlockNoteView
                  editor={editor}
                  theme="light"
                  slashMenu={false}
                >
                  <SuggestionMenuController
                    triggerCharacter="/"
                    getItems={async (query) =>
                      filterSuggestionItems(
                        getCustomSlashMenuItems(editor),
                        query,
                      )
                    }
                  />
                </BlockNoteView>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-heading font-semibold text-gray-800 mb-4">Imagen de portada</h3>
              <div className="text-xs text-gray-400 mb-3 space-y-1">
                <p>• Laptop: 1200×675 (16:9)</p>
                <p>• Móvil: 600×450 (4:3)</p>
              </div>
              {coverImageUrl ? (
                <div className="relative">
                  <div className="rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: '16/9' }}>
                    <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl('')}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div>
                  <div className="rounded-lg overflow-hidden bg-gray-100 mb-2" style={{ aspectRatio: '16/9' }}>
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">16:9</div>
                  </div>
                  <MediaUpload onUpload={(url) => setCoverImageUrl(url)} />
                </div>
              )}
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
              <div className="flex flex-col gap-2">
                {(['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: s })}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors text-left ${
                      formData.status === s
                        ? s === 'DRAFT' ? 'bg-gray-200 text-gray-800'
                          : s === 'PUBLISHED' ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {s === 'DRAFT' && '📝 Borrador'}
                    {s === 'PUBLISHED' && '🌍 Publicado'}
                    {s === 'ARCHIVED' && '📦 Archivado'}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-heading font-semibold text-gray-800 mb-4">SEO</h3>
              <div className="space-y-3">
                <div>
                  <label className="label">Título SEO</label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Descripción SEO</label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    className="input"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/dashboard/blog')} className="btn btn-ghost">
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
            {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear artículo'}
          </button>
        </div>
      </form>
    </div>
  );
}
