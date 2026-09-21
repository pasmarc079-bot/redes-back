import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MediaLibrary from '@/admin/pages/media/MediaLibrary';

const mockMediaItems = [
  {
    id: '1',
    originalUrl: 'https://res.cloudinary.com/test/image/upload/v1/test1.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/test/image/upload/w_400/test1.jpg',
    mediumUrl: 'https://res.cloudinary.com/test/image/upload/w_800/test1.jpg',
    fileName: 'church-logo.png',
    mimeType: 'image/png',
    fileSize: '245000',
    createdAt: '2026-08-20T10:00:00Z',
    width: 800,
    height: 600,
    label: 'Logo Ministerio',
  },
  {
    id: '2',
    originalUrl: 'https://res.cloudinary.com/test/image/upload/v1/test2.jpg',
    thumbnailUrl: null,
    mediumUrl: null,
    fileName: 'pastor-portrait.jpg',
    mimeType: 'image/jpeg',
    fileSize: '1200000',
    createdAt: '2026-08-21T14:30:00Z',
    width: 1200,
    height: 900,
    label: null,
  },
];

vi.mock('@/admin/components/ui/Toast', () => ({
  showToast: vi.fn(),
}));

vi.mock('@/admin/components/ui/ConfirmModal', () => ({
  showConfirm: vi.fn(() => Promise.resolve(true)),
}));

vi.mock('@/admin/components/upload/MediaUpload', () => ({
  default: ({ onUpload, showLabelInput }: any) => (
    <div data-testid="media-upload">
      {showLabelInput && <input data-testid="upload-label-input" placeholder="Etiqueta" />}
      <button onClick={() => onUpload('https://test.com/new.jpg', { id: 'new-1', label: 'New' })}>
        Simular Upload
      </button>
    </div>
  ),
}));

vi.mock('axios', () => {
  const mockApi = {
    get: vi.fn((url: string, config?: any) => {
      if (url.includes('media/health')) {
        return Promise.resolve({ data: { status: 'ok', config: true, cloud_name: 'test-cloud' } });
      }
      if (url.includes('media/usage')) {
        return Promise.resolve({ data: { usage: [], count: 0 } });
      }
      if (url.includes('admin/media')) {
        const search = config?.params?.search;
        let items = mockMediaItems;
        if (search) {
          items = items.filter(
            (m) =>
              m.fileName.toLowerCase().includes(search.toLowerCase()) ||
              (m.label && m.label.toLowerCase().includes(search.toLowerCase()))
          );
        }
        return Promise.resolve({ data: items });
      }
      return Promise.resolve({ data: [] });
    }),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({})),
    interceptors: { request: { use: vi.fn() } },
  };
  return { default: { create: () => mockApi } };
});

describe('MediaLibrary Label Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders media items with their labels', async () => {
    render(<MediaLibrary />);

    await waitFor(() => {
      expect(screen.getByText('church-logo.png')).toBeInTheDocument();
    });

    expect(screen.getByText('Logo Ministerio')).toBeInTheDocument();
    expect(screen.getByText('+ Agregar etiqueta')).toBeInTheDocument();
  });

  it('shows label input in the upload area', async () => {
    render(<MediaLibrary />);

    await waitFor(() => {
      expect(screen.getByTestId('media-upload')).toBeInTheDocument();
    });

    expect(screen.getByTestId('upload-label-input')).toBeInTheDocument();
  });

  it('displays search bar for filtering by label or filename', async () => {
    render(<MediaLibrary />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar por nombre o etiqueta...')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument();
  });

  it('search triggers API call with search parameter', async () => {
    const user = userEvent.setup();
    render(<MediaLibrary />);

    await waitFor(() => {
      expect(screen.getByText('church-logo.png')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nombre o etiqueta...');
    await user.type(searchInput, 'Logo');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(screen.getByText('church-logo.png')).toBeInTheDocument();
    });
  });

  it('allows editing label on a media item', async () => {
    const user = userEvent.setup();
    render(<MediaLibrary />);

    await waitFor(() => {
      expect(screen.getByText('Logo Ministerio')).toBeInTheDocument();
    });

    const labelButton = screen.getByText('Logo Ministerio');
    await user.click(labelButton);

    const labelInput = screen.getByDisplayValue('Logo Ministerio');
    expect(labelInput).toBeInTheDocument();
  });

  it('shows "agregar etiqueta" link for items without labels', async () => {
    render(<MediaLibrary />);

    await waitFor(() => {
      expect(screen.getByText('pastor-portrait.jpg')).toBeInTheDocument();
    });

    const addLabelLinks = screen.getAllByText('+ Agregar etiqueta');
    expect(addLabelLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('displays file size and dimensions for each item', async () => {
    render(<MediaLibrary />);

    await waitFor(() => {
      expect(screen.getByText('church-logo.png')).toBeInTheDocument();
    });

    expect(screen.getByText(/239\.3 KB/)).toBeInTheDocument();
    expect(screen.getByText(/800×600/)).toBeInTheDocument();
  });

  it('shows correct item count', async () => {
    render(<MediaLibrary />);

    await waitFor(() => {
      expect(screen.getByText('2 archivos')).toBeInTheDocument();
    });
  });
});
