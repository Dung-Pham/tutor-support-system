// src/components/layout/StudentLayout.tsx
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { StudentSidebar } from '../../components/student/StudentSidebar';
import { StudentHeader } from '../../components/student/StudentHeader';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('');

  return (
    <div className="flex flex-col h-screen">
      {/* Header - Trên cùng */}
      <StudentHeader 
        onMenuClick={() => setSidebarOpen(true)}
        onTabChange={setCurrentTab}
      />

      {/* Main content - Dưới header */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - Ẩn trên mobile */}
        <div className="hidden md:block">
          <StudentSidebar />
        </div>

        {/* Mobile Sidebar - Sheet overlay */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72">
            <VisuallyHidden>
              <SheetTitle>Menu điều hướng</SheetTitle>
            </VisuallyHidden>
            <StudentSidebar onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Content area - Full width trên mobile, flex-1 trên desktop */}
        <main
          className="flex-1 w-full overflow-y-auto p-3 sm:p-4 md:p-6"
          style={{ backgroundColor: 'hsl(var(--background))' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
