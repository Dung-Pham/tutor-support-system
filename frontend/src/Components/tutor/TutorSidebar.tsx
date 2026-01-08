import { NavLink } from 'react-router-dom';
import {
  BookMarked,
  FileText,
  Users,
  Clock,
  TrendingUp,
  MessageCircle,
  CheckCircle2,
  GraduationCap,
  Search,
  Briefcase,
  FolderOpen,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface TutorSidebarProps {
  onNavigate?: () => void;
}

const navItems = [
  { label: 'Bài viết', icon: FileText, to: '/tutor/posts' },
  { label: 'Tạo bài viết', icon: BookMarked, to: '/tutor/create-post' },
  { label: 'Bài viết của tôi', icon: CheckCircle2, to: '/tutor/my-posts' },
  { label: 'Lớp học của tôi', icon: Users, to: '/tutor/classes' },
  { label: 'Tìm lớp học', icon: Search, to: '/tutor/search' },
  { label: 'Đơn ứng tuyển', icon: Briefcase, to: '/tutor/applications' },
  { label: 'Lịch dạy', icon: Clock, to: '/tutor/schedule' },
  { label: 'Bài tập', icon: FileText, to: '/tutor/homework' },
  { label: 'Tài liệu', icon: FolderOpen, to: '/tutor/documents' },
  { label: 'Quản lý học sinh', icon: GraduationCap, to: '/tutor/students' },
  { label: 'Thống kê', icon: TrendingUp, to: '/tutor/statistics' },
  { label: 'Nhắn tin', icon: MessageCircle, to: '/tutor/messages' },
];

export function TutorSidebar({ onNavigate }: TutorSidebarProps = {}) {
  return (
    <aside
      className="flex flex-col h-full w-full md:w-64 border-r"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <div className="flex-1 overflow-y-auto">
        <nav className="py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 md:px-6 py-3.5 md:py-3 text-base md:text-lg cursor-pointer transition-all duration-200',
                  'hover:bg-secondary active:bg-secondary/80',
                  'touch-manipulation min-h-[48px]',
                  isActive && 'border-l-4 font-semibold bg-secondary/50'
                )
              }
              style={({ isActive }) => ({
                color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                borderLeftColor: isActive ? 'hsl(var(--primary))' : 'transparent',
              })}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <Separator />
      <div
        className="px-4 md:px-6 py-3 text-xs md:text-[11px]"
        style={{ color: 'hsl(var(--muted-foreground))' }}
      >
        Hệ thống hỗ trợ giáo viên v1.0
      </div>
    </aside>
  );
}
