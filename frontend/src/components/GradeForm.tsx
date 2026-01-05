/**
 * File: components/GradeForm.tsx
 * Purpose: Form for tutors to grade student submissions
 * Usage: Enter score and feedback
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import type { GradeSubmissionDTO } from '../types/submission';

interface GradeFormProps {
  maxScore?: number;
  existingScore?: number;
  existingFeedback?: string;
  studentName?: string;
  onSubmit: (data: GradeSubmissionDTO) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export const GradeForm: React.FC<GradeFormProps> = ({
  maxScore,
  existingScore,
  existingFeedback,
  studentName,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [score, setScore] = useState(existingScore?.toString() || '');
  const [feedback, setFeedback] = useState(existingFeedback || '');
  const [error, setError] = useState('');

  const validate = (): boolean => {
    if (!score.trim()) {
      setError('Vui lòng nhập điểm');
      return false;
    }

    const scoreNum = Number(score);
    if (isNaN(scoreNum)) {
      setError('Điểm phải là số');
      return false;
    }

    if (scoreNum < 0) {
      setError('Điểm không được âm');
      return false;
    }

    if (maxScore && scoreNum > maxScore) {
      setError(`Điểm không được vượt quá ${maxScore}`);
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: GradeSubmissionDTO = {
      score: Number(score),
      feedback: feedback.trim() || undefined,
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {studentName && (
        <div>
          <h3 className="text-lg font-semibold">Chấm bài cho: {studentName}</h3>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="score">
          Điểm * {maxScore && <span className="text-gray-500">(Tối đa: {maxScore})</span>}
        </Label>
        <Input
          id="score"
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder={maxScore ? `Nhập điểm (0-${maxScore})` : 'Nhập điểm'}
          min="0"
          max={maxScore}
          step="0.5"
          disabled={loading}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback">Nhận xét (tùy chọn)</Label>
        <Textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Viết nhận xét về bài làm của học viên..."
          rows={6}
          disabled={loading}
        />
        <p className="text-xs text-gray-500">
          Nhận xét sẽ được hiển thị cho học viên sau khi chấm điểm
        </p>
      </div>

      <div className="flex justify-end space-x-3 border-t pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : existingScore ? 'Cập nhật điểm' : 'Lưu điểm'}
        </Button>
      </div>
    </form>
  );
};
