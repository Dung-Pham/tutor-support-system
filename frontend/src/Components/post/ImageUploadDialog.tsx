import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X } from 'lucide-react';
import { useUploadThing } from '@/config/uploadthing';

interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (url: string) => void;
}

export function ImageUploadDialog({ isOpen, onClose, onImageSelect }: ImageUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState<string>('');

  const { startUpload, isUploading } = useUploadThing('imageUploader');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (4MB)
    if (file.size > 4 * 1024 * 1024) {
      setError('Ảnh không được vượt quá 4MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn ảnh');
      return;
    }

    try {
      setError('');

      // /api/upload là public endpoint, không cần token
      const res = await startUpload([selectedFile]);

      if (res && res[0]) {
        const imageUrl = res[0].url;
        onImageSelect(imageUrl);

        // Reset state
        setSelectedFile(null);
        setPreview('');
        setError('');
        onClose();
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Lỗi upload ảnh. Vui lòng thử lại.');
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview('');
    setError('');
  };

  const resetDialog = () => {
    handleClear();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Ảnh</DialogTitle>
          <DialogDescription>Chọn ảnh để thêm vào bài viết (tối đa 4MB)</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* File Input */}
          <div className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-100 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="image-input"
              disabled={isUploading}
            />
            <label
              htmlFor="image-input"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <Upload className="h-10 w-10 text-blue-500" />
              <div>
                <span className="text-base font-medium text-gray-800 block">
                  {selectedFile ? (
                    <span className="truncate max-w-xs inline-block">{selectedFile.name}</span>
                  ) : (
                    'Chọn ảnh hoặc kéo thả'
                  )}
                </span>
                <span className="text-sm text-gray-600 block mt-1">
                  PNG, JPG, GIF, WebP - Tối đa 4MB
                </span>
              </div>
            </label>
          </div>

          {/* Preview */}
          {preview && (
            <div className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              <img src={preview} alt="Preview" className="w-full h-auto max-h-72 object-contain" />
              <button
                onClick={handleClear}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition"
                disabled={isUploading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded p-4 text-sm text-red-700">
              <strong>Lỗi:</strong> {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={resetDialog}
              disabled={isUploading}
              className="h-10 px-6"
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 gap-2 shadow-md"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang upload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
