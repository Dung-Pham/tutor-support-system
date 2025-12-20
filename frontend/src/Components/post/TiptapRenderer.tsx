'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Typography } from '@tiptap/extension-typography';
import { HorizontalRule } from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension';
import type { JSONContent } from '@tiptap/core';

// Import styles giống như simple-editor
import '@/components/tiptap-node/blockquote-node/blockquote-node.scss';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/heading-node/heading-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';

interface TiptapRendererProps {
  content: JSONContent | string | null | undefined;
  className?: string;
}

/**
 * Component để render nội dung Tiptap ở chế độ read-only
 * Sử dụng cùng extensions như simple-editor để đảm bảo render đúng
 */
export function TiptapRenderer({ content, className = '' }: TiptapRendererProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false, // Sử dụng custom HorizontalRule extension
      }),
      HorizontalRule, // Custom extension giống simple-editor
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      Typography,
    ],
    content: content || '',
    editable: false, // Read-only mode
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none',
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
