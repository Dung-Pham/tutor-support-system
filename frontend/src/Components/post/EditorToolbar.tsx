import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image,
  Undo2,
  Redo2,
} from 'lucide-react';
import { useState } from 'react';
import { ImageUploadDialog } from './ImageUploadDialog';

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);

  const handleImageSelect = (url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setShowImageDialog(false);
  };

  const handleAddLink = () => {
    const url = window.prompt('Nhập URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-1 border-b p-2 bg-gray-50">
        {/* Undo / Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          title="Làm lại (Ctrl+Y)"
        >
          <Redo2 size={18} />
        </button>

        {/* Divider */}
        <div className="w-px bg-gray-300" />

        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 hover:bg-gray-200 rounded ${
            editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="In đậm (Ctrl+B)"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 hover:bg-gray-200 rounded ${
            editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="In nghiêng (Ctrl+I)"
        >
          <Italic size={18} />
        </button>

        {/* Divider */}
        <div className="w-px bg-gray-300" />

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 hover:bg-gray-200 rounded text-sm font-bold ${
            editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="Tiêu đề 1 (Ctrl+Alt+1)"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 hover:bg-gray-200 rounded text-sm font-bold ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="Tiêu đề 2 (Ctrl+Alt+2)"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 hover:bg-gray-200 rounded text-sm font-bold ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="Tiêu đề 3 (Ctrl+Alt+3)"
        >
          H3
        </button>

        {/* Divider */}
        <div className="w-px bg-gray-300" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 hover:bg-gray-200 rounded ${
            editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="Danh sách (Ctrl+Shift+8)"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 hover:bg-gray-200 rounded ${
            editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="Danh sách có số (Ctrl+Shift+7)"
        >
          <ListOrdered size={18} />
        </button>

        {/* Divider */}
        <div className="w-px bg-gray-300" />

        {/* Media & Links */}
        <button
          onClick={() => setShowImageDialog(true)}
          className="p-2 hover:bg-gray-200 rounded"
          title="Chèn hình ảnh"
        >
          <Image size={18} />
        </button>
        <button
          onClick={handleAddLink}
          className={`p-2 hover:bg-gray-200 rounded ${
            editor.isActive('link') ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="Chèn liên kết (Ctrl+K)"
        >
          <LinkIcon size={18} />
        </button>

        {/* Divider */}
        <div className="w-px bg-gray-300" />

        {/* Clear Formatting */}
        <button
          onClick={() => editor.chain().focus().clearNodes().run()}
          className="p-2 hover:bg-gray-200 rounded text-xs"
          title="Xóa định dạng"
        >
          Clear
        </button>
      </div>

      <ImageUploadDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onImageSelect={handleImageSelect}
      />
    </>
  );
}
