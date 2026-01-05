/**
 * File: components/WeekTimelineView.tsx
 * Purpose: Weekly timeline view for sessions with time slots
 * Usage: Display sessions in a timeline format with hourly slots from 00:00 to 23:00
 * 
 * Schema: Schedule is weekly recurring template with day_of_week, start_time, end_time
 * SessionInstance is a specific occurrence on a date
 */

import React from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { isToday, toLocalDateString } from '../utils/dateHelper';
import type { Schedule, SessionInstance, DayOfWeek } from '../types/session';

interface WeekTimelineViewProps {
  sessions: (Schedule | SessionInstance)[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onSessionClick: (session: Schedule | SessionInstance) => void;
  loading?: boolean;
}

export const WeekTimelineView: React.FC<WeekTimelineViewProps> = ({
  sessions,
  currentDate,
  onDateChange,
  onSessionClick,
  loading,
}) => {
  const getWeekDays = (date: Date): Date[] => {
    const week = [];
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    current.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(current);
      d.setDate(current.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const weekDays = getWeekDays(new Date(currentDate));

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Generate time slots from 6:00 to 23:00 (6 AM to 11 PM)
  const timeSlots = [];
  for (let hour = 6; hour <= 23; hour++) {
    timeSlots.push(hour);
  }

  // Parse time string to hour number
  // Handles both "HH:mm:ss" format and ISO date "1970-01-01T18:00:00.000Z" format
  // Also handles Date objects
  // NOTE: SQL Server TIME is stored as UTC in ISO format, but represents local time
  const parseTimeToHour = (timeStr: string | Date): number => {
    if (!timeStr) return 0;
    
    // If it's a Date object, get hours directly
    if (timeStr instanceof Date) {
      return timeStr.getHours();
    }
    
    // Check if it's an ISO date string (contains 'T')
    if (timeStr.includes('T')) {
      // Extract time part after 'T' and before 'Z' or '.'
      // e.g., "1970-01-01T18:00:00.000Z" -> "18:00:00"
      const timePart = timeStr.split('T')[1];
      const hours = parseInt(timePart.split(':')[0], 10);
      return hours;
    }
    
    // Otherwise parse as HH:mm:ss
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10);
  };

  // Parse time string to minutes offset within hour
  const parseTimeToMinutes = (timeStr: string | Date): number => {
    if (!timeStr) return 0;
    
    // If it's a Date object, get minutes directly
    if (timeStr instanceof Date) {
      return timeStr.getMinutes();
    }
    
    // Check if it's an ISO date string (contains 'T')
    if (timeStr.includes('T')) {
      const timePart = timeStr.split('T')[1];
      const minutes = parseInt(timePart.split(':')[1], 10);
      return minutes;
    }
    
    // Otherwise parse as HH:mm:ss
    const parts = timeStr.split(':');
    return parseInt(parts[1] || '0', 10);
  };

  // Get sessions for a specific date and hour
  const getSessionsForDateAndHour = (date: Date, hour: number): (Schedule | SessionInstance)[] => {
    const dayOfWeek = date.getDay() as DayOfWeek;
    // Use local date format to avoid timezone issues
    const dateString = toLocalDateString(date); // YYYY-MM-DD in local timezone

    return sessions.filter((session) => {
      // Check if session is on this day
      const isOnThisDay =
        ('session_date' in session && session.session_date === dateString) ||
        (session.day_of_week === dayOfWeek && session.is_active !== false);

      if (!isOnThisDay) return false;

      // Check if session spans this hour
      const startHour = parseTimeToHour(session.start_time);
      const endHour = parseTimeToHour(session.end_time);
      const endMinutes = parseTimeToMinutes(session.end_time);
      
      // Session spans this hour if:
      // - startHour <= hour AND (endHour > hour OR (endHour == hour AND endMinutes > 0))
      const endsAfterHour = endHour > hour || (endHour === hour && endMinutes > 0);
      return startHour <= hour && endsAfterHour;
    });
  };

  // Calculate height for session display (includes minutes for fractional hours)
  const calculateSessionHeight = (session: Schedule | SessionInstance, currentHour: number): number => {
    const startHour = parseTimeToHour(session.start_time);
    const startMinutes = parseTimeToMinutes(session.start_time);
    const endHour = parseTimeToHour(session.end_time);
    const endMinutes = parseTimeToMinutes(session.end_time);

    // Only render in the starting hour
    if (startHour === currentHour) {
      // Calculate total duration in minutes, then convert to pixels (1px per minute)
      const totalMinutes = (endHour - startHour) * 60 + (endMinutes - startMinutes);
      return totalMinutes; // 1px per minute, 60px per hour
    }
    return 0;
  };

  // Calculate top offset for session display
  const calculateSessionTop = (session: Schedule | SessionInstance, currentHour: number): number => {
    const startHour = parseTimeToHour(session.start_time);

    if (startHour === currentHour) {
      const minutes = parseTimeToMinutes(session.start_time);
      return minutes; // 1px per minute
    }
    return 0;
  };

  // Format time for display (handles Date objects, ISO strings, and HH:mm:ss format)
  const formatTime = (timeStr: string | Date): string => {
    if (!timeStr) return '';
    
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

  // Format time range for display
  const formatTimeRange = (session: Schedule | SessionInstance): string => {
    return `${formatTime(session.start_time)} - ${formatTime(session.end_time)}`;
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
          <h2 className="text-2xl font-bold">Lịch tuần theo thời gian</h2>
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

      {/* Timeline Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] grid grid-cols-8">
          {/* Header with days */}
          <div className="p-2 font-semibold text-center">Giờ</div>
          {weekDays.map((day, index) => {
            const isTodayDate = isToday(day.toISOString());
            return (
              <div
                key={index}
                className={`p-2 text-center border-l ${isTodayDate ? 'bg-blue-100 font-bold' : ''}`}
              >
                <div className="text-xs">
                  {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold">
                  {day.getDate()}
                </div>
              </div>
            );
          })}

          {/* Time slots */}
          {timeSlots.map((hour) => (
            <React.Fragment key={hour}>
              {/* Time column */}
              <div className="p-2 text-center text-sm font-medium border-r bg-gray-50 border-t">
                {hour.toString().padStart(2, '0')}:00
              </div>

              {/* Day columns */}
              {weekDays.map((day, dayIndex) => {
                const daySessions = getSessionsForDateAndHour(day, hour);

                return (
                  <div
                    key={dayIndex}
                    className="relative border-l border-t p-1 min-h-[60px] bg-white"
                  >
                    {daySessions.map((session) => {
                      const height = calculateSessionHeight(session, hour);
                      const top = calculateSessionTop(session, hour);
                      const isCompleted = !session.is_active;

                      // Only render if height > 0 (i.e., this is the starting hour)
                      if (height > 0) {
                        return (
                          <div
                            key={session.schedule_id}
                            className={`absolute left-1 right-1 rounded p-2 cursor-pointer transition-colors shadow-lg ${
                              isCompleted
                                ? 'bg-gray-400 text-white hover:bg-gray-500'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              zIndex: 50, // High z-index to ensure sessions appear above everything
                            }}
                            onClick={() => onSessionClick(session)}
                          >
                            <div className="text-xs font-semibold truncate">
                              {session.class_name || 'Lớp chưa xác định'}
                              {isCompleted && ' (Tạm dừng)'}
                            </div>
                            <div className="text-xs opacity-90 truncate">
                              {session.tutor_name || 'Gia sư chưa xác định'}
                            </div>
                            <div className="text-xs opacity-75 truncate">
                              {formatTimeRange(session)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};