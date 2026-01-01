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
import { Video } from '@/components/tiptap-node/video-node/video-node-extension';
import type { JSONContent } from '@tiptap/core';
import { useCallback } from 'react';

// Import styles giống như simple-editor
import '@/components/tiptap-node/blockquote-node/blockquote-node.scss';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/heading-node/heading-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';
import '@/components/tiptap-node/video-node/video-node.scss';

interface TiptapRendererProps {
  content: JSONContent | string | null | undefined;
  className?: string;
}

// Check if URL is a Cloudinary file (not image/video)
const isCloudinaryFileUrl = (url: string): boolean => {
  return url.includes('cloudinary.com') && url.includes('/raw/upload/');
};

// Download file with correct filename
const downloadFile = async (url: string, fileName: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
    window.open(url, '_blank');
  }
};

/**
 * Component để render nội dung Tiptap ở chế độ read-only
 * Sử dụng cùng extensions như simple-editor để đảm bảo render đúng
 */
export function TiptapRenderer({ content, className = '' }: TiptapRendererProps) {
  // Handle click on links - intercept Cloudinary file downloads
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');

    if (link) {
      const href = link.getAttribute('href');
      if (href && isCloudinaryFileUrl(href)) {
        e.preventDefault();
        // Get filename from link text (the displayed text is the original filename)
        const fileName = link.textContent || 'download';
        downloadFile(href, fileName);
      }
    }
  }, []);

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
      Video, // Video extension
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
    <div className={`tiptap-renderer ${className}`} onClick={handleClick}>
      <EditorContent editor={editor} />
    </div>
  );
}

export default TiptapRenderer;
