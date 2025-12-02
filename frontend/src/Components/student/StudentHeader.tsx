// src/components/layout/StudentHeader.tsx
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { StudentSidebar } from './StudentSidebar';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import type { RootState } from '@/store';

export function StudentHeader() {
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
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <StudentSidebar />
          </SheetContent>
        </Sheet>
        <span className="font-semibold text-sm">Hỗ trợ Học sinh</span>
      </div>

      {/* Title desktop */}
      <div className="hidden md:block">
        <span className="font-semibold text-sm">Hỗ trợ Học sinh</span>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Có thể thêm nút nào đó sau, tạm để trống */}
        {/* <Button size="sm" variant="outline">Nút gì đó</Button> */}

        <div className="flex items-center gap-3">
          <div className="text-right text-sm leading-tight hidden sm:block">
            <div className="font-semibold">
              {user ? `${user.firstName} ${user.lastName}` : 'Học sinh'}
            </div>
            <div className="text-xs text-muted-foreground">{user?.role || 'Học sinh'}</div>
          </div>
          <Avatar className="w-8 h-8">
            <AvatarFallback>
              {user?.firstName?.[0]?.toUpperCase() || user?.lastName?.[0]?.toUpperCase() || 'S'}
            </AvatarFallback>
          </Avatar>
          <Button size="sm" variant="ghost" className="text-xs" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>
      </div>
    </header>
  );
}
