/**
 * File: pages/SchedulePage.tsx
 * Purpose: Main schedule/calendar view page
 * Features: Week/month toggle, session list, navigation
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { fetchCalendarView } from '../store/slices/sessionsSlice';
import type { RootState, AppDispatch } from '../store';
import type { Session } from '../types/session';

export const SchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { sessions, loading, error } = useSelector((state: RootState) => state.sessions);
  const { user } = useSelector((state: RootState) => state.auth);

  const [viewType, setViewType] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (user?.user_id) {
      loadSchedule();
    }
  }, [user, viewType, currentDate]);

  const loadSchedule = () => {
    if (!user?.user_id) return;

    dispatch(
      fetchCalendarView({
        userId: user.user_id,
        userRole: user.role === 'TUTOR' ? 'tutor' : 'user',
        viewType,
        date: currentDate.toISOString().split('T')[0],
      })
    );
  };

  const handleSessionClick = (session: Session) => {
    const sessionId = session.session_id || session.schedule_id;
    if (sessionId) {
      navigate(`/sessions/${sessionId}`);
    }
  };

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lịch học</h1>
          <p className="mt-1 text-gray-600">
            Xem và quản lý lịch {user?.role === 'TUTOR' ? 'dạy' : 'học'} của bạn
          </p>
        </div>

        <Tabs value={viewType} onValueChange={(value) => setViewType(value as 'week' | 'month')}>
          <TabsList>
            <TabsTrigger value="week">Tuần</TabsTrigger>
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
        sessions={sessions}
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
