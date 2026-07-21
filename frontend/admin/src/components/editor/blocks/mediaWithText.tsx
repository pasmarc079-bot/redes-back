import { useRef, useCallback, useState } from 'react';
import { createReactBlockSpec } from '@blocknote/react';
import { defaultProps } from '@blocknote/core';

const ALIGN_OPTIONS = [
  { value: 'flex-start' as const, label: 'Top' },
  { value: 'center' as const, label: 'Center' },
  { value: 'flex-end' as const, label: 'Bottom' },
];

function MediaWithTextRenderer({
  block,
  editor,
  contentRef,
}: {
  block: any;
  editor: any;
  contentRef: (node: HTMLElement | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [renderKey, setRenderKey] = useState(0);

  const { mediaUrl, mediaType, mediaPosition, textVerticalAlign } = block.props;

  const forceRerender = useCallback(() => setRenderKey((k) => k + 1), []);

  const handleUpload = useCallback(async (file: File) => {
    const isVideo = file.type.startsWith('video/');
    const url = await editor.uploadFile(file);
    editor.updateBlock(block, {
      props: { mediaUrl: url, mediaType: isVideo ? 'video' : 'image' },
    });
    forceRerender();
  }, [editor, block, forceRerender]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

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

  const textCol = (
    <div
      ref={contentRef}
      className="bn-media-with-text-text"
      style={{ flex: '1 1 300px', minWidth: '200px' }}
    />
  );

  const mediaCol = (
    <div
      key={renderKey}
      className="bn-media-with-text-media"
      style={{ flex: '1 1 200px', maxWidth: '50%', minWidth: '200px', position: 'relative' }}
    >
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
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '32px 16px', textAlign: 'center', background: '#f5f5f5',
              color: '#999', borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
              border: '2px dashed #ddd', transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#B8860B'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#ddd'; }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>+</div>
            <div>Click to upload image or video</div>
            <div style={{ fontSize: '12px', color: '#bbb', marginTop: '4px' }}>
              PNG, JPG, WebP, GIF, MP4, WebM
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                fileInputRef.current!.accept = 'image/*';
                fileInputRef.current?.click();
              }}
              style={{
                padding: '6px 12px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ddd',
                background: '#fff', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              Image
            </button>
            <button
              type="button"
              onClick={() => {
                fileInputRef.current!.accept = 'video/*';
                fileInputRef.current?.click();
              }}
              style={{
                padding: '6px 12px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ddd',
                background: '#fff', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              Video
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
      backgroundColor: defaultProps.backgroundColor,
      textAlignment: defaultProps.textAlignment,
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
      };
    },
    render: (props) => <MediaWithTextRenderer {...props} />,
    toExternalHTML: (block: any) => {
      const container = document.createElement('div');
      container.className = 'bn-media-with-text';
      container.setAttribute('data-media-url', block.props.mediaUrl);
      container.setAttribute('data-media-type', block.props.mediaType);
      container.setAttribute('data-media-position', block.props.mediaPosition);
      container.style.display = 'flex';
      container.style.gap = '16px';
      container.style.alignItems = block.props.textVerticalAlign || 'flex-start';
      container.style.flexWrap = 'wrap-reverse';

      const mediaCol = document.createElement('div');
      mediaCol.className = 'bn-media-with-text-media';
      mediaCol.style.flex = '1 1 200px';
      mediaCol.style.maxWidth = '50%';
      mediaCol.style.minWidth = '200px';

      if (block.props.mediaUrl) {
        if (block.props.mediaType === 'image') {
          const img = document.createElement('img');
          img.src = block.props.mediaUrl;
          img.alt = '';
          img.style.width = '100%';
          img.style.height = 'auto';
          img.style.display = 'block';
          mediaCol.appendChild(img);
        } else {
          const video = document.createElement('video');
          video.src = block.props.mediaUrl;
          video.controls = true;
          video.style.width = '100%';
          video.style.display = 'block';
          mediaCol.appendChild(video);
        }
      }

      const textCol = document.createElement('div');
      textCol.className = 'bn-media-with-text-text';

      const order = block.props.mediaPosition === 'right' ? [textCol, mediaCol] : [mediaCol, textCol];
      for (const el of order) {
        container.appendChild(el);
      }

      return { dom: container, contentDOM: textCol };
    },
  },
);
