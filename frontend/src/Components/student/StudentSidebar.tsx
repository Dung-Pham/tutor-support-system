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

export function StudentSidebar() {
  return (
    <aside
      className="hidden md:flex md:flex-col w-64 border-r"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <div className="flex-1 overflow-y-auto">
        <nav className="py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-6 py-2 text-sm cursor-pointer transition-all duration-200',
                  'hover:bg-secondary',
                  isActive && 'border-l-4 font-semibold'
                )
              }
              style={({ isActive }) => ({
                color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                borderLeftColor: isActive ? 'hsl(var(--primary))' : 'transparent',
              })}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <Separator />
      <div className="px-6 py-3 text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
        Hệ thống hỗ trợ học sinh v1.0
      </div>
    </aside>
  );
}
