// src/components/layout/StudentSidebar.tsx
import { NavLink } from 'react-router-dom';
import {
  CalendarRange,
  BookOpen,
  ClipboardList,
  BarChart2,
  Settings,
  MessageCircle,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface StudentSidebarProps {
  onNavigate?: () => void;
}

const navItems = [
  { label: 'Lịch học', icon: CalendarRange, to: '/student/schedule' },
  { label: 'Lớp học của tôi', icon: BookOpen, to: '/student/classes' },
  { label: 'Bài tập', icon: ClipboardList, to: '/student/assignments' },
  { label: 'Bài viết chung', icon: BookOpen, to: '/student/posts' },
  { label: 'Tài liệu', icon: BookOpen, to: '/student/documents' },
  { label: 'Nhắn tin', icon: MessageCircle, to: '/student/messages' },
  { label: 'Thống kê', icon: BarChart2, to: '/student/statistics' },
  { label: 'Cài đặt', icon: Settings, to: '/student/settings' },
];

export function StudentSidebar({ onNavigate }: StudentSidebarProps = {}) {
  return (
    <aside className="flex flex-col h-full w-full sm:w-64 md:w-72 lg:w-80 border-r bg-background">
      <div className="flex-1 overflow-y-auto">
        <nav className="py-2 sm:py-4 md:py-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-3.5 md:py-3',
                  'text-sm sm:text-base cursor-pointer transition-all duration-200',
                  'hover:bg-secondary/60 active:bg-secondary/80',
                  'touch-manipulation min-h-[44px] sm:min-h-[48px]',
                  isActive && 'border-l-4 font-semibold bg-secondary/50 shadow-sm'
                )
              }
              style={({ isActive }) => ({
                color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                borderLeftColor: isActive ? 'hsl(var(--primary))' : 'transparent',
              })}
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="truncate font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <Separator />
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-muted-foreground">
        Hệ thống hỗ trợ học sinh v1.0
      </div>
    </aside>
  );
}
