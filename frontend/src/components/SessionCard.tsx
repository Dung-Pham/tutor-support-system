/**
 * File: components/SessionCard.tsx
 * Purpose: Display session/schedule information in a card format
 * Usage: Used in ScheduleCalendar and session lists
 * 
 * Schema: Schedule is weekly recurring template with day_of_week, start_time, end_time
 * SessionInstance is a specific occurrence on a date
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Clock, User, Calendar } from 'lucide-react';
import type { Schedule, SessionInstance } from '../types/session';

const DAY_NAMES_VN = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

interface SessionCardProps {
  session: Schedule | SessionInstance;
  onClick?: () => void;
  isToday?: boolean;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onClick, isToday }) => {
  // Determine display information
  const className = session.class_name || 'Lớp chưa xác định';
  const subject = session.subject_name || 'Môn học chưa xác định';
  const tutorName = session.tutor_name || 'Gia sư chưa xác định';
  
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

  // Format time range from start_time and end_time (HH:mm:ss format)
  const formatTimeRange = () => {
    if (session.start_time && session.end_time) {
      const startTime = formatTime(session.start_time);
      const endTime = formatTime(session.end_time);
      return `${startTime} - ${endTime}`;
    }
    return formatTime(session.start_time) || 'Chưa xác định';
  };

  // Get day name
  const getDayName = () => {
    if (session.day_of_week !== undefined) {
      return DAY_NAMES_VN[session.day_of_week];
    }
    return '';
  };

  // Get session date if available (for SessionInstance)
  const getSessionDate = () => {
    if ('session_date' in session && session.session_date) {
      return new Date(session.session_date).toLocaleDateString('vi-VN');
    }
    return null;
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isToday ? 'border-2 border-blue-500 bg-blue-50' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold truncate">
          {className}
        </CardTitle>
        <div className="text-sm text-gray-600 font-medium">
          {subject}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Day of week or specific date */}
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="mr-2 h-4 w-4" />
          <span>{getSessionDate() || getDayName()}</span>
        </div>
        {/* Time range */}
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="mr-2 h-4 w-4" />
          <span>{formatTimeRange()}</span>
        </div>
        {/* Tutor */}
        <div className="flex items-center text-sm text-gray-600">
          <User className="mr-2 h-4 w-4" />
          <span className="font-medium">{tutorName}</span>
        </div>
        {/* Status indicator for inactive schedules */}
        {session.is_active === false && (
          <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
            Tạm ngưng
          </div>
        )}
      </CardContent>
    </Card>
  );
};
