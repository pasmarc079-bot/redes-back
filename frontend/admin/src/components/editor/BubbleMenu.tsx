import { BubbleMenu as TipTapBubbleMenu, type Editor } from '@tiptap/react';
import { FiBold, FiItalic, FiLink, FiUnderline } from 'react-icons/fi';

interface Props {
  editor: Editor;
}

export default function BubbleMenu({ editor }: Props) {
  const setLink = () => {
    const url = prompt('URL del enlace:');
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <TipTapBubbleMenu editor={editor} tippyOptions={{ duration: 150 }}>
      <div className="flex items-center gap-0.5 bg-gray-900 text-white rounded-xl shadow-xl px-1.5 py-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
        >
          <FiBold size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
        >
          <FiItalic size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-lg transition-colors ${editor.isActive('underline') ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
        >
          <FiUnderline size={15} />
        </button>
        <span className="w-px h-5 bg-white/20 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg transition-colors text-xs font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded-lg transition-colors text-xs font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
        >
          H3
        </button>
        <span className="w-px h-5 bg-white/20 mx-1" />
        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded-lg transition-colors ${editor.isActive('link') ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
        >
          <FiLink size={15} />
        </button>
      </div>
    </TipTapBubbleMenu>
  );
}
