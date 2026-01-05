import { forwardRef, useRef, useState, useCallback } from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { Button, type ButtonProps } from '@/components/tiptap-ui-primitive/button';
import axios from 'axios';

interface FileUploadButtonProps extends Omit<ButtonProps, 'type' | 'onError'> {
  text?: string;
  maxSize?: number; // in MB
  onUploadError?: (error: Error) => void;
  onSuccess?: (files: UploadedFile[]) => void;
}

interface UploadedFile {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

const FileIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦';
  if (mimeType.includes('text')) return '📃';
  return '📎';
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const FileUploadButton = forwardRef<HTMLButtonElement, FileUploadButtonProps>(
  ({ text, maxSize = 25, onUploadError, onSuccess, disabled, ...buttonProps }, ref) => {
    const { editor } = useCurrentEditor();
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleClick = useCallback(() => {
      inputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !editor) return;

        const fileArray = Array.from(files).slice(0, 5);

        // Check file sizes
        const maxSizeBytes = maxSize * 1024 * 1024;
        const validFiles = fileArray.filter((file) => {
          if (file.size > maxSizeBytes) {
            onUploadError?.(new Error(`File "${file.name}" vượt quá ${maxSize}MB`));
            return false;
          }
          return true;
        });

        if (validFiles.length === 0) return;

        setUploading(true);
        setProgress(0);

        try {
          const token = localStorage.getItem('token');
          const formData = new FormData();
          validFiles.forEach((file) => {
            formData.append('files', file);
          });

          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/upload-cloudinary/files?type=post`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
              onUploadProgress: (progressEvent) => {
                const percent = Math.round(
                  (progressEvent.loaded * 100) / (progressEvent.total || 100)
                );
                setProgress(percent);
              },
            }
          );

          const uploadedFiles: UploadedFile[] = response.data.data;

          // Insert file links into editor
          uploadedFiles.forEach((file) => {
            const icon = getFileIcon(file.mimeType);
            const size = formatFileSize(file.fileSize);

            editor
              .chain()
              .focus()
              .insertContent({
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: `${icon} `,
                  },
                  {
                    type: 'text',
                    marks: [
                      {
                        type: 'link',
                        attrs: {
                          href: file.url,
                          target: '_blank',
                          // Store filename in data attribute for proper download
                          'data-filename': file.fileName,
                        },
                      },
                    ],
                    text: file.fileName,
                  },
                  {
                    type: 'text',
                    text: ` (${size})`,
                  },
                ],
              })
              .run();
          });

          onSuccess?.(uploadedFiles);
        } catch (error) {
          console.error('File upload failed:', error);
          onUploadError?.(error instanceof Error ? error : new Error('Upload thất bại'));
        } finally {
          setUploading(false);
          setProgress(0);
          if (inputRef.current) {
            inputRef.current.value = '';
          }
        }
      },
      [editor, maxSize, onUploadError, onSuccess]
    );

    if (!editor) {
      return null;
    }

    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading || disabled}
        />
        <Button
          ref={ref}
          type="button"
          data-style="ghost"
          data-disabled={uploading || disabled}
          onClick={handleClick}
          disabled={uploading || disabled}
          title={
            uploading ? `Đang tải lên... ${progress}%` : `Đính kèm tài liệu (tối đa ${maxSize}MB)`
          }
          {...buttonProps}
        >
          {uploading ? (
            <span className="tiptap-button-icon text-xs">{progress}%</span>
          ) : (
            <FileIcon className="tiptap-button-icon" />
          )}
          {text && <span className="tiptap-button-text">{text}</span>}
        </Button>
      </>
    );
  }
);

FileUploadButton.displayName = 'FileUploadButton';
