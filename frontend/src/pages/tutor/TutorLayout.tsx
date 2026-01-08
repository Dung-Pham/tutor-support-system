import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { TutorSidebar } from '../../components/tutor/TutorSidebar';
import { TutorHeader } from '../../components/tutor/TutorHeader';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export function TutorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      {/* Header - Trên cùng */}
      <TutorHeader onMenuClick={() => setSidebarOpen(true)} />

      {/* Main content - Dưới header */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - Ẩn trên mobile và tablet */}
        <div className="hidden lg:block">
          <TutorSidebar />
        </div>

        {/* Mobile Sidebar - Sheet overlay */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72">
            <TutorSidebar onNavigate={() => setSidebarOpen(false)} />
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

export default TutorLayout;
