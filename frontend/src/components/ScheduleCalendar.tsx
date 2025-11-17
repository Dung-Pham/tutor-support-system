/**
 * File: components/ScheduleCalendar.tsx
 * Purpose: Weekly/Monthly calendar view for sessions
 * Usage: Display sessions in calendar format with time slots
 */

import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { SessionCard } from './SessionCard';
import { formatDate, isToday } from '../utils/dateHelper';
import type { Session } from '../types/session';

interface ScheduleCalendarProps {
  sessions: Session[];
  viewType: 'week' | 'month';
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onSessionClick: (session: Session) => void;
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

  const weekDays = viewType === 'week' ? getWeekDays(new Date(currentDate)) : [];

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getSessionsForDate = (date: Date): Session[] => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.scheduled_at || session.start_date || '');
      return sessionDate.toDateString() === date.toDateString();
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">
            {viewType === 'week' ? 'Lịch tuần' : 'Lịch tháng'}
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
      </div>

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
                        key={session.session_id || session.schedule_id}
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

      {/* Month View - Simple list grouped by date */}
      {viewType === 'month' && (
        <Card className="p-6">
          {sessions.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">Không có buổi học nào trong tháng này</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <SessionCard
                  key={session.session_id || session.schedule_id}
                  session={session}
                  onClick={() => onSessionClick(session)}
                  isToday={isToday(session.scheduled_at || session.start_date || '')}
                />
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
