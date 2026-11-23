import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GallerySettings from '@/admin/pages/settings/GallerySettings';
import { siteApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  siteApi: {
    getSettingsFull: vi.fn(),
    updateSettings: vi.fn(),
  },
}));

// The media library is not part of these tests: it only has to hand back a URL.
vi.mock('@/admin/components/ui/MediaPicker', () => ({
  default: ({ open, onSelect }: { open: boolean; onSelect: (url: string) => void }) =>
    open
      ? <button type="button" onClick={() => onSelect('https://cdn.example.com/foto-nueva.jpg')}>elegir-foto-de-prueba</button>
      : null,
}));

const gallery = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `gallery-${index + 1}`,
    imageUrl: `https://cdn.example.com/foto-${index + 1}.jpg`,
    alt: `Foto ${index + 1}`,
    caption: index === 0 ? 'Primer texto' : '',
  }));

const mockSettings = (count: number) => {
  (siteApi.getSettingsFull as any).mockResolvedValue({
    data: [
      { key: 'community_gallery', value: JSON.stringify(gallery(count)) },
      { key: 'community_gallery_interval', value: '4' },
    ],
  });
};

describe('GallerySettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (siteApi.updateSettings as any).mockResolvedValue({ data: { success: true } });
  });

  it('muestra las fotos en una tabla con foto, textos y acciones', async () => {
    mockSettings(3);
    render(<GallerySettings />);

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    const table = within(screen.getByRole('table'));
    expect(table.getByRole('columnheader', { name: 'Foto' })).toBeInTheDocument();
    expect(table.getByRole('columnheader', { name: 'Texto alternativo' })).toBeInTheDocument();
    expect(table.getByRole('columnheader', { name: 'Texto sobre la foto' })).toBeInTheDocument();
    expect(table.getByText('Foto 2')).toBeInTheDocument();
    expect(table.getByText('Primer texto')).toBeInTheDocument();
    expect(table.getAllByRole('button', { name: /Editar foto/ })).toHaveLength(3);
    expect(table.getAllByRole('button', { name: /Quitar foto/ })).toHaveLength(3);
  });

  it('permite agregar una foto con 12 ya guardadas: el botón nunca se deshabilita por cantidad', async () => {
    mockSettings(12);
    render(<GallerySettings />);
    await waitFor(() => expect(screen.getByText('12 fotos. Los cambios se guardan al instante.')).toBeInTheDocument());

    const addButton = screen.getByRole('button', { name: /Agregar foto/ });
    expect(addButton).toBeEnabled();
    await userEvent.click(addButton);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Agregar foto al carrusel')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: /Elegir foto de la biblioteca/ }));
    await userEvent.click(screen.getByRole('button', { name: 'elegir-foto-de-prueba' }));

    await userEvent.type(within(dialog).getByLabelText('Texto alternativo'), 'Nueva foto de la comunidad');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Agregar foto' }));

    await waitFor(() => expect(siteApi.updateSettings).toHaveBeenCalled());
    const payload = (siteApi.updateSettings as any).mock.calls[0][0];
    const saved = JSON.parse(payload.community_gallery);
    expect(saved).toHaveLength(13);
    expect(saved[12]).toMatchObject({
      imageUrl: 'https://cdn.example.com/foto-nueva.jpg',
      alt: 'Nueva foto de la comunidad',
    });
    expect(payload.community_gallery_interval).toBe('4');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('abre el modal de edición con los textos ya guardados', async () => {
    mockSettings(2);
    render(<GallerySettings />);
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

    await userEvent.click(within(screen.getByRole('table')).getByRole('button', { name: /Editar foto 1/ }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Editar foto del carrusel')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Texto alternativo')).toHaveValue('Foto 1');
    expect(within(dialog).getByLabelText(/Texto sobre la foto/)).toHaveValue('Primer texto');
    expect(within(dialog).getByRole('button', { name: 'Cambiar foto' })).toBeInTheDocument();
  });

  it('pide una foto antes de guardar y explica qué falta', async () => {
    mockSettings(1);
    render(<GallerySettings />);
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /Agregar foto/ }));
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Agregar foto' }));

    expect(within(dialog).getByRole('alert')).toHaveTextContent('Elige una foto de la biblioteca');
    expect(siteApi.updateSettings).not.toHaveBeenCalled();
  });

  it('guarda el cambio automático solo cuando cambian los segundos', async () => {
    mockSettings(1);
    render(<GallerySettings />);
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    expect(screen.getByText('El cambio automático ya está guardado.')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('Segundos entre fotos'));
    await userEvent.type(screen.getByLabelText('Segundos entre fotos'), '8');
    await userEvent.click(screen.getByRole('button', { name: /Guardar cambio automático/ }));

    await waitFor(() => expect(siteApi.updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ community_gallery_interval: '8' }),
    ));
  });
});
