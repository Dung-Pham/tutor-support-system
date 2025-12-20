/**
 * File: components/AttendanceWidget.tsx
 * Purpose: Attendance confirmation widget for session detail page
 * Usage: Two-way confirmation (student + tutor) for attendance
 * Schema: Uses tutor_confirmed, student_confirmed boolean flags
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { AttendanceRecord } from '../types/attendance';

// Status configuration
const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-green-100 text-green-800' },
  ABSENT: { label: 'Vắng mặt', color: 'bg-red-100 text-red-800' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-800' },
};

interface AttendanceWidgetProps {
  attendance: AttendanceRecord | null;
  userRole: 'student' | 'tutor';
  onConfirm: (notes: string) => Promise<void>;
  loading?: boolean;
}

export const AttendanceWidget: React.FC<AttendanceWidgetProps> = ({
  attendance,
  userRole,
  onConfirm,
  loading,
}) => {
  const [notes, setNotes] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  if (!attendance) {
    return (
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>Chưa có thông tin điểm danh cho buổi học này.</AlertDescription>
      </Alert>
    );
  }

  const status = attendance.overall_status;
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  // Check if current user can confirm
  const canConfirm =
    (userRole === 'student' && !attendance.student_confirmed) ||
    (userRole === 'tutor' && !attendance.tutor_confirmed);

  const isFullyConfirmed = attendance.tutor_confirmed && attendance.student_confirmed;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(notes);
      setNotes('');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Điểm danh</h3>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      <div className="space-y-2">
        {/* Student confirmation status */}
        <div className="flex items-center space-x-2">
          {attendance.student_confirmed ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-300" />
          )}
          <span className="text-sm">
            Học viên đã xác nhận{' '}
            {attendance.student_confirmed_at &&
              `(${new Date(attendance.student_confirmed_at).toLocaleString('vi-VN')})`}
          </span>
        </div>
        {attendance.student_notes && (
          <p className="ml-7 text-sm text-gray-600 italic">"{attendance.student_notes}"</p>
        )}

        {/* Tutor confirmation status */}
        <div className="flex items-center space-x-2">
          {attendance.tutor_confirmed ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-300" />
          )}
          <span className="text-sm">
            Gia sư đã xác nhận{' '}
            {attendance.tutor_confirmed_at &&
              `(${new Date(attendance.tutor_confirmed_at).toLocaleString('vi-VN')})`}
          </span>
        </div>
        {attendance.tutor_notes && (
          <p className="ml-7 text-sm text-gray-600 italic">"{attendance.tutor_notes}"</p>
        )}
      </div>

      {/* Confirmation form */}
      {canConfirm && status !== 'CANCELLED' && (
        <div className="space-y-2 border-t pt-4">
          <label className="text-sm font-medium">Ghi chú (tùy chọn)</label>
          <Textarea
            placeholder="Nhập ghi chú về buổi học..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleConfirm}
            disabled={loading || isConfirming}
            className="w-full"
          >
            {isConfirming ? 'Đang xác nhận...' : 'Xác nhận có mặt'}
          </Button>
        </div>
      )}

      {isFullyConfirmed && (
        <Alert className="bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Buổi học đã được xác nhận bởi cả hai bên.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
