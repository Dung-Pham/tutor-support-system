/**
 * File: pages/SchedulePage.tsx
 * Purpose: Main schedule/calendar view page
 * Features: Week/month toggle, session list, navigation
 * 
 * Schema: Schedule is weekly recurring template with day_of_week, start_time, end_time
 * Uses fetchSessionsByWeek or fetchWeeklyTemplate to load data
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  fetchSessionsByWeek,
} from '../store/slices/sessionsSlice';
import type { RootState, AppDispatch } from '../store';
import type { Schedule, SessionInstance } from '../types/session';

export const SchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { schedules, sessionInstances, loading, error } = useSelector(
    (state: RootState) => state.sessions
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [viewType, setViewType] = useState<'week' | 'month' | 'timeline'>('timeline');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (user?.user_id) {
      loadSchedule();
    }
  }, [user, viewType, currentDate]);

  const loadSchedule = () => {
    if (!user?.user_id) return;

    // Get Monday of current week
    const weekStart = getWeekStart(currentDate);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    dispatch(
      fetchSessionsByWeek({
        weekStartDate: weekStartStr,
        userId: user.user_id,
        role: user.role === 'TUTOR' ? 'tutor' : 'student',
      })
    );
  };

  // Get Monday of the week containing the given date
  const getWeekStart = (date: Date): Date => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1);
    result.setDate(diff);
    return result;
  };

  const handleSessionClick = (session: Schedule | SessionInstance) => {
    const scheduleId = session.schedule_id;
    if (scheduleId) {
      // If it's a SessionInstance with a specific date, include the date in the URL
      const sessionDate = 'session_date' in session ? session.session_date : null;
      if (sessionDate) {
        navigate(`/sessions/${scheduleId}?date=${sessionDate}`);
      } else {
        navigate(`/sessions/${scheduleId}`);
      }
    }
  };

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  // Use sessionInstances if available, otherwise fall back to schedules
  const displaySessions = sessionInstances.length > 0 ? sessionInstances : schedules;

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lịch học</h1>
          <p className="mt-1 text-gray-600">
            Xem và quản lý lịch {user?.role === 'TUTOR' ? 'dạy' : 'học'} của bạn
          </p>
        </div>

        <Tabs value={viewType} onValueChange={(value) => setViewType(value as 'week' | 'month' | 'timeline')}>
          <TabsList>
            <TabsTrigger value="week">Tuần</TabsTrigger>
            <TabsTrigger value="timeline">Thời gian</TabsTrigger>
            <TabsTrigger value="month">Tháng</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">
          Có lỗi xảy ra: {error}. <Button variant="link" onClick={loadSchedule}>Thử lại</Button>
        </div>
      )}

      <ScheduleCalendar
        sessions={displaySessions}
        viewType={viewType}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onSessionClick={handleSessionClick}
        loading={loading}
      />
    </div>
  );
};

export default SchedulePage;
