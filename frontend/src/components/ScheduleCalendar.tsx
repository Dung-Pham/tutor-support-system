/**
 * File: components/ScheduleCalendar.tsx
 * Purpose: Weekly/Monthly calendar view for sessions
 * Usage: Display schedule instances in calendar format with time slots
 * 
 * Schema: Schedule is weekly recurring template with day_of_week
 * SessionInstance is a specific occurrence on a date
 */

import React from 'react';
import { Card } from './ui/card';
import { Calendar } from 'lucide-react';
import { SessionCard } from './SessionCard';
import { WeekTimelineView } from './WeekTimelineView';
import { isToday, toLocalDateString } from '../utils/dateHelper';
import type { Schedule, SessionInstance, DayOfWeek } from '../types/session';

interface ScheduleCalendarProps {
  sessions: (Schedule | SessionInstance)[];
  viewType: 'week' | 'month' | 'timeline';
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onSessionClick: (session: Schedule | SessionInstance) => void;
  loading?: boolean;
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  sessions,
  viewType,
  currentDate,
  onDateChange,
  onSessionClick,
  loading,
}) => {
  const getWeekDays = (date: Date): Date[] => {
    const week = [];
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = viewType === 'week' || viewType === 'timeline' ? getWeekDays(new Date(currentDate)) : [];

  // Get sessions for a specific date
  // For Schedule templates: match by day_of_week
  // For SessionInstance: match by session_date
  const getSessionsForDate = (date: Date): (Schedule | SessionInstance)[] => {
    const dayOfWeek = date.getDay() as DayOfWeek;
    const dateString = toLocalDateString(date); // Use local date string, not ISO

    return sessions.filter((session) => {
      // Check if it's a SessionInstance (has session_date)
      if ('session_date' in session && session.session_date) {
        return session.session_date === dateString;
      }
      // Otherwise it's a Schedule template - match by day_of_week
      return session.day_of_week === dayOfWeek && session.is_active !== false;
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600">Đang tải lịch học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      {/* <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">
            {viewType === 'week' ? 'Lịch tuần' : viewType === 'timeline' ? 'Lịch tuần theo thời gian' : 'Lịch tháng'}
          </h2>
          <span className="text-lg text-gray-600">
            {currentDate.toLocaleDateString('vi-VN', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            <Calendar className="mr-2 h-4 w-4" />
            Hôm nay
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div> */}

      {/* Week View */}
      {viewType === 'week' && (
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const daySessions = getSessionsForDate(day);
            const isTodayDate = isToday(day.toISOString());

            return (
              <div key={index} className="space-y-2">
                <div
                  className={`rounded-lg p-2 text-center ${
                    isTodayDate ? 'bg-blue-600 text-white' : 'bg-gray-100'
                  }`}
                >
                  <div className="text-xs font-medium">
                    {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold ${isTodayDate ? '' : 'text-gray-900'}`}>
                    {day.getDate()}
                  </div>
                </div>
                <div className="space-y-2">
                  {daySessions.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-400">
                      Không có buổi học
                    </div>
                  ) : (
                    daySessions.map((session) => (
                      <SessionCard
                        key={session.schedule_id}
                        session={session}
                        onClick={() => onSessionClick(session)}
                        isToday={isTodayDate}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline View */}
      {viewType === 'timeline' && (
        <WeekTimelineView
          sessions={sessions}
          currentDate={currentDate}
          onDateChange={onDateChange}
          onSessionClick={onSessionClick}
          loading={loading}
        />
      )}

      {/* Month View - Grouped by class */}
      {viewType === 'month' && (
        <Card className="p-6">
          {sessions.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">Không có buổi học nào trong tháng này</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Group sessions by class_id */}
              {Object.entries(
                sessions.reduce((acc, session) => {
                  const classId = session.class_id;
                  if (!acc[classId]) {
                    acc[classId] = {
                      class_id: classId,
                      class_name: session.class_name || 'Lớp chưa xác định',
                      subject_name: session.subject_name || 'Môn học chưa xác định',
                      tutor_name: session.tutor_name || 'Gia sư chưa xác định',
                      sessions: []
                    };
                  }
                  acc[classId].sessions.push(session);
                  return acc;
                }, {} as Record<string, { class_id: string; class_name: string; subject_name: string; tutor_name: string; sessions: (Schedule | SessionInstance)[] }>)
              ).map(([classId, classInfo]) => (
                <div
                  key={classId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    // Click on first session of this class
                    if (classInfo.sessions.length > 0) {
                      onSessionClick(classInfo.sessions[0]);
                    }
                  }}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-gray-900">
                      {classInfo.class_name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {classInfo.subject_name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {classInfo.tutor_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {classInfo.sessions.length} buổi/tuần
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
