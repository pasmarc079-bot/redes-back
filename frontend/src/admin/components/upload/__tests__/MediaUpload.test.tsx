import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MediaUpload from '@/admin/components/upload/MediaUpload';
import { showToast } from '@/admin/components/ui/Toast';

vi.mock('@/admin/components/ui/Toast', () => ({
  showToast: vi.fn(),
}));

const mockPost = vi.fn((..._args: any[]) =>
  Promise.resolve({
    data: {
      id: 'new-1',
      originalUrl: 'https://res.cloudinary.com/test/image/upload/v1/new.jpg',
      label: 'Test Label',
    },
  })
);

vi.mock('axios', () => ({
  default: {
    create: () => ({
      post: (...args: any[]) => mockPost(...args),
    }),
  },
}));

// Mock react-dropzone to expose onDrop callback for testing
let capturedOnDrop: ((files: File[]) => void) | null = null;

vi.mock('react-dropzone', () => ({
  useDropzone: ({ onDrop }: any) => {
    capturedOnDrop = onDrop;
    return {
      getRootProps: () => ({ 'data-testid': 'dropzone-step1' }),
      getInputProps: () => ({ type: 'file' }),
      isDragActive: false,
    };
  },
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

function createMockFile(name = 'test.png', type = 'image/png', size = 1024) {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

describe('MediaUpload — 2-Step Flow', () => {
  const mockOnUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    capturedOnDrop = null;
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Step 1: File Selection', () => {
    it('shows dropzone in step 1 when showLabelInput is true', () => {
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);
      expect(screen.getByTestId('dropzone-step1')).toBeInTheDocument();
      expect(screen.getByText(/Arrastra una imagen/)).toBeInTheDocument();
    });

    it('does not show label input or upload button in step 1', () => {
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);
      expect(screen.queryByTestId('label-input')).not.toBeInTheDocument();
      expect(screen.queryByTestId('upload-button')).not.toBeInTheDocument();
    });

    it('does not show metadata form before file is selected', () => {
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);
      expect(screen.queryByTestId('step2-metadata')).not.toBeInTheDocument();
    });

    it('shows file type hints in step 1', () => {
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);
      expect(screen.getByText(/PNG, JPG, WebP o GIF/)).toBeInTheDocument();
    });

  });

  describe('Step 2: Metadata & Confirm', () => {
    it('transitions to step 2 when onDrop is called with a file', async () => {
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);

      expect(capturedOnDrop).toBeTruthy();
      capturedOnDrop!([createMockFile()]);

      await waitFor(() => {
        expect(screen.getByTestId('step2-metadata')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('dropzone-step1')).not.toBeInTheDocument();
    });

    it('shows image preview in step 2', async () => {
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);

      capturedOnDrop!([createMockFile()]);

      await waitFor(() => {
        expect(screen.getByAltText('Vista previa')).toBeInTheDocument();
      });
    });

    it('shows file name and size on the preview', async () => {
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);

      capturedOnDrop!([createMockFile('church-photo.png', 'image/png', 2048)]);

      await waitFor(() => {
        expect(screen.getByText('church-photo.png')).toBeInTheDocument();
        expect(screen.getByText(/\(2 KB\)/)).toBeInTheDocument();
      });
    });

    it('shows label input in step 2', async () => {
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);

      capturedOnDrop!([createMockFile()]);

      await waitFor(() => {
        expect(screen.getByTestId('label-input')).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/Etiqueta/)).toBeInTheDocument();
    });

    it('constrains the preview and keeps the metadata form full width', async () => {
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);

      capturedOnDrop!([createMockFile()]);

      await waitFor(() => {
        expect(screen.getByTestId('step2-metadata')).toBeInTheDocument();
      });

      expect(screen.getByTestId('step2-metadata').parentElement).toHaveClass('max-w-2xl');
      expect(screen.getByAltText('Vista previa')).toHaveClass('object-contain');
      expect(screen.getByTestId('label-input')).toHaveClass('w-full');
    });

    it('shows upload button disabled when label is empty', async () => {
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);

      capturedOnDrop!([createMockFile()]);

      await waitFor(() => {
        expect(screen.getByTestId('upload-button')).toBeInTheDocument();
      });

      expect(screen.getByTestId('upload-button')).toBeDisabled();
    });

    it('enables upload button when label is provided', async () => {
      const user = userEvent.setup();
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);

      capturedOnDrop!([createMockFile()]);

      await waitFor(() => {
        expect(screen.getByTestId('upload-button')).toBeInTheDocument();
      });

      expect(screen.getByTestId('upload-button')).toBeDisabled();

      await user.type(screen.getByTestId('label-input'), 'Logo Ministerio');

      expect(screen.getByTestId('upload-button')).not.toBeDisabled();
    });

    it('calls API and onUpload when upload button is clicked with valid label', async () => {
      const user = userEvent.setup();
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);

      capturedOnDrop!([createMockFile()]);

      await waitFor(() => {
        expect(screen.getByTestId('upload-button')).toBeInTheDocument();
      });

      await user.type(screen.getByTestId('label-input'), 'Mi Etiqueta');
      await user.click(screen.getByTestId('upload-button'));

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalled();
      });

      expect(mockOnUpload).toHaveBeenCalledWith(
        'https://res.cloudinary.com/test/image/upload/v1/new.jpg',
        { id: 'new-1', label: 'Test Label' }
      );
    });

    it('sends label in FormData', async () => {
      const user = userEvent.setup();
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);

      capturedOnDrop!([createMockFile()]);

      await waitFor(() => {
        expect(screen.getByTestId('upload-button')).toBeInTheDocument();
      });

      await user.type(screen.getByTestId('label-input'), 'Logo Ministerio');
      await user.click(screen.getByTestId('upload-button'));

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalled();
      });

      const formData = mockPost.mock.calls[0][1] as FormData;
      expect(formData.get('label')).toBe('Logo Ministerio');
    });

    it('resets to step 1 after successful upload', async () => {
      const user = userEvent.setup();
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);

      capturedOnDrop!([createMockFile()]);

      await waitFor(() => {
        expect(screen.getByTestId('upload-button')).toBeInTheDocument();
      });

      await user.type(screen.getByTestId('label-input'), 'Logo');
      await user.click(screen.getByTestId('upload-button'));

      await waitFor(() => {
        expect(screen.getByTestId('dropzone-step1')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('step2-metadata')).not.toBeInTheDocument();
    });

    it('allows removing selected file and going back to step 1', async () => {
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);

      capturedOnDrop!([createMockFile()]);

      await waitFor(() => {
        expect(screen.getByTestId('step2-metadata')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('remove-file'));

      await waitFor(() => {
        expect(screen.getByTestId('dropzone-step1')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('step2-metadata')).not.toBeInTheDocument();
    });

    it('uses a toast notification when upload fails', async () => {
      mockPost.mockRejectedValueOnce(new Error('Upload failed'));
      const user = userEvent.setup();
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);

      capturedOnDrop!([createMockFile()]);

      await waitFor(() => {
        expect(screen.getByTestId('upload-button')).toBeInTheDocument();
      });

      await user.type(screen.getByTestId('label-input'), 'Test');
      await user.click(screen.getByTestId('upload-button'));

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith('error', 'Error al subir la imagen. Intenta de nuevo.');
      });
      expect(screen.queryByText(/Error al subir la imagen/)).not.toBeInTheDocument();
    });

    it('shows spinner while uploading', async () => {
      let resolveUpload: any;
      mockPost.mockImplementationOnce(() => new Promise((resolve) => { resolveUpload = resolve; }));
      const user = userEvent.setup();
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);

      capturedOnDrop!([createMockFile()]);

      await waitFor(() => {
        expect(screen.getByTestId('upload-button')).toBeInTheDocument();
      });

      await user.type(screen.getByTestId('label-input'), 'Test');
      await user.click(screen.getByTestId('upload-button'));

      await waitFor(() => {
        expect(screen.getByText('Subiendo...')).toBeInTheDocument();
      });

      expect(screen.getByTestId('upload-button')).toBeDisabled();

      resolveUpload({ data: { id: '1', originalUrl: 'test.jpg', label: 'Test' } });

      await waitFor(() => {
        expect(screen.getByTestId('dropzone-step1')).toBeInTheDocument();
      });
    });

    it('uploads immediately in simple mode without asking for a label', async () => {
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={false} />);

      expect(screen.queryByTestId('label-input')).not.toBeInTheDocument();
      expect(screen.queryByTestId('upload-button')).not.toBeInTheDocument();
      expect(screen.queryByText(/Etiqueta/)).not.toBeInTheDocument();

      capturedOnDrop!([createMockFile()]);

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalled();
        expect(mockOnUpload).toHaveBeenCalledWith(
          'https://res.cloudinary.com/test/image/upload/v1/new.jpg',
          { id: 'new-1', label: 'Test Label' }
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('label input has associated label element with correct for attribute', async () => {
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);

      capturedOnDrop!([createMockFile()]);

      await waitFor(() => {
        expect(screen.getByTestId('label-input')).toBeInTheDocument();
      });

      const labelInput = screen.getByTestId('label-input');
      expect(labelInput).toHaveAttribute('id', 'media-label-input');

      // Find the <label> element with matching htmlFor
      const labelEl = document.querySelector('label[for="media-label-input"]') as HTMLLabelElement;
      expect(labelEl).toBeInTheDocument();
      expect(labelEl.tagName).toBe('LABEL');
      expect(labelEl.textContent).toContain('Etiqueta');
    });

    it('remove button has aria-label', async () => {
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);

      capturedOnDrop!([createMockFile()]);

      await waitFor(() => {
        expect(screen.getByTestId('remove-file')).toBeInTheDocument();
      });

      expect(screen.getByLabelText('Eliminar imagen seleccionada')).toBeInTheDocument();
    });

    it('upload button text changes to "Subiendo..." during upload', async () => {
      let resolveUpload: any;
      mockPost.mockImplementationOnce(() => new Promise((resolve) => { resolveUpload = resolve; }));
      const user = userEvent.setup();
      render(<MediaUpload onUpload={mockOnUpload} showLabelInput={true} />);

      capturedOnDrop!([createMockFile()]);

      await waitFor(() => {
        expect(screen.getByTestId('upload-button')).toBeInTheDocument();
      });

      await user.type(screen.getByTestId('label-input'), 'Test');
      await user.click(screen.getByTestId('upload-button'));

      await waitFor(() => {
        expect(screen.getByText('Subiendo...')).toBeInTheDocument();
      });

      resolveUpload({ data: { id: '1', originalUrl: 'test.jpg', label: 'Test' } });
    });
  });
});
