import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useEffect } from 'react';
import { EditorToolbar } from './EditorToolbar';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, disabled = false }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'leading-relaxed',
          },
        },
        heading: {
          HTMLAttributes: {
            class: 'font-bold',
          },
        },
        link: {
          HTMLAttributes: {
            class: 'text-primary underline cursor-pointer',
          },
          autolink: true,
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-2',
        },
      }),
    ],
    content: value || '',
    editable: !disabled,
    onCreate: ({ editor: currentEditor }) => {
      if (!value && currentEditor.isEmpty) {
        currentEditor.commands.setContent('');
      }
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  // Update content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full border rounded-lg bg-white overflow-hidden">
      <EditorToolbar editor={editor} />

      {/* Editor Content */}
      <div className="border-t">
        <EditorContent
          editor={editor}
          className={`prose max-w-none p-4 focus:outline-none min-h-[300px] text-base ${
            disabled ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        />
      </div>

      {/* Character Count */}
      <div className="bg-gray-50 border-t px-4 py-2 text-xs text-gray-500">
        {editor.storage.characterCount?.characters() || 0} ký tự
      </div>
    </div>
  );
}
