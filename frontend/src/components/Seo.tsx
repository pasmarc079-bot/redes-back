import { useEffect } from 'react';

const DEFAULT_DESCRIPTION = 'Ministerio REDES - Una gran red de avivamiento en las familias de nuestro país. Lago Agrio, Ecuador.';
const DEFAULT_IMAGE = '/og-image.jpg';

interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
}

export default function Seo({ title, description = DEFAULT_DESCRIPTION, image = DEFAULT_IMAGE, type = 'website' }: SeoProps) {
  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:image', toAbsoluteUrl(image), 'property');
    setMeta('og:url', window.location.href, 'property');
    setMeta('og:type', type, 'property');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', toAbsoluteUrl(image));

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
  }, [description, image, title, type]);

  return null;
}

function setMeta(key: string, content: string, attribute: 'name' | 'property' = 'name') {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function toAbsoluteUrl(url: string) {
  return new URL(url, window.location.origin).href;
}
