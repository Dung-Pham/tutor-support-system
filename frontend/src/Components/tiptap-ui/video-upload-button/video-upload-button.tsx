import { forwardRef, useRef, useState, useCallback } from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { Button, type ButtonProps } from '@/components/tiptap-ui-primitive/button';
import axios from 'axios';

interface VideoUploadButtonProps extends Omit<ButtonProps, 'type' | 'onError'> {
  text?: string;
  maxSize?: number; // in MB
  onUploadError?: (error: Error) => void;
  onSuccess?: (url: string) => void;
}

const VideoIcon = ({ className }: { className?: string }) => (
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
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </svg>
);

export const VideoUploadButton = forwardRef<HTMLButtonElement, VideoUploadButtonProps>(
  ({ text, maxSize = 100, onUploadError, onSuccess, disabled, ...buttonProps }, ref) => {
    const { editor } = useCurrentEditor();
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleClick = useCallback(() => {
      inputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;

        // Check file size
        const maxSizeBytes = maxSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
          onUploadError?.(new Error(`Video không được vượt quá ${maxSize}MB`));
          return;
        }

        // Check file type
        if (!file.type.startsWith('video/')) {
          onUploadError?.(new Error('Chỉ chấp nhận file video'));
          return;
        }

        setUploading(true);
        setProgress(0);

        try {
          const token = localStorage.getItem('token');
          const formData = new FormData();
          formData.append('video', file);

          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/upload-cloudinary/video?type=post`,
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

          const videoUrl = response.data.data.url;

          // Insert video into editor
          editor.chain().focus().setVideo({ src: videoUrl }).run();

          onSuccess?.(videoUrl);
        } catch (error) {
          console.error('Video upload failed:', error);
          onUploadError?.(error instanceof Error ? error : new Error('Upload thất bại'));
        } finally {
          setUploading(false);
          setProgress(0);
          // Reset input
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
          accept="video/*"
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
          title={uploading ? `Đang tải lên... ${progress}%` : `Thêm video (tối đa ${maxSize}MB)`}
          {...buttonProps}
        >
          {uploading ? (
            <span className="tiptap-button-icon text-xs">{progress}%</span>
          ) : (
            <VideoIcon className="tiptap-button-icon" />
          )}
          {text && <span className="tiptap-button-text">{text}</span>}
        </Button>
      </>
    );
  }
);

VideoUploadButton.displayName = 'VideoUploadButton';
