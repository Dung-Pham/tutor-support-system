/**
 * File: pages/SessionDetailPage.tsx
 * Purpose: Session/Schedule detail view with attendance confirmation
 * Features: Schedule info, attendance widget, notes
 * 
 * Schema: Schedule is weekly recurring template with day_of_week, start_time, end_time
 * URL params: scheduleId, optional ?date=YYYY-MM-DD for specific session
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AttendanceWidget } from '../components/AttendanceWidget';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Clock, Calendar as CalendarIcon, User, BookOpen } from 'lucide-react';
import { fetchScheduleById } from '../store/slices/sessionsSlice';
import { getOrCreateAttendance, confirmAttendance } from '../services/attendanceService';
import { DAY_OF_WEEK_LABELS, SCHEDULE_STATUS_LABELS, SCHEDULE_STATUS_COLORS } from '../utils/constants';
import type { RootState, AppDispatch } from '../store';
import type { AttendanceRecord } from '../types/attendance';

export const SessionDetailPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const sessionDate = searchParams.get('date'); // Optional specific date
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentSchedule, loading } = useSelector((state: RootState) => state.sessions);
  const { user } = useSelector((state: RootState) => state.auth);

  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    if (sessionId) {
      dispatch(fetchScheduleById(sessionId));
      loadAttendance();
    }
  }, [sessionId, sessionDate]);

  const loadAttendance = async () => {
    if (!sessionId) return;
    try {
      setLoadingAttendance(true);
      // Get attendance for specific date if provided
      const dateToUse = sessionDate || new Date().toISOString().split('T')[0];
      const response = await getOrCreateAttendance(sessionId, dateToUse);
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
      const userRole = user?.role === 'tutor' ? 'tutor' : 'student';
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

  // Format time string (handles Date objects, ISO strings, and HH:mm:ss format)
  const formatTime = (timeStr: string | Date | undefined): string => {
    if (!timeStr) return '--:--';
    
    // If it's a Date object, format it
    if (timeStr instanceof Date) {
      const hours = timeStr.getHours().toString().padStart(2, '0');
      const minutes = timeStr.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    // Handle ISO date string format: "1970-01-01T18:00:00.000Z" -> "18:00"
    if (timeStr.includes('T')) {
      const timePart = timeStr.split('T')[1];
      return timePart.slice(0, 5); // "18:00"
    }
    
    // Handle HH:mm:ss or HH:mm format
    return timeStr.slice(0, 5);
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

  if (!currentSchedule) {
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

  const isActive = currentSchedule.is_active !== false;
  const statusLabel = isActive ? SCHEDULE_STATUS_LABELS['true'] : SCHEDULE_STATUS_LABELS['false'];
  const statusColor = isActive ? SCHEDULE_STATUS_COLORS['true'] : SCHEDULE_STATUS_COLORS['false'];
  const dayName = DAY_OF_WEEK_LABELS[currentSchedule.day_of_week] || `Ngày ${currentSchedule.day_of_week}`;

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
                {currentSchedule.class_name || 'Buổi học'}
              </CardTitle>
            </div>
            <Badge className={statusColor}>{statusLabel}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Day of week */}
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Ngày học</p>
                <p className="text-sm text-gray-600">{dayName}</p>
                {sessionDate && (
                  <p className="text-xs text-blue-600">
                    {new Date(sessionDate).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Thời gian</p>
                <p className="text-sm text-gray-600">
                  {formatTime(currentSchedule.start_time)} - {formatTime(currentSchedule.end_time)}
                </p>
              </div>
            </div>

            {/* Tutor/Student info */}
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">
                  {user?.role === 'tutor' ? 'Học viên' : 'Gia sư'}
                </p>
                <p className="text-sm text-gray-600">
                  {user?.role === 'tutor' 
                    ? currentSchedule.student_name || 'Chưa có học viên'
                    : currentSchedule.tutor_name || 'Chưa có gia sư'}
                </p>
              </div>
            </div>

            {/* Subject info */}
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Môn học</p>
                <p className="text-sm text-gray-600">
                  {currentSchedule.subject_name || 'Chưa xác định'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AttendanceWidget
        attendance={attendance}
        userRole={user?.role === 'tutor' ? 'tutor' : 'student'}
        onConfirm={handleConfirmAttendance}
        loading={loadingAttendance}
      />
    </div>
  );
};

export default SessionDetailPage;
