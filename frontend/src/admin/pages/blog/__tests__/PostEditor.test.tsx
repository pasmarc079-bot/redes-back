import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostEditor from '@/admin/pages/blog/PostEditor';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: undefined }),
}));

vi.mock('@blocknote/react', () => ({
  useCreateBlockNote: () => ({
    topLevelBlocks: [],
    pmSchema: {},
    replaceBlocks: vi.fn(),
    _tiptapEditor: { schema: {} },
  }),
  SuggestionMenuController: () => null,
}));

vi.mock('@blocknote/mantine', () => ({
  BlockNoteView: ({ children }: any) => <div data-testid="blocknote">{children}</div>,
}));

vi.mock('@blocknote/core', () => ({
  BlockNoteSchema: { create: () => ({}) },
  defaultBlockSpecs: {},
  HTMLToBlocks: vi.fn(() => Promise.resolve([])),
  createInternalHTMLSerializer: () => ({
    serializeBlocks: () => '<p></p>',
  }),
  filterSuggestionItems: vi.fn(() => []),
}));

const mockGet = vi.fn((url: string) => {
  if (url.includes('tags')) return Promise.resolve({ data: [] });
  return Promise.resolve({ data: {} });
});
const mockPost = vi.fn((..._args: any[]) => Promise.resolve({ data: {} }));

vi.mock('axios', () => ({
  default: {
    create: () => ({
      get: (url: string) => mockGet(url),
      post: (...args: any[]) => mockPost(...args),
      put: vi.fn(() => Promise.resolve({ data: {} })),
      interceptors: { request: { use: vi.fn() } },
    }),
  },
}));

vi.mock('@/admin/components/upload/MediaUpload', () => ({
  default: ({ onUpload, showLabelInput }: any) => (
    <div data-testid="media-upload">
      {showLabelInput && <input data-testid="cover-label-input" placeholder="Etiqueta" />}
      <p>PNG, JPG, WebP o GIF (máx. 10MB)</p>
      <button onClick={() => onUpload('https://test.com/uploaded.jpg', { id: '1', label: 'Test' })}>
        Simular Upload
      </button>
    </div>
  ),
}));

vi.mock('@/admin/components/ui/MediaPicker', () => ({
  default: ({ open, onSelect }: any) =>
    open ? (
      <div data-testid="media-picker">
        <button onClick={() => onSelect('https://test.com/picked.jpg')}>Pick Image</button>
      </div>
    ) : null,
}));

vi.mock('@/admin/components/editor/blocks/mediaWithText', () => ({
  createMediaWithTextBlockSpec: () => ({}),
}));

vi.mock('@/admin/components/editor/MediaWithTextSlashMenu', () => ({
  getCustomSlashMenuItems: () => [],
}));

describe('PostEditor — Cover Image Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the cover image card with title', async () => {
    render(<PostEditor />);
    expect(screen.getByText('Imagen de portada')).toBeInTheDocument();
  });

  it('shows empty state with library button when no cover image', async () => {
    render(<PostEditor />);
    expect(screen.getByText('Elegir de biblioteca')).toBeInTheDocument();
    expect(screen.getByText('o arrastra una imagen')).toBeInTheDocument();
  });

  it('shows MediaUpload with label input in empty state', async () => {
    render(<PostEditor />);
    expect(screen.getByTestId('media-upload')).toBeInTheDocument();
    expect(screen.getByTestId('cover-label-input')).toBeInTheDocument();
  });

  it('shows format hint below upload area', async () => {
    render(<PostEditor />);
    expect(screen.getByText(/PNG, JPG, WebP o GIF/)).toBeInTheDocument();
    expect(screen.getAllByText(/PNG, JPG, WebP o GIF/)).toHaveLength(1);
  });

  it('library selector is keyboard accessible as a button', async () => {
    render(<PostEditor />);
    const libraryButton = screen.getByRole('button', { name: 'Elegir imagen de la biblioteca' });
    expect(libraryButton).toBeInTheDocument();
    expect(libraryButton).toHaveAttribute('type', 'button');
  });

  it('opens MediaPicker when clicking library button', async () => {
    const user = userEvent.setup();
    render(<PostEditor />);

    const libraryBtn = screen.getByText('Elegir de biblioteca');
    await user.click(libraryBtn);

    expect(screen.getByTestId('media-picker')).toBeInTheDocument();
  });

  it('sets cover image when MediaPicker selects an image', async () => {
    const user = userEvent.setup();
    render(<PostEditor />);

    await user.click(screen.getByText('Elegir de biblioteca'));
    await user.click(screen.getByText('Pick Image'));

    await waitFor(() => {
      expect(screen.getByAltText('Portada')).toBeInTheDocument();
    });
  });

  it('shows preview with hover overlay when cover image is set', async () => {
    const user = userEvent.setup();
    render(<PostEditor />);

    await user.click(screen.getByText('Elegir de biblioteca'));
    await user.click(screen.getByText('Pick Image'));

    await waitFor(() => {
      expect(screen.getByAltText('Portada')).toBeInTheDocument();
    });

    expect(screen.getByText('Cambiar')).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('removes cover image when clicking Eliminar', async () => {
    const user = userEvent.setup();
    render(<PostEditor />);

    await user.click(screen.getByText('Elegir de biblioteca'));
    await user.click(screen.getByText('Pick Image'));

    await waitFor(() => {
      expect(screen.getByAltText('Portada')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Eliminar'));

    expect(screen.queryByAltText('Portada')).not.toBeInTheDocument();
    expect(screen.getByText('Elegir de biblioteca')).toBeInTheDocument();
  });
});

describe('PostEditor — SEO Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the SEO card with title', async () => {
    render(<PostEditor />);
    expect(screen.getByText('SEO')).toBeInTheDocument();
  });

  it('renders Título SEO label and input', async () => {
    render(<PostEditor />);
    expect(screen.getByText('Título SEO')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Título para buscadores/)).toBeInTheDocument();
  });

  it('renders Descripción SEO label and textarea', async () => {
    render(<PostEditor />);
    expect(screen.getByText('Descripción SEO')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Descripción para buscadores/)).toBeInTheDocument();
  });

  it('shows character counter for seoTitle', async () => {
    render(<PostEditor />);
    expect(screen.getByText('0/60 caracteres')).toBeInTheDocument();
  });

  it('shows character counter for seoDescription', async () => {
    render(<PostEditor />);
    expect(screen.getByText('0/160 caracteres')).toBeInTheDocument();
  });

  it('updates character counter when typing in seoTitle', async () => {
    const user = userEvent.setup();
    render(<PostEditor />);

    const input = screen.getByPlaceholderText(/Título para buscadores/);
    await user.type(input, 'Mi título SEO');

    expect(screen.getByText('13/60 caracteres')).toBeInTheDocument();
  });

  it('updates character counter when typing in seoDescription', async () => {
    const user = userEvent.setup();
    render(<PostEditor />);

    const textarea = screen.getByPlaceholderText(/Descripción para buscadores/);
    await user.type(textarea, 'Una descripción corta');

    expect(screen.getByText('21/160 caracteres')).toBeInTheDocument();
  });

  it('shows amber counter when near limit (seoTitle > 55)', async () => {
    const user = userEvent.setup();
    render(<PostEditor />);

    const input = screen.getByPlaceholderText(/Título para buscadores/);
    await user.type(input, 'Este es un título largo para SEO que supera los cincuenta y cinco caracteres');

    const counter = screen.getByText(/\/60 caracteres/);
    expect(counter).toHaveClass('text-amber-600');
  });

  it('shows gray counter when below limit', async () => {
    const user = userEvent.setup();
    render(<PostEditor />);

    const input = screen.getByPlaceholderText(/Título para buscadores/);
    await user.type(input, 'Título corto');

    const counter = screen.getByText(/\/60 caracteres/);
    expect(counter).toHaveClass('text-gray-400');
  });

  it('SEO inputs have maxLength attributes', async () => {
    render(<PostEditor />);

    const titleInput = screen.getByPlaceholderText(/Título para buscadores/);
    const descTextarea = screen.getByPlaceholderText(/Descripción para buscadores/);

    expect(titleInput).toHaveAttribute('maxLength', '60');
    expect(descTextarea).toHaveAttribute('maxLength', '160');
  });

  it('SEO label and input are stacked vertically (no grid)', async () => {
    render(<PostEditor />);

    const seoSection = screen.getByText('SEO').closest('.card');
    expect(seoSection).toBeInTheDocument();

    // Labels should be directly above inputs in the DOM
    const tituloLabel = screen.getByText('Título SEO');
    const tituloInput = screen.getByPlaceholderText(/Título para buscadores/);
    expect(tituloLabel.compareDocumentPosition(tituloInput)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
