// src/components/layout/TutorHeader.tsx
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Upload } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/Components/ui/sheet';
import { Menu } from 'lucide-react';
import Sidebar from '@/Components/tutor/TutorSideBar'; // Fixed import path and name
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import type { RootState } from '@/store';

export function TutorHeader() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b bg-white">
      {/* Mobile menu */}
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <span className="font-semibold text-sm">Hỗ trợ Gia sư</span>
      </div>

      {/* Title on desktop */}
      <div className="hidden md:block">
        <span className="font-semibold text-sm">Hỗ trợ Gia sư</span>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <Button
          size="sm"
          className="hidden md:inline-flex gap-2"
          variant="default"
          aria-label="Upload documents"
        >
          <Upload className="w-4 h-4" />
          Upload Tài Liệu
        </Button>

        <div className="flex items-center gap-3">
          <div className="text-right text-sm leading-tight hidden sm:block">
            {user?.firstName || user?.lastName
              ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
              : 'Gia sư'}
            {/* Dynamic user name */}
            <div className="text-xs text-muted-foreground">{user?.role || 'Gia sư'}</div>
            {/* Dynamic role */}
          </div>
          <Avatar className="w-8 h-8">
            <AvatarFallback>
              {user?.firstName?.[0]?.toUpperCase() || user?.lastName?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
            {/* Dynamic avatar fallback */}
          </Avatar>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={handleLogout}
            aria-label="Logout"
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </header>
  );
}
