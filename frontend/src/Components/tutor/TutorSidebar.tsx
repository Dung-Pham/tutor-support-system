/**
 * File: components/tutor/TutorSidebar.tsx
 * Mục đích: Sidebar navigation cho tutor
 */

import { NavLink } from 'react-router-dom';
import {
  BookMarked,
  FileText,
  Users,
  Clock,
  TrendingUp,
  Settings,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Bài viết', icon: FileText, to: '/tutor/posts' },
  { label: 'Tạo bài viết', icon: BookMarked, to: '/tutor/create-post' },
  { label: 'Bài viết của tôi', icon: CheckCircle2, to: '/tutor/my-posts' },
  { label: 'Học sinh', icon: Users, to: '/tutor/students' },
  { label: 'Lịch dạy', icon: Clock, to: '/tutor/schedule' },
  { label: 'Thống kê', icon: TrendingUp, to: '/tutor/statistics' },
  { label: 'Nhắn tin', icon: MessageCircle, to: '/tutor/messages' },
  { label: 'Cài đặt', icon: Settings, to: '/tutor/settings' },
];

export function TutorSidebar() {
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
                  'flex items-center gap-3 px-6 py-3 text-lg cursor-pointer transition-all duration-200',
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
        Hệ thống hỗ trợ giáo viên v1.0
      </div>
    </aside>
  );
}
