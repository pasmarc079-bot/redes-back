import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock } from 'react-icons/fi';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  XIcon,
  WhatsappIcon,
} from 'react-share';
import { postsApi } from '@/services/api';
import type { BlogPost } from '@/types';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    postsApi
      .getBySlug(slug)
      .then((res) => setPost(res.data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-pulse text-gold font-display text-2xl">Cargando...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-3xl text-dark mb-4">Artículo no encontrado</h2>
          <Link to="/blog" className="btn btn-primary">
            <FiArrowLeft /> Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/blog/${post.slug}`;
  const title = post.title;

  return (
    <article>
      {/* Header */}
      <header className="relative bg-dark py-20 md:py-28">
        <div className="container-custom">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-silver hover:text-gold mb-6 transition-colors"
          >
            <FiArrowLeft /> Volver al blog
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex gap-2 mb-4">
              {post.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="text-xs font-heading font-medium px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: tag.color ? `${tag.color}30` : '#C9A84C30',
                    color: tag.color || '#C9A84C',
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>

            <h1 className="font-display text-3xl md:text-5xl text-gold tracking-wider mb-4 text-balance">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-silver text-sm">
              <span>
                {post.author.firstName} {post.author.lastName}
              </span>
              {post.publishedAt && (
                <>
                  <span>•</span>
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString('es-EC', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </>
              )}
              {post.readTime && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FiClock /> {post.readTime} min
                  </span>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImageUrl && (
        <div className="container-custom -mt-8 relative z-10">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full aspect-[21/9] object-cover rounded-xl shadow-xl"
          />
        </div>
      )}

      {/* Content */}
      <div className="container-custom max-w-3xl py-12">
        <div
          className="blog-content prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-dark prose-p:text-dark-light prose-a:text-gold prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share */}
        <div className="mt-12 pt-8 border-t border-dark/10">
          <p className="font-heading text-dark font-semibold mb-4">Comparte este artículo</p>
          <div className="flex gap-3">
            <FacebookShareButton url={shareUrl} title={title}>
              <FacebookIcon size={40} round />
            </FacebookShareButton>
            <TwitterShareButton url={shareUrl} title={title}>
              <XIcon size={40} round />
            </TwitterShareButton>
            <WhatsappShareButton url={shareUrl} title={title}>
              <WhatsappIcon size={40} round />
            </WhatsappShareButton>
          </div>
        </div>
      </div>
    </article>
  );
}
