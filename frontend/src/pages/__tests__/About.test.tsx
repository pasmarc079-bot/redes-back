import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import About from '@/pages/About';

vi.mock('framer-motion', () => ({
  motion: {
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  },
}));

const mockUseSiteStore = vi.hoisted(() => vi.fn(() => ({
    settings: {
      church_history: 'Historia de la iglesia',
      mission: 'Misión',
      vision: 'Visión',
      purpose: 'Propósito',
      pastor_name: 'Marco Cárdenas',
      pastor_photo_url: '',
      pastor_bio: 'Biografía original',
      address: '',
      phone: '',
      email: '',
    },
    services: [{ id: 'service-1', name: 'Culto', dayOfWeek: 'Domingo', time: '10:00', description: null }],
    content: {
      about: [
        { key: 'about_intro', title: 'Nuestra comunidad', body: 'Introducción administrable desde Contenido.' },
        { key: 'pastor_section', title: 'Conoce a nuestro pastor', body: 'Descripción administrable del pastor.' },
        { key: 'about_eyebrow', title: null, body: 'Quiénes somos en REDES' },
        { key: 'about_page_title', title: null, body: 'Página Nosotros' },
        { key: 'about_history_heading', title: null, body: 'Nuestra historia de fe' },
        { key: 'about_mission_heading', title: null, body: 'Nuestra misión renovada' },
        { key: 'about_vision_heading', title: null, body: 'Nuestra visión compartida' },
        { key: 'about_purpose_heading', title: null, body: 'Nuestro propósito' },
        { key: 'about_services_heading', title: null, body: 'Horarios de reunión' },
        { key: 'about_visit_heading', title: null, body: 'Encuéntranos' },
        { key: 'about_address_label', title: null, body: 'Dónde estamos:' },
        { key: 'about_phone_label', title: null, body: 'Llámanos:' },
        { key: 'about_email_label', title: null, body: 'Escríbenos:' },
        { key: 'about_map_placeholder', title: null, body: 'Nuestra ubicación' },
      ],
    },
})));

vi.mock('@/stores/siteStore', () => ({
  useSiteStore: mockUseSiteStore,
}));

describe('About — dynamic page content', () => {
  it('renders the about_intro block on the public page', () => {
    render(<About />);
    expect(screen.getByRole('heading', { name: 'Nuestra comunidad' })).toBeInTheDocument();
    expect(screen.getByText('Introducción administrable desde Contenido.')).toBeInTheDocument();
  });

  it('uses pastor_section title and body on the public page', () => {
    render(<About />);
    expect(screen.getByRole('heading', { name: 'Conoce a nuestro pastor' })).toBeInTheDocument();
    expect(screen.getByText('Descripción administrable del pastor.')).toBeInTheDocument();
    expect(screen.queryByText('Biografía original')).not.toBeInTheDocument();
  });

  it('renders configurable headings and contact labels from page content', () => {
    render(<About />);
    expect(screen.getByText('Quiénes somos en REDES')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Página Nosotros' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nuestra historia de fe' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nuestra misión renovada' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Horarios de reunión' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Encuéntranos' })).toBeInTheDocument();
    expect(screen.getByText('Dónde estamos:')).toBeInTheDocument();
    expect(screen.getByText('Llámanos:')).toBeInTheDocument();
    expect(screen.getByText('Escríbenos:')).toBeInTheDocument();
    expect(screen.getByText('Nuestra ubicación')).toBeInTheDocument();
  });

});
