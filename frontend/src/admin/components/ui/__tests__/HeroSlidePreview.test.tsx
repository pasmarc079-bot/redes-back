import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeroSlidePreview from '@/admin/components/ui/HeroSlidePreview';
import { HERO_PREVIEW_MESSAGE, HERO_PREVIEW_READY } from '@/pages/HeroPreview';
import type { HeroSlide } from '@/utils/heroSlides';

const slide: HeroSlide = {
  id: 'slide-1',
  eyebrow: 'Nuestra familia',
  title: 'UNA RED QUE *CRECE*',
  subtitle: 'Somos una familia que se cuida.',
  location: 'Lago Agrio, Ecuador',
  ctaLabel: 'Ver los eventos',
  ctaUrl: '/eventos',
  secondaryCtaLabel: 'Conócenos',
  secondaryCtaUrl: '/nosotros',
  imageUrl: '',
  mobileImageUrl: '',
  overlayOpacity: 100,
};

/** The iframe talks through postMessage; jsdom gives us the window to stub. */
function stubIframe() {
  const iframe = screen.getByTitle('Vista previa del mensaje de la portada') as HTMLIFrameElement;
  const postMessage = vi.fn();
  Object.defineProperty(iframe, 'contentWindow', { value: { postMessage }, configurable: true });
  return { iframe, postMessage };
}

describe('HeroSlidePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra la portada real en un iframe', () => {
    render(<HeroSlidePreview slide={slide} />);
    const iframe = screen.getByTitle('Vista previa del mensaje de la portada');
    expect(iframe).toHaveAttribute('src', '/preview/hero');
  });

  it('envía el borrador al iframe cuando este avisa que está listo', async () => {
    render(<HeroSlidePreview slide={slide} />);
    const { postMessage } = stubIframe();

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', { data: { type: HERO_PREVIEW_READY }, origin: window.location.origin }),
      );
    });

    await waitFor(() => {
      expect(postMessage).toHaveBeenCalledWith(
        { type: HERO_PREVIEW_MESSAGE, slide },
        window.location.origin,
      );
    });
  });

  it('cambia el tamaño del visor entre computadora y celular', async () => {
    const user = userEvent.setup();
    render(<HeroSlidePreview slide={slide} />);
    const iframe = screen.getByTitle('Vista previa del mensaje de la portada');

    expect(iframe).toHaveStyle({ width: '1440px' });

    await user.click(screen.getByRole('button', { name: /Celular/ }));

    expect(iframe).toHaveStyle({ width: '390px' });
    expect(screen.getByRole('button', { name: /Celular/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('ignora mensajes que vienen de otro origen', async () => {
    render(<HeroSlidePreview slide={slide} />);
    const { postMessage } = stubIframe();

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', { data: { type: HERO_PREVIEW_READY }, origin: 'https://otro-sitio.example' }),
      );
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(postMessage).not.toHaveBeenCalled();
  });
});
