/**
 * File: components/FileUploader.tsx
 * Purpose: Drag-and-drop file uploader component
 * Usage: Used for materials upload, assignment files, submission files
 * Dependencies: shadcn/ui Button, Progress components
 */

import React, { useCallback, useState } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, X, FileIcon } from 'lucide-react';
import { validateFile, formatFileSize, getFileIcon } from '../utils/fileHelper';
import { ALLOWED_FILE_TYPES } from '../utils/fileHelper';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  maxSize?: number;
  multiple?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  maxFiles = 5,
  allowedTypes = ALLOWED_FILE_TYPES.all,
  maxSize,
  multiple = true,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      const newErrors: string[] = [];
      const validFiles: File[] = [];

      fileArray.forEach((file) => {
        if (selectedFiles.length + validFiles.length >= maxFiles) {
          newErrors.push(`Chỉ được chọn tối đa ${maxFiles} file`);
          return;
        }

        const validation = validateFile(file, { allowedTypes, maxSize });
        if (!validation.valid) {
          newErrors.push(`${file.name}: ${validation.error}`);
        } else {
          validFiles.push(file);
        }
      });

      setErrors(newErrors);
      if (validFiles.length > 0) {
        const updatedFiles = [...selectedFiles, ...validFiles];
        setSelectedFiles(updatedFiles);
        onFilesSelected(updatedFiles);
      }
    },
    [selectedFiles, maxFiles, allowedTypes, maxSize, onFilesSelected]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const updatedFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(updatedFiles);
      onFilesSelected(updatedFiles);
    },
    [selectedFiles, onFilesSelected]
  );

  return (
    <div className="space-y-4">
      <div
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple={multiple}
          onChange={handleChange}
          accept={allowedTypes.join(',')}
        />
        <Upload className="mb-4 h-12 w-12 text-gray-400" />
        <p className="mb-2 text-sm text-gray-600">
          <label htmlFor="file-upload" className="cursor-pointer font-semibold text-blue-600 hover:text-blue-700">
            Chọn file
          </label>{' '}
          hoặc kéo thả vào đây
        </p>
        <p className="text-xs text-gray-500">
          Tối đa {maxFiles} file {maxSize && `• Kích thước tối đa ${formatFileSize(maxSize)}`}
        </p>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg bg-red-50 p-3">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              • {error}
            </p>
          ))}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">File đã chọn ({selectedFiles.length})</p>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border bg-white p-3"
            >
              <div className="flex items-center space-x-3">
                <FileIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
