/**
 * File: components/SessionCard.tsx
 * Purpose: Display session information in a card format
 * Usage: Used in ScheduleCalendar and session lists
 * Dependencies: shadcn/ui Card, Badge components
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, MapPin, User } from 'lucide-react';
import { formatDate } from '../utils/dateHelper';
import { SESSION_STATUS_LABELS, SESSION_STATUS_COLORS } from '../utils/constants';
import type { Session } from '../types/session';

interface SessionCardProps {
  session: Session;
  onClick?: () => void;
  isToday?: boolean;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onClick, isToday }) => {
  const startDate = session.scheduled_at || session.start_date || '';
  const statusColor = SESSION_STATUS_COLORS[session.status] || 'bg-gray-100 text-gray-800';
  const statusLabel = SESSION_STATUS_LABELS[session.status] || session.status;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isToday ? 'border-2 border-blue-500 bg-blue-50' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">
            {session.title || session.subject}
          </CardTitle>
          <Badge className={statusColor}>{statusLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="mr-2 h-4 w-4" />
          <span>
            {formatDate(startDate, 'datetime')} ({session.duration} phút)
          </span>
        </div>
        {session.location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{session.location}</span>
          </div>
        )}
        {session.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{session.description}</p>
        )}
      </CardContent>
    </Card>
  );
};
