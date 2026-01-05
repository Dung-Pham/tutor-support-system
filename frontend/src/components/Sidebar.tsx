/**
 * File: components/Sidebar.tsx
 * Mục đích: Sidebar navigation component
 * Vai trò:
 *   - Menu điều hướng chính
 *   - Hiển thị menu items dựa trên role
 *   - Active state highlighting
 */

import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  Calendar,
  FileText,
  BookOpen,
  BarChart3,
  Settings,
  Users
} from 'lucide-react';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ('student' | 'tutor')[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Lịch học',
    path: '/schedule',
    icon: Calendar,
    roles: ['student', 'tutor'],
  },
  {
    name: 'Lớp học của tôi',
    path: '/my-classes',
    icon: Users,
    roles: ['student', 'tutor'],
  },
  {
    name: 'Bài tập',
    path: '/homework',
    icon: FileText,
    roles: ['student', 'tutor'],
  },
  {
    name: 'Tài liệu',
    path: '/documents',
    icon: BookOpen,
    roles: ['student', 'tutor'],
  },
  {
    name: 'Thống kê',
    path: '/statistics',
    icon: BarChart3,
    roles: ['tutor'],
  },
  {
    name: 'Quản lý học sinh',
    path: '/students',
    icon: Users,
    roles: ['tutor'],
  },
  {
    name: 'Cài đặt',
    path: '/settings',
    icon: Settings,
    roles: ['student', 'tutor'],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item =>
    !item.roles || item.roles.includes(user?.role as 'student' | 'tutor')
  );

  const isActive = (path: string) => {
    const role = user?.role?.toUpperCase();
    const baseRoute = role === 'TUTOR' ? '/tutor' : '/student';
    const fullPath = `${baseRoute}${path}`;
    
    if (path === '/schedule') {
      return location.pathname === fullPath || location.pathname === baseRoute;
    }
    if (path === '/homework') {
      return location.pathname.startsWith(`${baseRoute}/homework`);
    }
    return location.pathname.startsWith(fullPath);
  };

  // Get dynamic path based on role
  const getDynamicPath = (path: string) => {
    const role = user?.role?.toUpperCase();
    const baseRoute = role === 'TUTOR' ? '/tutor' : '/student';
    
    // Handle homework special case
    if (path === '/homework') {
      return role === 'TUTOR' ? `${baseRoute}/homework` : `${baseRoute}/homework`;
    }
    
    // All other paths need baseRoute prefix
    return `${baseRoute}${path}`;
  };

  return (
    <div className="bg-white w-64 h-full border-r border-gray-200 flex flex-col">
      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={getDynamicPath(item.path)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${active ? 'text-blue-700' : 'text-gray-500'}`} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Hệ thống hỗ trợ gia sư v1.0
        </div>
      </div>
    </div>
  );
}
