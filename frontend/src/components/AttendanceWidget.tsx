/**
 * File: components/AttendanceWidget.tsx
 * Purpose: Attendance confirmation widget for session detail page
 * Usage: Two-way confirmation (user + tutor) for attendance
 * Dependencies: shadcn/ui Button, Alert, Textarea components
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';
import { ATTENDANCE_STATUS_LABELS, ATTENDANCE_STATUS_COLORS } from '../utils/constants';
import type { AttendanceRecord } from '../types/attendance';

interface AttendanceWidgetProps {
  attendance: AttendanceRecord | null;
  userRole: 'user' | 'tutor';
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
        <AlertDescription>Chưa có thông tin điểm danh cho buổi học này.</AlertDescription>
      </Alert>
    );
  }

  const status = attendance.status;
  const statusLabel = ATTENDANCE_STATUS_LABELS[status] || status;
  const statusColor = ATTENDANCE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

  const canConfirm =
    (userRole === 'user' && !attendance.confirmed_by_user_at) ||
    (userRole === 'tutor' && !attendance.confirmed_by_tutor_at);

  const isFullyConfirmed = status === 'confirmed';

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
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          {attendance.confirmed_by_user_at ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-300" />
          )}
          <span className="text-sm">
            Học viên/Phụ huynh đã xác nhận{' '}
            {attendance.confirmed_by_user_at &&
              `(${new Date(attendance.confirmed_by_user_at).toLocaleString('vi-VN')})`}
          </span>
        </div>
        {attendance.user_notes && (
          <p className="ml-7 text-sm text-gray-600 italic">"{attendance.user_notes}"</p>
        )}

        <div className="flex items-center space-x-2">
          {attendance.confirmed_by_tutor_at ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-300" />
          )}
          <span className="text-sm">
            Gia sư đã xác nhận{' '}
            {attendance.confirmed_by_tutor_at &&
              `(${new Date(attendance.confirmed_by_tutor_at).toLocaleString('vi-VN')})`}
          </span>
        </div>
        {attendance.tutor_notes && (
          <p className="ml-7 text-sm text-gray-600 italic">"{attendance.tutor_notes}"</p>
        )}
      </div>

      {canConfirm && !isFullyConfirmed && (
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
