/**
 * File: components/DocumentUploadModal.tsx
 * Mục đích: Modal upload tài liệu mới
 * Vai trò:
 *   - Form upload với title, description, file selection
 *   - Validation và progress tracking
 *   - Integration với Redux store
 * Lưu ý:
 *   - Sử dụng FileUploader component có sẵn
 *   - Dialog từ shadcn/ui
 *   - Handle file validation và upload progress
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { FileUploader } from './FileUploader';
import { uploadDocumentAsync, setShowUploadModal } from '../store/slices/documentsSlice';

export const DocumentUploadModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showUploadModal, uploading, uploadProgress, error } = useSelector(
    (state: RootState) => state.documents
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const handleClose = () => {
    if (!uploading) {
      dispatch(setShowUploadModal(false));
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFiles([]);
      setFormErrors({});
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!title.trim()) {
      errors.title = 'Tiêu đề không được để trống';
    }

    if (selectedFiles.length === 0) {
      errors.file = 'Vui lòng chọn file để upload';
    } else if (selectedFiles.length > 1) {
      errors.file = 'Chỉ được upload 1 file tại một thời điểm';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const file = selectedFiles[0];
    const uploadData = {
      title: title.trim(),
      description: description.trim() || undefined,
      file,
    };

    try {
      await dispatch(uploadDocumentAsync(uploadData)).unwrap();
      handleClose();
    } catch (error) {
      // Error is handled by Redux
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    if (formErrors.file) {
      setFormErrors(prev => ({ ...prev, file: '' }));
    }
  };

  return (
    <Modal
      isOpen={showUploadModal}
      onClose={handleClose}
      title="Upload Tài Liệu Mới"
      size="xl"
    >

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (formErrors.title) {
                  setFormErrors(prev => ({ ...prev, title: '' }));
                }
              }}
              placeholder="Nhập tiêu đề tài liệu"
              disabled={uploading}
            />
            {formErrors.title && (
              <p className="text-sm text-red-600">{formErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn gọn về tài liệu (không bắt buộc)"
              rows={3}
              disabled={uploading}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>File tài liệu *</Label>
            <FileUploader
              onFilesSelected={handleFilesSelected}
              maxFiles={1}
              multiple={false}
            />
            {formErrors.file && (
              <p className="text-sm text-red-600">{formErrors.file}</p>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Đang upload...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={uploading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={uploading || selectedFiles.length === 0}
              >
                {uploading ? 'Đang upload...' : 'Upload'}
              </Button>
            </div>
          </form>
    </Modal>
  );
};