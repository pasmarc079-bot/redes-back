import { useState, useCallback, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import { FiType, FiImage, FiVideo, FiGrid, FiList, FiHash, FiChevronDown } from 'react-icons/fi';
import MediaUpload from '@/components/upload/MediaUpload';

interface Props {
  editor: Editor;
  open: boolean;
  onClose: () => void;
}

const items = [
  {
    id: 'text',
    label: 'Texto normal',
    icon: FiType,
    description: 'Párrafo de texto',
    action: (editor: Editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    id: 'heading2',
    label: 'Título H2',
    icon: FiType,
    description: 'Encabezado de sección',
    action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'heading3',
    label: 'Subtítulo H3',
    icon: FiType,
    description: 'Encabezado de subsección',
    action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: 'bulletList',
    label: 'Lista con viñetas',
    icon: FiList,
    description: 'Lista desordenada',
    action: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'orderedList',
    label: 'Lista numerada',
    icon: FiHash,
    description: 'Lista ordenada',
    action: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'columns',
    label: 'Dos columnas',
    icon: FiGrid,
    description: 'Layout de 2 columnas',
    action: (editor: Editor) => {
      editor.chain().focus().insertContent(
        '<div data-columns-layout="50-50" style="display:flex;flex-wrap:wrap;gap:1rem;margin-bottom:1rem"><div data-column-node="" style="flex:1;min-width:0;padding:0.5rem"><p></p></div><div data-column-node="" style="flex:1;min-width:0;padding:0.5rem"><p></p></div></div>'
      ).run();
    },
  },
  {
    id: 'youtube',
    label: 'Video YouTube',
    icon: FiVideo,
    description: 'Insertar video de YouTube',
    action: (editor: Editor) => {
      const url = prompt('URL del video de YouTube:');
      if (!url) return;
      editor.chain().focus().setYouTube({ src: url }).run();
    },
  },
  {
    id: 'image',
    label: 'Imagen',
    icon: FiImage,
    description: 'Subir una imagen',
    action: () => {}, // handled separately
  },
];

export default function InsertMenu({ editor, open, onClose }: Props) {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedIndex(0);
      setShowImageUpload(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        execute(filtered[selectedIndex]);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, filtered, selectedIndex]);

  const execute = (item: typeof items[0]) => {
    if (item.id === 'image') {
      setShowImageUpload(true);
      return;
    }
    item.action(editor);
    onClose();
  };

  const addImage = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
    setShowImageUpload(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className="bg-white border border-gray-200 rounded-xl shadow-2xl z-50 w-72 overflow-hidden"
    >
      {showImageUpload ? (
        <div className="p-3">
          <MediaUpload onUpload={addImage} label="Subir imagen" />
          <button
            type="button"
            onClick={() => setShowImageUpload(false)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            ← Volver
          </button>
        </div>
      ) : (
        <>
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
              placeholder="Filtrar bloques..."
              className="w-full px-3 py-1.5 text-sm bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
            />
          </div>
          <div className="p-1 max-h-64 overflow-y-auto">
            {filtered.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => execute(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  index === selectedIndex ? 'bg-gold/10 text-gold-dark' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  index === selectedIndex ? 'bg-gold/20' : 'bg-gray-100'
                }`}>
                  <item.icon size={16} className={index === selectedIndex ? 'text-gold-dark' : 'text-gray-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-4">Sin resultados</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
