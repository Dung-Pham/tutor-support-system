/**
 * File: pages/SessionDetailPage.tsx
 * Purpose: Session detail view with attendance confirmation
 * Features: Session info, attendance widget, notes, materials
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AttendanceWidget } from '../components/AttendanceWidget';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Clock, MapPin, Video, Calendar as CalendarIcon } from 'lucide-react';
import { fetchSessionById } from '../store/slices/sessionsSlice';
import { getOrCreateAttendance, confirmAttendance } from '../services/attendanceService';
import { formatDate } from '../utils/dateHelper';
import { SESSION_STATUS_LABELS, SESSION_STATUS_COLORS } from '../utils/constants';
import type { RootState, AppDispatch } from '../store';
import type { AttendanceRecord } from '../types/attendance';

export const SessionDetailPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentSession, loading } = useSelector((state: RootState) => state.sessions);
  const { user } = useSelector((state: RootState) => state.auth);

  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    if (sessionId) {
      dispatch(fetchSessionById(sessionId));
      loadAttendance();
    }
  }, [sessionId]);

  const loadAttendance = async () => {
    if (!sessionId) return;
    try {
      setLoadingAttendance(true);
      const response = await getOrCreateAttendance(sessionId);
      setAttendance(response.data);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleConfirmAttendance = async (notes: string) => {
    if (!attendance) return;

    try {
      const userRole = user?.role === 'TUTOR' ? 'tutor' : 'user';
      const response = await confirmAttendance(attendance.attendance_id, {
        confirmedBy: userRole,
        notes,
      });
      setAttendance(response.data);
    } catch (error) {
      console.error('Failed to confirm attendance:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600">Đang tải thông tin buổi học...</p>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy buổi học</p>
          <Button className="mt-4" onClick={() => navigate('/schedule')}>
            Về trang lịch học
          </Button>
        </div>
      </div>
    );
  }

  const startDate = currentSession.scheduled_at || currentSession.start_date || '';
  const statusColor = SESSION_STATUS_COLORS[currentSession.status] || 'bg-gray-100 text-gray-800';
  const statusLabel = SESSION_STATUS_LABELS[currentSession.status] || currentSession.status;

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/schedule')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại lịch học
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {currentSession.title || currentSession.subject}
              </CardTitle>
              <p className="mt-2 text-gray-600">{currentSession.description}</p>
            </div>
            <Badge className={statusColor}>{statusLabel}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Ngày học</p>
                <p className="text-sm text-gray-600">{formatDate(startDate, 'long')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Thời gian</p>
                <p className="text-sm text-gray-600">
                  {formatDate(startDate, 'time')} ({currentSession.duration} phút)
                </p>
              </div>
            </div>

            {currentSession.location && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Địa điểm</p>
                  <p className="text-sm text-gray-600">{currentSession.location}</p>
                </div>
              </div>
            )}

            {currentSession.meeting_link && (
              <div className="flex items-center space-x-3">
                <Video className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Link học online</p>
                  <a
                    href={currentSession.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Tham gia buổi học
                  </a>
                </div>
              </div>
            )}
          </div>

          {currentSession.notes && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium">Ghi chú</p>
              <p className="mt-1 text-sm text-gray-600">{currentSession.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AttendanceWidget
        attendance={attendance}
        userRole={user?.role === 'TUTOR' ? 'tutor' : 'user'}
        onConfirm={handleConfirmAttendance}
        loading={loadingAttendance}
      />
    </div>
  );
};

export default SessionDetailPage;
