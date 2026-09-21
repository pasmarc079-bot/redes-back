import '@testing-library/jest-dom';

// Polyfill URL.createObjectURL/revokeObjectURL for jsdom
if (!URL.createObjectURL) {
  URL.createObjectURL = (obj: any) => 'blob:mock-url-' + Math.random().toString(36).slice(2);
}
if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = () => {};
}

// jsdom doesn't implement DataTransfer — needed for react-dropzone file selection
class DataTransferMock {
  files: File[] = [];
  types: string[] = [];
  effectAllowed = 'uninitialized';

  set data(val: any) {}
  get data() {
    return {
      length: 0,
      add: () => {},
      clear: () => {},
      remove: () => {},
      [Symbol.iterator]: function* () {},
    };
  }

  setData(format: string, data: string) { return true; }
  getData(format: string) { return ''; }
  clearData(format?: string) {}
  setDragImage(image: Element, x: number, y: number) {}
}

if (typeof globalThis.DataTransfer === 'undefined') {
  (globalThis as any).DataTransfer = DataTransferMock;
}

if (typeof globalThis.DragEvent === 'undefined') {
  (globalThis as any).DragEvent = class DragEvent extends Event {
    dataTransfer: DataTransferMock | null = null;
    constructor(type: string, options: any = {}) {
      super(type, options);
      this.dataTransfer = options.dataTransfer || null;
    }
  };
}
