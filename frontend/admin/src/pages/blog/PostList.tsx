import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiFileText, FiGlobe, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || '/api/v1',
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  coverImageUrl: string | null;
  author: { firstName: string | null; lastName: string | null };
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-400',
};

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/posts/all')
      .then((res) => setPosts(res.data.posts))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este artículo?')) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Error al eliminar');
    }
  };

  const toggleStatus = useCallback(async (post: Post) => {
    const newStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const label = newStatus === 'PUBLISHED' ? 'publicar' : 'despublicar';
    if (!confirm(`¿${label} "${post.title}"?`)) return;
    try {
      await api.put(`/admin/posts/${post.id}`, { status: newStatus });
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, status: newStatus } : p));
    } catch {
      alert(`Error al ${label}`);
    }
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-800">Artículos del Blog</h1>
        <Link to="/dashboard/blog/new" className="btn btn-primary">
          <FiPlus /> Nuevo artículo
        </Link>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay artículos. <Link to="/dashboard/blog/new" className="text-gold hover:underline">Escribe el primero</Link>
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
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        {post.coverImageUrl ? (
                          <img src={post.coverImageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                            <FiFileText className="text-gold" />
                          </div>
                        )}
                        <p className="font-medium text-gray-800 line-clamp-1">{post.title}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      {post.author.firstName} {post.author.lastName}
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[post.status]}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('es-EC') : '—'}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleStatus(post)}
                          className={`p-2.5 rounded-lg transition-colors ${
                            post.status === 'PUBLISHED'
                              ? 'text-green-500 hover:text-green-700 hover:bg-green-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          aria-label={post.status === 'PUBLISHED' ? `Despublicar ${post.title}` : `Publicar ${post.title}`}
                          title={post.status === 'PUBLISHED' ? 'Despublicar' : 'Publicar'}
                        >
                          {post.status === 'PUBLISHED' ? <FiEyeOff size={18} /> : <FiGlobe size={18} />}
                        </button>
                        <Link
                          to={`/dashboard/blog/${post.id}`}
                          className="p-2.5 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                          aria-label={`Editar ${post.title}`}
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label={`Eliminar ${post.title}`}
                        >
                          <FiTrash2 size={18} />
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
