// src/components/student/StudentHeader.tsx
import { Button } from '@/components/ui/button';
import { Menu, Bell, Settings } from 'lucide-react';
import { UserProfileDropdown } from './UserProfileDropdown';
import { useState } from 'react';

interface StudentHeaderProps {
  onMenuClick?: () => void;
}

export function StudentHeader({ onMenuClick }: StudentHeaderProps) {
  const [unreadNotifications] = useState(3); // TODO: Get from Redux/API

  return (
    <header
      className="flex items-center justify-between h-16 md:h-20 px-4 md:px-6 lg:px-8 border-b sticky top-0 z-50"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      {/* Left: Mobile menu + Brand */}
      <div className="flex items-center gap-2 md:gap-4 min-w-max">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10 touch-manipulation"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6" />
        </Button>

        {/* Brand Logo + Title */}
        <div className="flex items-center gap-2 md:gap-3">
          <div
            className="w-9 h-9 md:w-11 md:h-11 rounded-lg flex items-center justify-center font-bold text-base md:text-lg text-primary-foreground flex-shrink-0"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            S
          </div>
          <div className="hidden sm:flex flex-col">
            <span
              className="font-bold text-base md:text-lg leading-tight"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              GiaSuOnline
            </span>
            <span
              className="text-xs md:text-sm leading-tight"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Hỗ trợ Học sinh
            </span>
          </div>
        </div>
      </div>

      {/* Center: Empty spacer for flex layout */}
      <div className="flex-1" />

      {/* Right: Notifications + Settings + User */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 md:h-12 md:w-12 touch-manipulation"
          >
            <Bell className="w-5 h-5 md:w-7 md:h-7" />
            {unreadNotifications > 0 && (
              <span
                className="absolute top-0 right-0 w-5 h-5 md:w-6 md:h-6 text-white text-xs md:text-sm rounded-full flex items-center justify-center font-semibold"
                style={{ backgroundColor: 'hsl(var(--destructive))' }}
              >
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </Button>
        </div>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex h-9 w-9 md:h-12 md:w-12 touch-manipulation"
        >
          <Settings className="w-5 h-5 md:w-7 md:h-7" />
        </Button>

        {/* Divider */}
        <div
          className="w-px h-8 hidden md:block"
          style={{ backgroundColor: 'hsl(var(--border))' }}
        />

        {/* User Profile Dropdown */}
        <UserProfileDropdown />
      </div>
    </header>
  );
}
