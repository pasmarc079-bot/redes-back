import { Node, mergeAttributes } from '@tiptap/core';

export interface YouTubeOptions {
  width: number;
  height: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    youtube: {
      setYouTube: (options: { src: string; width?: number; height?: number }) => ReturnType;
    };
  }
}

export const YouTube = Node.create<YouTubeOptions>({
  name: 'youtube',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      width: 640,
      height: 360,
    };
  },

  addAttributes() {
    return {
      src: { default: null },
      width: { default: this.options.width },
      height: { default: this.options.height },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-youtube]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, width, height } = HTMLAttributes;
    const embedUrl = src?.replace('watch?v=', 'embed/');
    return [
      'div',
      { 'data-youtube': '', class: 'youtube-wrapper', style: 'position:relative;padding-bottom:56.25%;height:0;margin-bottom:1rem' },
      ['iframe', {
        src: embedUrl || src,
        width,
        height,
        allowfullscreen: 'true',
        frameborder: '0',
        style: 'position:absolute;top:0;left:0;width:100%;height:100%',
        class: 'rounded-lg',
      }],
    ];
  },

  addCommands() {
    return {
      setYouTube:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    };
  },
});
