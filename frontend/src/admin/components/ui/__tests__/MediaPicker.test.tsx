import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MediaPicker from '@/admin/components/ui/MediaPicker';

vi.mock('axios', () => {
  const mockApi = {
    get: vi.fn(() =>
      Promise.resolve({
        data: [
          {
            id: '1',
            originalUrl: 'https://res.cloudinary.com/test/image/upload/v1/church-logo.png',
            thumbnailUrl: 'https://res.cloudinary.com/test/image/upload/w_400/church-logo.png',
            mediumUrl: 'https://res.cloudinary.com/test/image/upload/w_800/church-logo.png',
            fileName: 'church-logo.png',
            label: 'Logo Ministerio',
            fileSize: '245000',
          },
          {
            id: '2',
            originalUrl: 'https://res.cloudinary.com/test/image/upload/v1/pastor.jpg',
            thumbnailUrl: 'https://res.cloudinary.com/test/image/upload/w_400/pastor.jpg',
            mediumUrl: null,
            fileName: 'pastor-portrait.jpg',
            label: 'Retrato Pastor',
            fileSize: '1200000',
          },
        ],
      })
    ),
    interceptors: { request: { use: vi.fn() } },
  };
  return { default: { create: () => mockApi } };
});

describe('MediaPicker Integration', () => {
  const mockOnClose = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    render(<MediaPicker open={false} onClose={mockOnClose} onSelect={mockOnSelect} />);
    expect(screen.queryByText('Seleccionar imagen de la biblioteca')).not.toBeInTheDocument();
  });

  it('renders the modal with media items when open', async () => {
    render(<MediaPicker open={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Logo Ministerio')).toBeInTheDocument();
    });

    expect(screen.getByText('Retrato Pastor')).toBeInTheDocument();
    expect(screen.getByText('2 imágenes disponibles')).toBeInTheDocument();
  });

  it('loads and displays media items with labels as alt text and badges', async () => {
    render(<MediaPicker open={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByAltText('Logo Ministerio')).toBeInTheDocument();
    });

    expect(screen.getByAltText('Retrato Pastor')).toBeInTheDocument();
  });

  it('allows selecting an image and calls onSelect with the URL', async () => {
    const user = userEvent.setup();
    render(<MediaPicker open={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByAltText('Logo Ministerio')).toBeInTheDocument();
    });

    // Click on the logo image button
    const logoImg = screen.getByAltText('Logo Ministerio');
    const button = logoImg.closest('button');
    await user.click(button!);

    // Click select button
    const selectButton = screen.getByRole('button', { name: /seleccionar/i });
    await user.click(selectButton);

    expect(mockOnSelect).toHaveBeenCalledWith('https://res.cloudinary.com/test/image/upload/v1/church-logo.png');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking cancel', async () => {
    const user = userEvent.setup();
    render(<MediaPicker open={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Logo Ministerio')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('provides an accessible close control', async () => {
    render(<MediaPicker open={true} onClose={mockOnClose} onSelect={mockOnSelect} />);
    await waitFor(() => expect(screen.getByText('Logo Ministerio')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Cerrar biblioteca' })).toBeInTheDocument();
  });

  it('disables select button when no image is selected', async () => {
    render(<MediaPicker open={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Logo Ministerio')).toBeInTheDocument();
    });

    const selectButton = screen.getByRole('button', { name: /seleccionar/i });
    expect(selectButton).toBeDisabled();
  });

  it('has a search input for filtering', async () => {
    render(<MediaPicker open={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar por nombre o etiqueta...')).toBeInTheDocument();
    });

    const searchButton = screen.getByRole('button', { name: /buscar/i });
    expect(searchButton).toBeInTheDocument();
  });

  it('pressing Escape closes the modal', async () => {
    render(<MediaPicker open={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Logo Ministerio')).toBeInTheDocument();
    });

    await userEvent.keyboard('{Escape}');

    expect(mockOnClose).toHaveBeenCalled();
  });
});
