/**
 * File: components/tutor/TutorHeader.tsx
 * Mục đích: Header cho tutor với logo, notifications, user profile
 */

import { Bell, Menu } from 'lucide-react';
import { UserProfileDropdown } from '../student/UserProfileDropdown';
import { useState } from 'react';

export function TutorHeader() {
  const [notificationCount] = useState(3); // Mock notification count

  return (
    <header
      className="flex items-center justify-between h-16 px-6 border-b sticky top-0 z-50"
      style={{
        backgroundColor: 'hsl(var(--background))',
        borderColor: 'hsl(var(--border))',
      }}
    >
      {/* Left: Logo/Brand */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg font-bold text-white"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          TT
        </div>
        <span
          className="text-lg font-semibold hidden sm:inline"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          Tutor System
        </span>
      </div>

      {/* Right: Notifications + Menu */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button className="md:hidden p-2 hover:bg-secondary rounded-lg transition-all">
          <Menu className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} />
        </button>

        {/* Notification bell */}
        <button className="relative p-2 hover:bg-secondary rounded-lg transition-all">
          <Bell className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} />
          {notificationCount > 0 && (
            <span
              className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* User profile dropdown */}
        <UserProfileDropdown />
      </div>
    </header>
  );
}
