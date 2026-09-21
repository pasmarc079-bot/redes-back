import { Node } from '@tiptap/core';

export const Columns = Node.create({
  name: 'columns',
  group: 'block',
  content: 'columnsBlock+',
  defining: true,

  addAttributes() {
    return { layout: { default: '50-50' } };
  },

  parseHTML() {
    return [{ tag: 'div[data-columns-layout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-columns-layout': HTMLAttributes.layout, style: 'display:flex;flex-wrap:wrap;gap:1rem;margin-bottom:1rem' }, 0];
  },
});

export const ColumnsBlock = Node.create({
  name: 'columnsBlock',
  group: 'columnsBlock',
  content: 'block+',
  defining: true,

  addAttributes() {
    return { width: { default: '50%' } };
  },

  parseHTML() {
    return [{ tag: 'div[data-column-node]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-column-node': '', style: 'flex:1;min-width:0;padding:0.5rem' }, 0];
  },
});
