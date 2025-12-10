// src/components/student/StudentHeader.tsx
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Bell, Settings } from 'lucide-react';
import { StudentSidebar } from './StudentSidebar';
import { UserProfileDropdown } from './UserProfileDropdown';
import { useState } from 'react';

export function StudentHeader() {
  const [unreadNotifications] = useState(3); // TODO: Get from Redux/API

  return (
    <header
      className="flex items-center justify-between h-16 px-4 md:px-6 border-b"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      {/* Left: Mobile menu + Brand */}
      <div className="flex items-center gap-3 min-w-max">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <StudentSidebar />
          </SheetContent>
        </Sheet>

        {/* Brand Logo + Title */}
        <div className="items-center gap-2 hidden md:flex">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-primary-foreground"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            S
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>
              GiaSuOnline
            </span>
            <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Hỗ trợ Học sinh
            </span>
          </div>
        </div>
      </div>

      {/* Center: Empty spacer for flex layout */}
      <div className="flex-1" />

      {/* Right: Notifications + Settings + User */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span
                className="absolute top-0 right-0 w-4 h-4 text-white text-xs rounded-full flex items-center justify-center font-semibold"
                style={{ backgroundColor: 'hsl(var(--destructive))' }}
              >
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </Button>
        </div>

        {/* Settings */}
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <Settings className="w-5 h-5" />
        </Button>

        {/* Divider */}
        <div
          className="w-px h-6 hidden md:block"
          style={{ backgroundColor: 'hsl(var(--border))' }}
        />

        {/* User Profile Dropdown */}
        <UserProfileDropdown />
      </div>
    </header>
  );
}
