// src/components/layout/StudentLayout.tsx
import { Outlet } from 'react-router-dom';
import { StudentSidebar } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';

export function StudentLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <StudentSidebar />

      {/* Nội dung bên phải */}
      <div className="flex flex-1 flex-col">
        <StudentHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
