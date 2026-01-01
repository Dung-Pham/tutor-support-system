import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfileDropdown } from '../student/UserProfileDropdown';
import { useState } from 'react';

interface TutorHeaderProps {
  onMenuClick?: () => void;
}

export function TutorHeader({ onMenuClick }: TutorHeaderProps) {
  const [notificationCount] = useState(3); // Mock notification count

  return (
    <header
      className="flex items-center justify-between h-14 md:h-16 px-4 md:px-6 border-b sticky top-0 z-50"
      style={{
        backgroundColor: 'hsl(var(--background))',
        borderColor: 'hsl(var(--border))',
      }}
    >
      {/* Left: Mobile Menu + Logo/Brand */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9 touch-manipulation"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} />
        </Button>

        <div
          className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg font-bold text-white flex-shrink-0"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          TT
        </div>
        <span
          className="text-base md:text-lg font-semibold hidden sm:inline truncate"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          Tutor System
        </span>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 md:h-10 md:w-10 touch-manipulation"
        >
          <Bell className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} />
          {notificationCount > 0 && (
            <span
              className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </Button>

        {/* User profile dropdown */}
        <UserProfileDropdown />
      </div>
    </header>
  );
}
