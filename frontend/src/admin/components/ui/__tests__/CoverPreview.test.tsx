import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CoverPreview from '@/admin/components/ui/CoverPreview';

const desktopImage = '/assets/cover-desktop.jpg';
const mobileImage = '/assets/cover-mobile.jpg';

function veil(container: HTMLElement) {
  return container.querySelector('[data-veil-opacity]') as HTMLElement | null;
}

describe('CoverPreview', () => {
  it('muestra la foto de computadora y el texto real de la portada', () => {
    const { container } = render(
      <CoverPreview desktopImage={desktopImage} mobileImage={mobileImage} opacity={70} eyebrow="Quiénes Somos" title="Nosotros" />,
    );

    expect(container.querySelector('img')).toHaveAttribute('src', desktopImage);
    expect(screen.getByText('Nosotros')).toBeInTheDocument();
    expect(screen.getByText('Quiénes Somos')).toBeInTheDocument();
  });

  it('aplica la oscuridad que llega del control', () => {
    const { container } = render(
      <CoverPreview desktopImage={desktopImage} opacity={35} title="Nosotros" />,
    );

    expect(veil(container)).toHaveStyle({ opacity: '0.35' });
    expect(screen.getByText('35%')).toBeInTheDocument();
  });

  it('cambia a la foto de celular con el botón de tamaño', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CoverPreview desktopImage={desktopImage} mobileImage={mobileImage} opacity={70} title="Nosotros" />,
    );

    await user.click(screen.getByRole('button', { name: /Celular/ }));

    expect(container.querySelector('img')).toHaveAttribute('src', mobileImage);
    expect(screen.getByRole('button', { name: /Celular/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('usa la única foto disponible en los dos tamaños', async () => {
    const user = userEvent.setup();
    const { container } = render(<CoverPreview mobileImage={mobileImage} opacity={70} title="Nosotros" />);

    expect(container.querySelector('img')).toHaveAttribute('src', mobileImage);

    await user.click(screen.getByRole('button', { name: /Computadora/ }));

    expect(container.querySelector('img')).toHaveAttribute('src', mobileImage);
  });

  it('invita a elegir una foto cuando la portada está vacía', () => {
    render(<CoverPreview opacity={70} title="Nosotros" />);

    expect(screen.getByText('Todavía no hay foto de portada')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
