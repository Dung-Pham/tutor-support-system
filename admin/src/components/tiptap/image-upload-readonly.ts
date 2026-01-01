import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Read-only extension for imageUpload node.
 * This renders uploaded images from the frontend editor.
 */
export const ImageUploadReadonly = Node.create({
  name: "imageUpload",

  group: "block",

  atom: true,

  selectable: false,

  draggable: false,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      // These are from the upload node but we don't need them for rendering
      accept: {
        default: null,
      },
      limit: {
        default: null,
      },
      maxSize: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="imageUpload"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, title, width, height } = HTMLAttributes;

    // If no src, show placeholder
    if (!src) {
      return [
        "div",
        mergeAttributes(HTMLAttributes, {
          class: "image-upload-placeholder",
          style:
            "padding: 20px; text-align: center; background: #f3f4f6; border-radius: 8px; color: #9ca3af;",
        }),
        "Hình ảnh đang được tải...",
      ];
    }

    // Render as image
    return [
      "figure",
      { class: "tiptap-image-container" },
      [
        "img",
        mergeAttributes({
          src,
          alt: alt || "",
          title: title || "",
          width: width || undefined,
          height: height || undefined,
          class: "tiptap-image",
          style: "max-width: 100%; height: auto; border-radius: 8px;",
        }),
      ],
    ];
  },
});
