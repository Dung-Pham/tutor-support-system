"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Typography } from "@tiptap/extension-typography";
import { HorizontalRule } from "./horizontal-rule-extension";
import type { JSONContent } from "@tiptap/core";

// Import styles
import "./styles/blockquote-node.scss";
import "./styles/code-block-node.scss";
import "./styles/horizontal-rule-node.scss";
import "./styles/list-node.scss";
import "./styles/image-node.scss";
import "./styles/heading-node.scss";
import "./styles/paragraph-node.scss";

interface TiptapRendererProps {
  content: JSONContent | string | null | undefined;
  className?: string;
}

/**
 * Component to render Tiptap content in read-only mode
 * Uses the same extensions as the editor to ensure correct rendering
 */
export function TiptapRenderer({
  content,
  className = "",
}: TiptapRendererProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false, // Use custom HorizontalRule extension
      }),
      HorizontalRule, // Custom extension
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "tiptap-image",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      Typography,
    ],
    content: content || "",
    editable: false, // Read-only mode
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none",
      },
    },
  });

  if (!content) {
    return <p className="text-gray-500 italic">Không có nội dung</p>;
  }

  return (
    <div className={`tiptap-renderer ${className}`}>
      <EditorContent editor={editor} />
    </div>
  );
}

export default TiptapRenderer;
