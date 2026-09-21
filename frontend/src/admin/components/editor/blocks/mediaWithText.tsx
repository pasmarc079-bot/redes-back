import { useRef, useCallback, useState } from 'react';
import { createReactBlockSpec } from '@blocknote/react';
import { defaultProps } from '@blocknote/core';
import { FiAlignCenter, FiAlignLeft, FiAlignRight, FiTrash2 } from 'react-icons/fi';

const ALIGN_OPTIONS = [
  { value: 'flex-start' as const, label: 'Top' },
  { value: 'center' as const, label: 'Center' },
  { value: 'flex-end' as const, label: 'Bottom' },
];

function MediaPickerInline({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = q ? `?search=${encodeURIComponent(q)}` : '';
      const res = await fetch(`/api/v1/admin/media${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpen = useCallback(() => {
    load();
  }, [load]);

  // Auto-load on mount via ref
  const mounted = useRef(false);
  if (!mounted.current) {
    mounted.current = true;
    load();
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        style={{ background: '#fff', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>Seleccionar imagen</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#999' }}>×</button>
        </div>
        <div style={{ padding: '8px 16px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); load(e.target.value); }}
            placeholder="Buscar..."
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
          />
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 16px 16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#999' }}>Cargando...</div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#999' }}>No hay imágenes</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {items.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item.originalUrl); onClose(); }}
                  style={{
                    aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '2px solid transparent',
                    cursor: 'pointer', padding: 0, background: 'none', transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#B8860B'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  <img
                    src={item.thumbnailUrl || item.mediumUrl || item.originalUrl}
                    alt={item.label || item.fileName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MediaWithTextRenderer({
  block,
  editor,
  contentRef,
}: {
  block: any;
  editor: any;
  contentRef: (node: HTMLElement | null) => void;
}) {
  const [renderKey, setRenderKey] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const { mediaUrl, mediaType, mediaPosition, textVerticalAlign } = block.props;
  const { textAlignment = 'left', caption = '' } = block.props;

  const forceRerender = useCallback(() => setRenderKey((k) => k + 1), []);

  const handlePickMedia = useCallback((url: string) => {
    const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
    editor.updateBlock(block, {
      props: { mediaUrl: url, mediaType: isVideo ? 'video' : 'image' },
    });
    forceRerender();
  }, [editor, block, forceRerender]);

  const handleFileUpload = useCallback(async (file: File) => {
    const isVideo = file.type.startsWith('video/');
    const url = await editor.uploadFile(file);
    editor.updateBlock(block, {
      props: { mediaUrl: url, mediaType: isVideo ? 'video' : 'image' },
    });
    forceRerender();
  }, [editor, block, forceRerender]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const togglePosition = useCallback(() => {
    editor.updateBlock(block, {
      props: { mediaPosition: block.props.mediaPosition === 'left' ? 'right' : 'left' },
    });
    forceRerender();
  }, [editor, block, forceRerender]);

  const removeMedia = useCallback(() => {
    editor.updateBlock(block, {
      props: { mediaUrl: '', mediaType: 'image' },
    });
    forceRerender();
  }, [editor, block, forceRerender]);

  const setVerticalAlign = useCallback((val: string) => {
    editor.updateBlock(block, { props: { textVerticalAlign: val } });
    forceRerender();
  }, [editor, block, forceRerender]);

  const setTextAlignment = useCallback((val: string) => {
    editor.updateBlock(block, { props: { textAlignment: val } });
    forceRerender();
  }, [editor, block, forceRerender]);

  const removeBlock = useCallback(() => editor.removeBlocks([block]), [editor, block]);

  const textCol = (
    <div
      ref={contentRef}
      className="bn-media-with-text-text"
      style={{ flex: '1 1 300px', minWidth: '200px', textAlign: textAlignment }}
    />
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const mediaCol = (
    <div
      key={renderKey}
      className="bn-media-with-text-media"
      style={{ flex: '1 1 200px', maxWidth: '50%', minWidth: '200px', position: 'relative' }}
    >
      {pickerOpen && (
        <MediaPickerInline
          onSelect={handlePickMedia}
          onClose={() => setPickerOpen(false)}
        />
      )}
      {mediaUrl ? (
        <>
          <div style={{ position: 'relative' }}>
            {mediaType === 'image' ? (
              <img src={mediaUrl} alt="" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }} />
            ) : (
              <video src={mediaUrl} controls style={{ width: '100%', display: 'block', borderRadius: '4px' }} />
            )}
            <div style={{
              position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px',
            }}>
              <button
                type="button"
                onClick={removeMedia}
                style={{
                  width: '28px', height: '28px', borderRadius: '4px', border: 'none',
                  background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                }}
                title="Remove media"
              >
                ×
              </button>
            </div>
          </div>
           <div style={{ display: 'flex', gap: '4px', marginTop: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={togglePosition}
              style={{
                padding: '4px 10px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ddd',
                background: '#fff', cursor: 'pointer', color: '#666',
              }}
            >
              {block.props.mediaPosition === 'left' ? 'Text → Right' : 'Text ← Left'}
            </button>
            {ALIGN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setVerticalAlign(opt.value)}
                style={{
                  padding: '4px 10px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ddd',
                  background: block.props.textVerticalAlign === opt.value ? '#B8860B' : '#fff',
                  color: block.props.textVerticalAlign === opt.value ? '#fff' : '#666',
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            ))}
            {[
              { value: 'left', label: 'Texto izquierda', Icon: FiAlignLeft },
              { value: 'center', label: 'Texto centrado', Icon: FiAlignCenter },
              { value: 'right', label: 'Texto derecha', Icon: FiAlignRight },
            ].map(({ value, label, Icon }) => (
              <button key={value} type="button" onClick={() => setTextAlignment(value)} aria-label={label} title={label} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', background: textAlignment === value ? '#B8860B' : '#fff', color: textAlignment === value ? '#fff' : '#666', cursor: 'pointer' }}>
                <Icon size={14} />
              </button>
            ))}
            <button type="button" onClick={removeBlock} aria-label="Eliminar bloque Imagen con Texto" title="Eliminar bloque" style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', cursor: 'pointer' }}><FiTrash2 size={14} /></button>
          </div>
          <input value={caption} onChange={(event) => { editor.updateBlock(block, { props: { caption: event.target.value } }); forceRerender(); }} placeholder="Leyenda opcional de la imagen" aria-label="Leyenda de la imagen" style={{ width: '100%', marginTop: '6px', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '5px 8px', fontSize: '12px' }} />
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
           <div
             onClick={() => setPickerOpen(true)}
             onDragOver={(event) => event.preventDefault()}
             onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) handleFileUpload(file); }}
            style={{
              padding: '32px 16px', textAlign: 'center', background: '#f5f5f5',
              color: '#999', borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
              border: '2px dashed #ddd', transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#B8860B'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#ddd'; }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>+</div>
            <div>Click para elegir imagen o video</div>
            <div style={{ fontSize: '12px', color: '#bbb', marginTop: '4px' }}>
              De la biblioteca o subir nuevo
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              style={{
                padding: '6px 12px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ddd',
                background: '#fff', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              Biblioteca
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '6px 12px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ddd',
                background: '#fff', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              Subir nuevo
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );

  return (
    <div
      className="bn-media-with-text"
      data-media-url={mediaUrl}
      data-media-type={mediaType}
      data-media-position={mediaPosition}
      data-text-vertical-align={textVerticalAlign}
      style={{
        display: 'flex',
        gap: '16px',
        alignItems: textVerticalAlign || 'flex-start',
        flexWrap: 'wrap-reverse',
      }}
    >
      {mediaPosition === 'right' && textCol}
      {mediaCol}
      {mediaPosition === 'left' && textCol}
    </div>
  );
}

export const createMediaWithTextBlockSpec = createReactBlockSpec(
  {
    type: 'mediaWithText' as const,
    propSchema: {
      mediaUrl: { default: '' as const },
      mediaType: { default: 'image' as const, values: ['image', 'video'] as const },
      mediaPosition: { default: 'left' as const, values: ['left', 'right'] as const },
      textVerticalAlign: { default: 'flex-start' as const, values: ['flex-start', 'center', 'flex-end'] as const },
      textAlignment: { default: 'left' as const, values: ['left', 'center', 'right'] as const },
      caption: { default: '' as const },
      backgroundColor: defaultProps.backgroundColor,
    },
    content: 'inline' as const,
  },
  {
    meta: {
      fileBlockAccept: ['image/*', 'video/*'],
    },
    parse: (element: HTMLElement) => {
      if (element.tagName !== 'DIV' || !element.classList.contains('bn-media-with-text')) {
        return undefined;
      }
      return {
        mediaUrl: element.getAttribute('data-media-url') || '',
        mediaType: (element.getAttribute('data-media-type') as 'image' | 'video') || 'image',
        mediaPosition: (element.getAttribute('data-media-position') as 'left' | 'right') || 'left',
        textVerticalAlign: (element.getAttribute('data-text-vertical-align') as 'flex-start' | 'center' | 'flex-end') || 'flex-start',
        textAlignment: (element.getAttribute('data-text-alignment') as 'left' | 'center' | 'right') || 'left',
        caption: element.querySelector('figcaption')?.textContent || '',
      };
    },
    render: (props) => <MediaWithTextRenderer {...props} />,
    toExternalHTML: ({ block, contentRef }: any) => {
      const media = block.props.mediaUrl
        ? block.props.mediaType === 'image'
          ? <img src={block.props.mediaUrl} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
          : <video src={block.props.mediaUrl} controls style={{ width: '100%', display: 'block' }} />
        : null;
      const mediaCol = (
        <div className="w-full md:w-1/2">
          {media}
          {block.props.caption && <figcaption className="mt-2 text-sm text-gray-500">{block.props.caption}</figcaption>}
        </div>
      );
      const textAlignmentClass = block.props.textAlignment === 'center' ? 'text-center' : block.props.textAlignment === 'right' ? 'text-right' : 'text-left';
      const textCol = <div ref={contentRef} className={`w-full md:w-1/2 ${textAlignmentClass}`} />;
      const children = block.props.mediaPosition === 'right' ? [textCol, mediaCol] : [mediaCol, textCol];

      return (
        <div
          className={`bn-media-with-text my-6 flex flex-col md:flex-row gap-6 ${block.props.mediaPosition === 'right' ? 'md:flex-row-reverse' : ''}`}
          data-media-url={block.props.mediaUrl}
          data-media-type={block.props.mediaType}
          data-media-position={block.props.mediaPosition}
          data-text-alignment={block.props.textAlignment || 'left'}
          style={{ alignItems: block.props.textVerticalAlign || 'flex-start' }}
        >
          {children}
        </div>
      );
    },
  },
);
