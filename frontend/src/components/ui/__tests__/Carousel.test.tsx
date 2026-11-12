import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Carousel from '@/components/ui/Carousel';

/** Only the slide groups, not the dots container (which is also a group). */
const slideGroups = () =>
  screen.getAllByRole('group', { hidden: true })
    .filter((el) => el.getAttribute('aria-roledescription') === 'diapositiva');

const slides = [
  { id: 'a', render: () => <h1>Primera</h1> },
  { id: 'b', render: () => <h2>Segunda</h2> },
  { id: 'c', render: () => <h3>Tercera</h3> },
];

describe('Carousel', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra la primera diapositiva y marca el resto como ocultas', () => {
    render(<Carousel label="Portada" slides={slides} autoplay={false} />);

    const groups = slideGroups();
    expect(groups).toHaveLength(3);
    expect(groups[0]).toHaveAttribute('aria-hidden', 'false');
    expect(groups[1]).toHaveAttribute('aria-hidden', 'true');
  });

  it('expone un nombre accesible y los puntos de navegación', () => {
    render(<Carousel label="Portada" slides={slides} autoplay={false} />);

    expect(screen.getByRole('region', { name: 'Portada' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /ver diapositiva/i })).toHaveLength(3);
  });

  it('cambia de diapositiva al pulsar un punto', async () => {
    const user = userEvent.setup();
    render(<Carousel label="Portada" slides={slides} autoplay={false} />);

    await user.click(screen.getByRole('button', { name: 'Ver diapositiva 2' }));

    const groups = slideGroups();
    expect(groups[1]).toHaveAttribute('aria-hidden', 'false');
    expect(groups[0]).toHaveAttribute('aria-hidden', 'true');
  });

  it('avanza solo cuando el autoplay está activo', () => {
    const { unmount } = render(<Carousel label="Portada" slides={slides} autoplay={false} />);
    act(() => { vi.advanceTimersByTime(20000); });
    let groups = slideGroups();
    expect(groups[0]).toHaveAttribute('aria-hidden', 'false');
    unmount();

    render(<Carousel label="Portada" slides={slides} autoplay intervalMs={6000} />);
    act(() => { vi.advanceTimersByTime(6100); });
    groups = slideGroups();
    expect(groups[1]).toHaveAttribute('aria-hidden', 'false');
  });

  it('permite pausar y reanudar', async () => {
    const user = userEvent.setup();
    render(<Carousel label="Portada" slides={slides} autoplay intervalMs={6000} />);

    const pause = screen.getByRole('button', { name: 'Pausar carrusel' });
    await user.click(pause);
    expect(screen.getByRole('button', { name: 'Reanudar carrusel' })).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(20000); });
    const groups = slideGroups();
    expect(groups[0]).toHaveAttribute('aria-hidden', 'false');
  });

  it('navega con las flechas del teclado', async () => {
    const user = userEvent.setup();
    render(<Carousel label="Portada" slides={slides} autoplay={false} />);

    // The dots are buttons, so they are reachable with the keyboard.
    screen.getByRole('button', { name: 'Ver diapositiva 1' }).focus();
    await user.keyboard('{ArrowRight}');

    expect(slideGroups()[1]).toHaveAttribute('aria-hidden', 'false');

    await user.keyboard('{ArrowLeft}');
    expect(slideGroups()[0]).toHaveAttribute('aria-hidden', 'false');
  });

  it('no renderiza los controles cuando hay una sola diapositiva', () => {
    render(<Carousel label="Portada" slides={[slides[0]]} autoplay />);

    expect(screen.queryByRole('button', { name: /ver diapositiva/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /carrusel/i })).not.toBeInTheDocument();
  });
});
