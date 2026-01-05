/**
 * File: components/SubmissionForm.tsx
 * Purpose: Form for students to submit assignments
 * Usage: Upload files and submit assignment
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { FileUploader } from './FileUploader';
import { CheckCircle2 } from 'lucide-react';
import type { CreateSubmissionDTO } from '../types/submission';

interface SubmissionFormProps {
  assignmentTitle: string;
  dueDate: string;
  hasExistingSubmission?: boolean;
  onSubmit: (data: CreateSubmissionDTO) => Promise<void>;
  loading?: boolean;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({
  assignmentTitle,
  dueDate,
  hasExistingSubmission,
  onSubmit,
  loading,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');

  const isPastDue = new Date(dueDate) < new Date();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (files.length === 0) {
      setError('Vui lòng chọn ít nhất 1 file để nộp');
      return;
    }

    if (isPastDue && !hasExistingSubmission) {
      setError('Đã quá hạn nộp bài');
      return;
    }

    const data: CreateSubmissionDTO = {
      assignment_id: '', // Will be set by parent component
      submission_files: files,
      comments: comments.trim() || undefined,
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{assignmentTitle}</h3>
        <p className="text-sm text-gray-600">
          Hạn nộp: {new Date(dueDate).toLocaleString('vi-VN')}
          {isPastDue && <span className="ml-2 text-red-600 font-medium">(Đã quá hạn)</span>}
        </p>
      </div>

      {hasExistingSubmission && (
        <Alert className="bg-blue-50">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Bạn đã nộp bài trước đó. Nộp lại sẽ thay thế bài nộp cũ.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label>File nộp bài *</Label>
        <FileUploader
          onFilesSelected={setFiles}
          maxFiles={10}
          multiple={true}
        />
        <p className="text-xs text-gray-500">
          Có thể nộp nhiều file (hình ảnh, PDF, tài liệu). Tối đa 10 file.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Ghi chú (tùy chọn)</Label>
        <Textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Thêm ghi chú về bài làm của bạn..."
          rows={4}
          disabled={loading}
        />
      </div>

      {error && (
        <Alert className="bg-red-50">
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-3 border-t pt-4">
        <Button type="submit" disabled={loading || (isPastDue && !hasExistingSubmission)}>
          {loading ? 'Đang nộp bài...' : hasExistingSubmission ? 'Nộp lại bài' : 'Nộp bài'}
        </Button>
      </div>
    </form>
  );
};
