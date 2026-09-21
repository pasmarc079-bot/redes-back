import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiFileText, FiGlobe, FiEyeOff, FiRefreshCw, FiSearch } from 'react-icons/fi';
import adminApi from '@/services/adminApi';
import { showConfirm } from '@/admin/components/ui/ConfirmModal';
import { showToast } from '@/admin/components/ui/Toast';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  coverImageUrl: string | null;
  version?: number;
  author: { firstName: string | null; lastName: string | null };
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PUBLISHED: 'bg-green-100 text-green-700',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
};

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadPosts = () => {
    setLoading(true);
    setError('');
    adminApi
      .get('/admin/posts/all')
      .then((res) => setPosts(res.data.posts))
      .catch(() => setError('No se pudieron cargar los artículos. Verifica tu conexión e inténtalo de nuevo.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = `${post.title} ${post.author.firstName || ''} ${post.author.lastName || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (statusFilter === 'ALL' || post.status === statusFilter);
  });

  const handleDelete = async (id: string) => {
    const ok = await showConfirm({
      title: 'Eliminar artículo',
      message: '¿Estás seguro de eliminar este artículo? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await adminApi.delete(`/admin/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      showToast('success', 'Artículo eliminado correctamente.');
    } catch {
      showToast('error', 'Error al eliminar el artículo.');
    }
  };

  const toggleStatus = useCallback(async (post: Post) => {
    const newStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const label = newStatus === 'PUBLISHED' ? 'publicar' : 'despublicar';
    const ok = await showConfirm({
      title: `${newStatus === 'PUBLISHED' ? 'Publicar' : 'Despublicar'}`,
      message: `¿${label.charAt(0).toUpperCase() + label.slice(1)} "${post.title}"?`,
      confirmLabel: newStatus === 'PUBLISHED' ? 'Publicar' : 'Despublicar',
    });
    if (!ok) return;
    try {
      await adminApi.post(`/admin/posts/${post.id}/${newStatus === 'PUBLISHED' ? 'publish' : 'unpublish'}`);
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, status: newStatus } : p));
      showToast('success', `Artículo ${label}do correctamente.`);
    } catch {
      showToast('error', `Error al ${label} el artículo.`);
    }
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-800">Artículos del Blog</h1>
        <Link to="/admin/dashboard/blog/new" className="btn btn-primary">
          <FiPlus /> Nuevo artículo
        </Link>
      </div>

      <div className="card p-4 mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative flex-1" htmlFor="post-search">
          <FiSearch className="absolute left-3 top-3.5 text-gray-400" aria-hidden="true" />
          <input id="post-search" value={search} onChange={(e) => setSearch(e.target.value)} className="input w-full pl-10" placeholder="Buscar por título o autor" />
        </label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select md:w-48" aria-label="Filtrar artículos por estado">
          <option value="ALL">Todos los estados</option>
          <option value="PUBLISHED">Publicados</option>
          <option value="DRAFT">Borradores</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : error ? (
          <div className="p-8 text-center" role="alert">
            <p className="text-red-700">{error}</p>
            <button type="button" onClick={loadPosts} className="btn btn-secondary mt-4"><FiRefreshCw /> Reintentar</button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {posts.length === 0 ? <>No hay artículos. <Link to="/admin/dashboard/blog/new" className="text-gold hover:underline">Escribe el primero</Link></> : 'No hay artículos que coincidan con los filtros.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Artículo</th>
                  <th className="table-header">Autor</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header">Publicado</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                       <div className="flex items-center gap-3 p-1">
                        {post.coverImageUrl ? (
                          <img src={post.coverImageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                           <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center p-1">
                            <FiFileText className="text-gold" />
                          </div>
                        )}
                           <div className="flex items-center gap-2 p-1">
                             <p className="font-medium text-gray-800 line-clamp-1">{post.title}</p>
                             <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">v{post.version || 1}</span>
                           </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {post.author.firstName} {post.author.lastName}
                    </td>
                    <td className="table-cell">
                       <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[post.status] || statusColors.DRAFT}`}>
                         {statusLabels[post.status] || 'Borrador'}
                      </span>
                    </td>
                    <td className="table-cell">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('es-EC') : '—'}
                    </td>
                    <td className="table-cell text-right">
                       <div className="flex items-center justify-end gap-1 p-1">
                        <button
                          onClick={() => toggleStatus(post)}
                          className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors ${
                            post.status === 'PUBLISHED'
                              ? 'text-amber-700 hover:bg-amber-50'
                              : 'text-green-700 hover:bg-green-50'
                          }`}
                          aria-label={post.status === 'PUBLISHED' ? `Despublicar ${post.title}` : `Publicar ${post.title}`}
                          title={post.status === 'PUBLISHED' ? 'Despublicar' : 'Publicar'}
                        >
                          {post.status === 'PUBLISHED' ? <FiEyeOff size={16} /> : <FiGlobe size={16} />}
                          {post.status === 'PUBLISHED' ? 'Despublicar' : 'Publicar'}
                        </button>
                        <Link
                          to={`/admin/dashboard/blog/${post.id}`}
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-gold-dark hover:bg-gold/10 transition-colors"
                          aria-label={`Editar ${post.title}`}
                        >
                          <FiEdit2 size={16} /> Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                          aria-label={`Eliminar ${post.title}`}
                        >
                          <FiTrash2 size={16} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
