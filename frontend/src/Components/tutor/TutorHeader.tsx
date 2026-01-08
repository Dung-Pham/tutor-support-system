import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfileDropdown } from '../student/UserProfileDropdown';
import { NotificationBell } from '@/Components/Notifications/NotificationBell';

interface TutorHeaderProps {
  onMenuClick?: () => void;
  onTabChange?: (tab: string) => void; // ✅ THÊM
}

export function TutorHeader({ onMenuClick, onTabChange }: TutorHeaderProps) {

  return (
    <header
      className="flex items-center justify-between h-14 md:h-16 px-4 md:px-6 border-b sticky top-0 z-50"
      style={{
        backgroundColor: 'hsl(var(--background))',
        borderColor: 'hsl(var(--border))',
      }}
    >
      {/* Left: Mobile Menu + Logo/Brand */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 touch-manipulation"
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
        {/* ✅ Use NotificationBell component instead of mock */}
        <NotificationBell 
          className="h-9 w-9 md:h-10 md:w-10"
          onTabChange={onTabChange}
        />

        {/* User profile dropdown */}
        <UserProfileDropdown />
      </div>
    </header>
  );
}
