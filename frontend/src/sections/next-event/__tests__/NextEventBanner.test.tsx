import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NextEventBanner from '@/sections/next-event/NextEventBanner';

const upcomingEvent = {
  id: '1',
  title: 'Encuentro de la familia REDES',
  slug: 'encuentro-de-la-familia-redes',
  shortDescription: null,
  description: null,
  startDate: '2026-12-14T19:00:00.000Z',
  endDate: '2026-12-14T22:00:00.000Z',
  location: 'Templo CENTRO',
  address: null,
  flyerUrl: null,
  isFeatured: true,
  status: 'UPCOMING',
  capacity: null,
  registrationUrl: null,
};

const ongoingEvent = { ...upcomingEvent, id: '2', slug: 'encuentro-de-hoy', title: 'Reunión de hoy', status: 'ONGOING' };

let events: unknown[] = [];

vi.mock('axios', () => {
  const mockApi = {
    get: vi.fn((url: string) => {
      if (url.includes('/events')) return Promise.resolve({ data: { events, pagination: { total: events.length } } });
      return Promise.resolve({ data: {} });
    }),
    interceptors: { request: { use: vi.fn() } },
  };
  return { default: { create: () => mockApi, ...mockApi }, ...mockApi };
});

const renderBanner = () =>
  render(
    <MemoryRouter>
      <NextEventBanner />
    </MemoryRouter>,
  );

describe('NextEventBanner', () => {
  beforeEach(() => {
    events = [upcomingEvent];
  });

  it('no muestra nada cuando no hay eventos', async () => {
    events = [];
    const { container } = renderBanner();
    await waitFor(() => expect(container.firstChild).toBeNull());
  });

  it('anuncia el próximo evento con su fecha, lugar y enlace', async () => {
    renderBanner();

    const region = await screen.findByRole('region', { name: /próximo evento: encuentro de la familia redes/i });
    expect(region).toBeInTheDocument();
    expect(screen.getByText('Próximo evento')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('DIC')).toBeInTheDocument();
    expect(screen.getByText('Templo CENTRO')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /ver el evento/i })[0]).toHaveAttribute('href', '/eventos/encuentro-de-la-familia-redes');
  });

  it('cambia el aviso cuando el evento está en curso', async () => {
    events = [ongoingEvent];
    renderBanner();

    await screen.findByRole('region', { name: /en curso: reunión de hoy/i });
    expect(screen.getByText('En curso ahora')).toBeInTheDocument();
  });

  it('enlaza el título con la página del evento', async () => {
    renderBanner();

    const link = await screen.findByRole('link', { name: 'Encuentro de la familia REDES' });
    expect(link).toHaveAttribute('href', '/eventos/encuentro-de-la-familia-redes');
  });
});
