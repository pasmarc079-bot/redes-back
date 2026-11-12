export type SitePageId = 'home' | 'about' | 'events' | 'blog' | 'community' | 'contact';

export interface SitePage {
  id: SitePageId;
  label: string;
  description: string;
  url: string;
}

/**
 * The pages the visitor can browse. Shared by the page editor in Settings and by the
 * destination picker, so both always agree on the routes the site actually has.
 */
export const SITE_PAGES: SitePage[] = [
  {
    id: 'home',
    label: 'Inicio',
    url: '/',
    description: 'Presenta el ministerio y dirige a los visitantes a las secciones principales.',
  },
  {
    id: 'about',
    label: 'Nosotros',
    url: '/nosotros',
    description: 'Cuenta quiénes somos, nuestra historia, misión y visión.',
  },
  {
    id: 'events',
    label: 'Eventos',
    url: '/eventos',
    description: 'Presenta el encabezado de la sección de eventos.',
  },
  {
    id: 'blog',
    label: 'Blog',
    url: '/blog',
    description: 'Presenta el encabezado de artículos, reflexiones y noticias.',
  },
  {
    id: 'community',
    label: 'Comunidad',
    url: '/comunidad',
    description: 'Invita a las personas a conectarse con la comunidad REDES.',
  },
  {
    id: 'contact',
    label: 'Contacto',
    url: '/contacto',
    description: 'Muestra cómo visitar y comunicarse con el ministerio.',
  },
];

export const getSitePage = (id: SitePageId): SitePage | undefined =>
  SITE_PAGES.find((page) => page.id === id);
