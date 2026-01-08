import { Node, mergeAttributes } from '@tiptap/core';

export interface VideoOptions {
  HTMLAttributes: Record<string, unknown>;
  allowFullscreen: boolean;
}

export const Video = Node.create<VideoOptions>({
  name: 'video',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      allowFullscreen: true,
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        controls: true,
        class: 'tiptap-video',
      }),
    ];
  },
});
