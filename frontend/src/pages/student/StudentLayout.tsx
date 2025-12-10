// src/components/layout/StudentLayout.tsx
import { Outlet } from 'react-router-dom';
import { StudentSidebar } from '../../components/student/StudentSidebar';
import { StudentHeader } from '../../components/student/StudentHeader';

export function StudentLayout() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header - Trên cùng */}
      <StudentHeader />

      {/* Main content - Dưới header */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Trái */}
        <StudentSidebar />

        {/* Content area - Phải */}
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          style={{ backgroundColor: 'hsl(var(--background))' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
