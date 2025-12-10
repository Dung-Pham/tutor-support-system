/**
 * File: components/student/UserProfileDropdown.tsx
 * Mục đích: Dropdown menu hiển thị thông tin user và các tùy chọn
 * Vai trò:
 *   - Hiển thị avatar, tên, role
 *   - Menu items: Thông tin cá nhân, Đổi mật khẩu, Cài đặt
 *   - Logout button
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import type { RootState } from '@/store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Lock, Settings, LogOut } from 'lucide-react';

export function UserProfileDropdown() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative focus:outline-none hover:opacity-80 transition-opacity">
          <Avatar className="w-8 h-8 border-2 border-primary/20 cursor-pointer">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {user?.firstName?.[0]?.toUpperCase() || user?.lastName?.[0]?.toUpperCase() || 'S'}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* User Info Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 text-white rounded-t-lg -mx-2 mb-2"
          style={{
            background: 'linear-gradient(to right, hsl(var(--teal) / 0.95), hsl(var(--teal)))',
          }}
        >
          <Avatar className="w-10 h-10 border-2 border-white">
            <AvatarFallback
              className="font-semibold text-white"
              style={{ backgroundColor: 'hsl(var(--teal) / 0.8)' }}
            >
              {user?.firstName?.[0]?.toUpperCase() || user?.lastName?.[0]?.toUpperCase() || 'S'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {user ? `${user.firstName} ${user.lastName}` : 'Học sinh'}
            </p>
            <p className="text-xs truncate" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              {user?.email || 'student@example.com'}
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <DropdownMenuGroup>
          <DropdownMenuLabel
            className="text-xs font-semibold"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            TÀI KHOẢN
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => handleNavigate('/student/profile')}
            className="cursor-pointer gap-2"
          >
            <User className="w-4 h-4" />
            <span>Thông tin cá nhân</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleNavigate('/student/change-password')}
            className="cursor-pointer gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Đổi mật khẩu</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleNavigate('/student/settings')}
            className="cursor-pointer gap-2"
          >
            <Settings className="w-4 h-4" />
            <span>Cài đặt</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout Button */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer gap-2"
          style={{
            color: 'hsl(var(--teal))',
          }}
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
