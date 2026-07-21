import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { postsApi } from '@/services/api';
import type { BlogPost } from '@/types';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postsApi
      .getAll()
      .then((res) => setPosts(res.data.posts))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="relative bg-dark py-20 md:py-28">
        <div className="container-custom text-center">
          <p className="font-heading text-gold uppercase tracking-[0.2em] text-sm mb-4">
            Reflexiones y Noticias
          </p>
          <h1 className="font-display text-5xl md:text-7xl text-gold tracking-wider">
            Blog
          </h1>
        </div>
      </section>

      <section className="section-padding bg-cream">
        <div className="container-custom">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-dark-lighter" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-dark-lighter rounded w-3/4" />
                    <div className="h-4 bg-dark-lighter rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/blog/${post.slug}`} className="card group block h-full">
                    <div className="relative h-48 bg-dark-light overflow-hidden">
                      {post.coverImageUrl ? (
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark to-gold/20">
                          <span className="text-gold text-4xl font-display">REDES</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex gap-2 mb-3">
                        {post.tags.map(({ tag }) => (
                          <span
                            key={tag.id}
                            className="text-xs font-heading font-medium px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: tag.color ? `${tag.color}20` : '#C9A84C20',
                              color: tag.color || '#C9A84C',
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-heading text-lg font-bold text-dark mb-2 group-hover:text-gold-dark transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-dark-light line-clamp-3">{post.excerpt}</p>
                      )}
                      <div className="mt-4 flex items-center justify-between text-xs text-dark-light">
                        <span>
                          {post.author.firstName} {post.author.lastName}
                        </span>
                        {post.publishedAt && (
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString('es-EC')}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-dark-light text-lg">Próximamente artículos y reflexiones.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
