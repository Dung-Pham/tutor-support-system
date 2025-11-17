/**
 * File: components/AssignmentForm.tsx
 * Purpose: Form for creating/editing assignments (Tutor)
 * Usage: Create new assignment with file attachments
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { FileUploader } from './FileUploader';
import { Calendar } from 'lucide-react';
import { toDatetimeLocal, fromDatetimeLocal } from '../utils/dateHelper';
import type { CreateAssignmentDTO, Assignment } from '../types/assignment';

interface AssignmentFormProps {
  assignment?: Assignment;
  classId: string;
  onSubmit: (data: CreateAssignmentDTO) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  assignment,
  classId,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [formData, setFormData] = useState({
    title: assignment?.title || '',
    description: assignment?.description || '',
    due_date: assignment?.due_date ? toDatetimeLocal(assignment.due_date) : '',
    max_score: assignment?.max_score?.toString() || '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả không được để trống';
    }
    if (!formData.due_date) {
      newErrors.due_date = 'Hạn nộp không được để trống';
    }
    if (formData.max_score && isNaN(Number(formData.max_score))) {
      newErrors.max_score = 'Điểm tối đa phải là số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: CreateAssignmentDTO = {
      class_id: classId,
      title: formData.title.trim(),
      description: formData.description.trim(),
      due_date: fromDatetimeLocal(formData.due_date),
      max_score: formData.max_score ? Number(formData.max_score) : undefined,
      attachments: files.length > 0 ? files : undefined,
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Tiêu đề bài tập *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Nhập tiêu đề bài tập"
          disabled={loading}
        />
        {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả chi tiết *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Mô tả yêu cầu bài tập, nội dung cần làm..."
          rows={6}
          disabled={loading}
        />
        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="due_date">Hạn nộp *</Label>
          <div className="relative">
            <Input
              id="due_date"
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              disabled={loading}
            />
            <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          {errors.due_date && <p className="text-sm text-red-600">{errors.due_date}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_score">Điểm tối đa (tùy chọn)</Label>
          <Input
            id="max_score"
            type="number"
            value={formData.max_score}
            onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
            placeholder="Ví dụ: 10"
            min="0"
            step="0.5"
            disabled={loading}
          />
          {errors.max_score && <p className="text-sm text-red-600">{errors.max_score}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>File đính kèm (tùy chọn)</Label>
        <FileUploader
          onFilesSelected={setFiles}
          maxFiles={5}
          multiple={true}
        />
      </div>

      <div className="flex justify-end space-x-3 border-t pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : assignment ? 'Cập nhật' : 'Tạo bài tập'}
        </Button>
      </div>
    </form>
  );
};
