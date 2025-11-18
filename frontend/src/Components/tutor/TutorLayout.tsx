// src/components/layout/TutorLayout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from './TutorSideBar';
import { TutorHeader } from './TutorHeader';

export function TutorLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <Sidebar />

      {/* Phần nội dung bên phải */}
      <div className="flex flex-1 flex-col">
        <TutorHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
