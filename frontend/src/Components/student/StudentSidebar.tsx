// src/components/layout/StudentSidebar.tsx
import { NavLink } from 'react-router-dom';
import { CalendarRange, BookOpen, ClipboardList, BarChart2, Settings } from 'lucide-react';
import { Separator } from '@/Components/ui/separator';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Lịch học', icon: CalendarRange, to: '/student/schedule' },
  { label: 'Lớp học của tôi', icon: BookOpen, to: '/student/classes' },
  { label: 'Bài tập', icon: ClipboardList, to: '/student/assignments' },
  { label: 'Bài viết chung', icon: BookOpen, to: '/student/posts' },
  { label: 'Tài liệu', icon: BookOpen, to: '/student/documents' },
  { label: 'Thống kê', icon: BarChart2, to: '/student/statistics' },
  { label: 'Cài đặt', icon: Settings, to: '/student/settings' },
];

export function StudentSidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r bg-white">
      <div className="flex items-center px-6 h-16 border-b">
        <span className="text-sm font-semibold tracking-wide">Hệ thống hỗ trợ học sinh</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-6 py-2 text-sm cursor-pointer transition-all',
                  'text-muted-foreground hover:bg-slate-100',
                  isActive && 'bg-slate-100 text-slate-900 border-l-4 border-primary'
                )
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <Separator />
      <div className="px-6 py-3 text-[11px] text-muted-foreground">
        Hệ thống hỗ trợ học sinh v1.0
      </div>
    </aside>
  );
}
