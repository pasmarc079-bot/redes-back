import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from '@/admin/pages/settings/Settings';

const { getMock, putMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  putMock: vi.fn((url: string) => Promise.resolve({ data: url === '/social/admin/configs' ? [] : { success: true } })),
}));

vi.mock('axios', () => ({
  default: {
    create: () => ({
      interceptors: { request: { use: vi.fn() } },
      get: getMock,
      put: putMock,
    }),
  },
}));

vi.mock('@/admin/components/ui/Toast', () => ({ showToast: vi.fn() }));
vi.mock('@/admin/components/ui/MediaPicker', () => ({
  default: ({ open }: { open: boolean }) => open ? <div role="dialog">Biblioteca de medios</div> : null,
}));

const settings = [
  { id: 'setting-1', key: 'mission', value: 'Nuestra misión', label: 'Misión', group: 'about', type: 'textarea' },
  { id: 'setting-2', key: 'phone', value: '099 000 0000', label: 'Teléfono', group: 'contact', type: 'text' },
  { id: 'setting-3', key: 'hero_image_url', value: '', label: 'Imagen de portada', group: 'general', type: 'image' },
  { id: 'setting-4', key: 'google_maps_url', value: '', label: 'Enlace de Google Maps', group: 'contact', type: 'url' },
];

const menu = [
  { id: 'menu-home', label: 'Inicio', url: '/', order: 1, isActive: true, parentId: null, location: 'header' },
  { id: 'menu-about', label: 'Nosotros', url: '/nosotros', order: 2, isActive: true, parentId: null, location: 'header' },
  { id: 'menu-events', label: 'Eventos', url: '/eventos', order: 3, isActive: true, parentId: null, location: 'header' },
  { id: 'menu-blog', label: 'Blog', url: '/blog', order: 4, isActive: true, parentId: null, location: 'header' },
  { id: 'menu-community', label: 'Comunidad', url: '/comunidad', order: 5, isActive: true, parentId: null, location: 'header' },
  { id: 'menu-contact', label: 'Contacto', url: '/contacto', order: 6, isActive: true, parentId: null, location: 'header' },
];

const content = [
  { id: 'content-title', key: 'hero_title', title: 'Título del Hero', body: 'REDES', section: 'hero', order: 1, imageUrl: null, isActive: true },
  { id: 'content-subtitle', key: 'hero_subtitle', title: 'Subtítulo', body: 'Ministerio Cristiano', section: 'hero', order: 2, imageUrl: null, isActive: true },
  { id: 'content-intro', key: 'about_intro', title: 'Introducción', body: 'Somos una comunidad', section: 'about', order: 1, imageUrl: null, isActive: true },
  { id: 'content-events-title', key: 'events_page_title', title: 'Eventos', body: 'Eventos', section: 'events', order: 1, imageUrl: null, isActive: true },
  { id: 'content-events-description', key: 'events_page_description', title: 'Descripción', body: 'Únete a nosotros', section: 'events', order: 2, imageUrl: null, isActive: true },
  { id: 'content-blog-title', key: 'blog_page_title', title: 'Blog', body: 'Blog', section: 'blog', order: 1, imageUrl: null, isActive: true },
  { id: 'content-blog-description', key: 'blog_page_description', title: 'Descripción', body: 'Reflexiones y Noticias', section: 'blog', order: 2, imageUrl: null, isActive: true },
  { id: 'content-community-title', key: 'community_page_title', title: 'Comunidad', body: 'Únete a Nosotros', section: 'community', order: 1, imageUrl: null, isActive: true },
  { id: 'content-community-description', key: 'community_page_description', title: 'Descripción', body: 'Conéctate con nosotros', section: 'community', order: 2, imageUrl: null, isActive: true },
  { id: 'content-contact', key: 'contact_welcome', title: 'Bienvenida', body: 'Conecta con nosotros', section: 'contact', order: 1, imageUrl: null, isActive: true },
];

const socials = [
  { id: 'social-facebook', platform: 'facebook', accountUrl: 'https://facebook.com/redes', feedUrl: null, iconName: 'FiFacebook', color: '#1877F2', order: 1, isActive: true },
  { id: 'social-whatsapp', platform: 'whatsapp', accountUrl: 'https://wa.me/593000000000', feedUrl: null, iconName: 'FiPhone', color: '#25D366', order: 2, isActive: true },
];

beforeEach(() => {
  vi.clearAllMocks();
  getMock.mockImplementation((url: string) => {
    if (url === '/site/settings/full') return Promise.resolve({ data: settings });
    if (url === '/site/menu') return Promise.resolve({ data: menu });
    if (url === '/site/content/admin') return Promise.resolve({ data: content });
    if (url === '/social/admin/configs') return Promise.resolve({ data: socials });
    return Promise.resolve({ data: [] });
  });
});

describe('Configuración de Páginas', () => {
  it('muestra las seis páginas fijas y no expone sus rutas editables', async () => {
    render(<Settings />);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Configuración de Páginas' })).toBeInTheDocument());
    for (const label of ['Inicio', 'Nosotros', 'Eventos', 'Blog', 'Comunidad', 'Contacto']) {
      expect(screen.getByRole('heading', { name: label })).toBeInTheDocument();
    }
    expect(screen.queryByLabelText('Destino')).not.toBeInTheDocument();
    expect(screen.queryByText('/nosotros')).not.toBeInTheDocument();
  });

  it('permite abrir el editor de una página con etiquetas amigables', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Editar Contenido' })).toHaveLength(6));
    await user.click(screen.getAllByRole('button', { name: 'Editar Contenido' })[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Título principal de portada')).toHaveValue('REDES');
    expect(screen.getByLabelText('Subtítulo')).toHaveValue('Ministerio Cristiano');
    expect(screen.queryByText('hero_title')).not.toBeInTheDocument();
    expect(screen.queryByText('Opciones avanzadas')).not.toBeInTheDocument();
  });

  it('guarda el contenido de una página en una única petición consolidada', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Editar Contenido' })).toHaveLength(6));
    await user.click(screen.getAllByRole('button', { name: 'Editar Contenido' })[0]);
    await user.clear(screen.getByLabelText('Título principal de portada'));
    await user.type(screen.getByLabelText('Título principal de portada'), 'Nueva portada');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(putMock).toHaveBeenCalledWith('/site/pages/home', expect.objectContaining({
      settings: expect.any(Object),
      content: expect.arrayContaining([{ key: 'hero_title', body: 'Nueva portada' }]),
    })));
  });

  it('guarda orden y visibilidad del menú en batch', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    await waitFor(() => expect(screen.getAllByRole('checkbox', { name: 'Visible en menú' })).toHaveLength(6));
    await user.click(screen.getAllByRole('checkbox', { name: 'Visible en menú' })[1]);
    await user.click(screen.getByRole('button', { name: 'Guardar orden del menú' }));

    await waitFor(() => expect(putMock).toHaveBeenCalledWith('/site/menu/batch', expect.objectContaining({
      items: expect.arrayContaining([{ id: 'menu-about', order: 2, isActive: false }]),
    })));
  });

  it('abre el selector de medios para imágenes sin mostrar URLs técnicas', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Editar Contenido' })).toHaveLength(6));
    await user.click(screen.getAllByRole('button', { name: 'Editar Contenido' })[0]);
    await user.click(screen.getAllByRole('button', { name: 'Elegir de la biblioteca' })[0]);

    expect(screen.getByText('Biblioteca de medios')).toBeInTheDocument();
    expect(screen.queryByText('hero_image_url')).not.toBeInTheDocument();
  });

  it('centraliza redes y contacto en una sección separada', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    await waitFor(() => expect(screen.getByRole('tab', { name: 'Enlaces Externos y Contacto' })).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Enlaces Externos y Contacto' }));

    expect(screen.getByRole('heading', { name: 'Redes sociales centralizadas' })).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico institucional')).toHaveValue('');
    expect(screen.getByLabelText('Teléfono oficial')).not.toHaveValue('');
    expect(screen.getAllByLabelText('Enlace público')[0]).toHaveValue('https://facebook.com/redes');
    expect(screen.getByRole('button', { name: 'Guardar enlaces y contacto' })).toBeInTheDocument();
  });

  it('guarda contacto y redes mediante peticiones globales', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    await waitFor(() => expect(screen.getByRole('tab', { name: 'Enlaces Externos y Contacto' })).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Enlaces Externos y Contacto' }));
    await user.type(screen.getByLabelText('Enlace de Google Maps'), 'https://maps.google.com/?q=redes');
    await user.click(screen.getByRole('button', { name: 'Guardar enlaces y contacto' }));

    await waitFor(() => {
      expect(putMock).toHaveBeenCalledWith('/site/settings', expect.objectContaining({ google_maps_url: 'https://maps.google.com/?q=redes' }));
      expect(putMock).toHaveBeenCalledWith('/social/admin/configs', expect.objectContaining({ items: expect.any(Array) }));
    });
  });
});
